import { RequestHandler } from 'express';
import { Assessment } from '../models/Assessment';
import { AuthRequest } from '../middleware/auth';

export const getDashboardSummary: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessments = await Assessment.find({ organizationId }).sort({ updatedAt: -1 });

    const aiInsights: string[] = [];
    const remediationTasks = 0;
    
    let activeRisks = 0;
    let pendingAssessments = 0;
    
    let scoredAssessmentsCount = 0;
    let totalRiskScore = 0;

    assessments.forEach(a => {
      if (a.status === 'draft' || a.status === 'in_progress') {
        pendingAssessments++;
      }
      
      if (a.riskFindings && a.riskFindings.length > 0) {
        // Only count findings with severity higher than low as "active risks" or however defined.
        // The instructions say: "Calculate this from actual stored assessment/risk data."
        activeRisks += a.riskFindings.filter(f => f.severity !== 'low').length;
      } else if (a.calculatedRiskLevel === 'high' || a.calculatedRiskLevel === 'critical') {
        activeRisks += 1;
      }
      
      if (a.calculatedRiskScore !== undefined && a.calculatedRiskScore !== null) {
        scoredAssessmentsCount++;
        totalRiskScore += a.calculatedRiskScore;
      }
    });

    const privacyPostureScore = scoredAssessmentsCount > 0 
      ? Math.round(100 - (totalRiskScore / scoredAssessmentsCount)) 
      : null;

    const recentAssessments = assessments.slice(0, 5);

    res.json({
      success: true,
      data: {
        privacyPostureScore,
        activeRisks,
        pendingAssessments,
        remediationTasks,
        recentAssessments,
        aiInsights
      }
    });
  } catch (error) {
    next(error);
  }
};
