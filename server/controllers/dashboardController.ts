import { RequestHandler } from 'express';
import { Assessment } from '../models/Assessment';
import { Remediation } from '../models/Remediation';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getDashboardSummary: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const orgId = new mongoose.Types.ObjectId(organizationId as string);

    // 1. Aggregate Assessment Data
    const assessmentAggregation = await Assessment.aggregate([
      { $match: { organizationId: orgId } },
      {
        $group: {
          _id: null,
          totalAssessments: { $sum: 1 },
          highRiskAssessments: {
            $sum: { $cond: [{ $eq: ["$calculatedRiskLevel", "high"] }, 1, 0] }
          },
          mediumRiskAssessments: {
            $sum: { $cond: [{ $eq: ["$calculatedRiskLevel", "medium"] }, 1, 0] }
          },
          lowRiskAssessments: {
            $sum: { $cond: [{ $eq: ["$calculatedRiskLevel", "low"] }, 1, 0] }
          },
          criticalRiskAssessments: {
            $sum: { $cond: [{ $eq: ["$calculatedRiskLevel", "critical"] }, 1, 0] }
          },
          pendingDpoReviews: {
            $sum: { $cond: [{ $eq: ["$dpoReviewStatus", "pending"] }, 1, 0] }
          },
          approvedAssessments: {
            $sum: { $cond: [{ $eq: ["$dpoReviewStatus", "approved"] }, 1, 0] }
          },
          rejectedAssessments: {
            $sum: { $cond: [{ $eq: ["$dpoReviewStatus", "rejected"] }, 1, 0] }
          },
          reassessmentRequired: {
            $sum: { $cond: [{ $eq: ["$dpoReviewStatus", "reassessed"] }, 1, 0] }
          },
          reportsGenerated: {
            $sum: { $cond: [{ $ne: [{ $type: "$aiReportGeneratedAt" }, "missing"] }, 1, 0] }
          },
          freshReports: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: [{ $type: "$aiReportGeneratedAt" }, "missing"] },
                    { $gte: ["$aiReportGeneratedAt", "$aiReportAssessmentUpdatedAt"] }
                  ]
                }, 1, 0
              ]
            }
          },
          staleReports: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: [{ $type: "$aiReportGeneratedAt" }, "missing"] },
                    { $lt: ["$aiReportGeneratedAt", "$aiReportAssessmentUpdatedAt"] }
                  ]
                }, 1, 0
              ]
            }
          }
        }
      }
    ]);

    const assessmentStats = assessmentAggregation[0] || {
      totalAssessments: 0,
      highRiskAssessments: 0,
      mediumRiskAssessments: 0,
      lowRiskAssessments: 0,
      criticalRiskAssessments: 0,
      pendingDpoReviews: 0,
      approvedAssessments: 0,
      rejectedAssessments: 0,
      reassessmentRequired: 0,
      reportsGenerated: 0,
      freshReports: 0,
      staleReports: 0
    };

    // 2. Aggregate Remediation Data
    const currentDate = new Date();
    const remediationAggregation = await Remediation.aggregate([
      { $match: { organizationId: orgId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "OPEN"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          dpoVerified: { $sum: { $cond: [{ $eq: ["$status", "DPO_VERIFIED"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "CLOSED"] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: [{ $type: "$dueDate" }, "missing"] },
                    { $lt: ["$dueDate", currentDate] },
                    { $not: { $in: ["$status", ["COMPLETED", "DPO_VERIFIED", "CLOSED"]] } }
                  ]
                }, 1, 0
              ]
            }
          },
          critical: { $sum: { $cond: [{ $eq: ["$priority", "critical"] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } }
        }
      }
    ]);

    const remediationStats = remediationAggregation[0] || {
      total: 0, open: 0, inProgress: 0, completed: 0, dpoVerified: 0,
      closed: 0, overdue: 0, critical: 0, high: 0, medium: 0, low: 0
    };

    // 3. Top Risk Assessments (Highest score first, limit 5)
    const topRiskAssessments = await Assessment.find({
      organizationId: orgId,
      calculatedRiskScore: { $ne: null }
    })
      .sort({ calculatedRiskScore: -1 })
      .limit(5)
      .select('title calculatedRiskScore calculatedRiskLevel dpoReviewStatus updatedAt');

    // Combine response
    res.json({
      success: true,
      data: {
        overview: {
          totalAssessments: assessmentStats.totalAssessments,
          criticalRiskAssessments: assessmentStats.criticalRiskAssessments,
          highRiskAssessments: assessmentStats.highRiskAssessments,
          mediumRiskAssessments: assessmentStats.mediumRiskAssessments,
          lowRiskAssessments: assessmentStats.lowRiskAssessments,
          pendingDpoReviews: assessmentStats.pendingDpoReviews,
          approvedAssessments: assessmentStats.approvedAssessments,
          rejectedAssessments: assessmentStats.rejectedAssessments,
          reassessmentRequired: assessmentStats.reassessmentRequired
        },
        riskDistribution: {
          critical: assessmentStats.criticalRiskAssessments,
          high: assessmentStats.highRiskAssessments,
          medium: assessmentStats.mediumRiskAssessments,
          low: assessmentStats.lowRiskAssessments
        },
        remediation: {
          total: remediationStats.total,
          open: remediationStats.open,
          inProgress: remediationStats.inProgress,
          completed: remediationStats.completed,
          dpoVerified: remediationStats.dpoVerified,
          closed: remediationStats.closed,
          overdue: remediationStats.overdue,
          critical: remediationStats.critical,
          high: remediationStats.high,
          medium: remediationStats.medium,
          low: remediationStats.low
        },
        aiGovernance: {
          reportsGenerated: assessmentStats.reportsGenerated,
          freshReports: assessmentStats.freshReports,
          staleReports: assessmentStats.staleReports,
          reportsUnavailable: assessmentStats.totalAssessments - assessmentStats.reportsGenerated
        },
        topRiskAssessments
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getDashboardActivity: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const activity = await AuditLog.find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('actorId', 'name email')
      .populate('assessmentId', 'title');

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};
