import { RequestHandler } from 'express';
import { Assessment } from '../models/Assessment';
import { AuthRequest } from '../middleware/auth';
import { calculatePrivacyRisk, deriveBaseRiskIndicators } from '../services/riskEngine';
import { analyzeAssessmentWithAI, generateComprehensivePrivacyReport } from '../services/geminiService';
import { createAuditLog, createAssessmentVersion } from '../services/auditService';

const applyRiskAnalysis = async (assessmentData: any) => {
  const aiResult = await analyzeAssessmentWithAI(assessmentData);
  
  if (aiResult) {
    assessmentData.riskLikelihood = aiResult.derivedLikelihood;
    assessmentData.riskImpact = aiResult.derivedImpact;
    assessmentData.aiInsights = aiResult.insights;
    assessmentData.aiRecommendations = aiResult.recommendations;
    assessmentData.isAiGenerated = true;
  } else {
    const derived = deriveBaseRiskIndicators(assessmentData);
    assessmentData.riskLikelihood = derived.likelihood;
    assessmentData.riskImpact = derived.impact;
    assessmentData.aiInsights = [];
    assessmentData.aiRecommendations = [];
    assessmentData.isAiGenerated = false;
  }

  const riskResult = calculatePrivacyRisk(assessmentData);
  
  return {
    ...assessmentData,
    calculatedRiskScore: riskResult.score,
    calculatedRiskLevel: riskResult.level,
    riskFactors: riskResult.factors,
    riskFindings: riskResult.findings,
    riskEngineVersion: riskResult.version,
    riskCalculatedAt: riskResult.calculatedAt,
    dpoReviewStatus: 'pending' // Reset review status when recalculated
  };
};

export const createAssessment: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const data = { ...req.body };
    // Multi-tenant safety & preventing frontend from dictating risk
    delete data.organizationId;
    delete data.calculatedRiskScore;
    delete data.calculatedRiskLevel;
    delete data.riskFactors;
    delete data.riskFindings;
    delete data.riskEngineVersion;
    delete data.riskCalculatedAt;
    delete data.aiInsights;
    delete data.aiRecommendations;
    delete data.isAiGenerated;
    delete data.dpoReviewStatus;
    delete data.dpoReviewComment;

    const analyzedData = await applyRiskAnalysis(data);

    const assessment = new Assessment({
      ...analyzedData,
      organizationId,
    });

    await assessment.save();

    await createAssessmentVersion(assessment, req.user.userId);
    await createAuditLog({
      organizationId,
      assessmentId: assessment._id,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'assessment_created'
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { AuditLog } = await import('../models/AuditLog');
    const logs = await AuditLog.find({ assessmentId: req.params.id, organizationId })
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentVersions: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { AssessmentVersion } = await import('../models/AssessmentVersion');
    const versions = await AssessmentVersion.find({ assessmentId: req.params.id, organizationId })
      .populate('changedBy', 'name email role')
      .sort({ versionNumber: -1 });

    res.json({ success: true, data: versions });
  } catch (error) {
    next(error);
  }
};
export const getAssessments: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessments = await Assessment.find({ organizationId }).sort({ createdAt: -1 });
    res.json({ success: true, data: assessments });
  } catch (error) {
    next(error);
  }
};

export const getAssessment: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessment = await Assessment.findOne({ _id: req.params.id, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

export const updateAssessment: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const data = { ...req.body };
    delete data.organizationId;
    delete data.calculatedRiskScore;
    delete data.calculatedRiskLevel;
    delete data.riskFactors;
    delete data.riskFindings;
    delete data.riskEngineVersion;
    delete data.riskCalculatedAt;
    delete data.aiInsights;
    delete data.aiRecommendations;
    delete data.isAiGenerated;
    delete data.dpoReviewStatus;
    delete data.dpoReviewComment;

    const assessment = await Assessment.findOne({ _id: req.params.id, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    Object.assign(assessment, data);

    const analyzedData = await applyRiskAnalysis(assessment.toObject());
    delete analyzedData._id; delete analyzedData.organizationId; delete analyzedData.__v; delete analyzedData.createdAt; delete analyzedData.updatedAt; Object.assign(assessment, analyzedData);

    assessment.version += 1;
    await assessment.save();

    await createAssessmentVersion(assessment, req.user.userId);
    await createAuditLog({
      organizationId,
      assessmentId: assessment._id,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'assessment_updated'
    });

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

export const deleteAssessment: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessment = await Assessment.findOneAndDelete({ _id: req.params.id, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error) {
    next(error);
  }
};

export const recalculateRisk: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessment = await Assessment.findOne({ _id: req.params.id, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    const analyzedData = await applyRiskAnalysis(assessment.toObject());
    delete analyzedData._id; delete analyzedData.organizationId; delete analyzedData.__v; delete analyzedData.createdAt; delete analyzedData.updatedAt; Object.assign(assessment, analyzedData);

    await assessment.save();

    await createAuditLog({
      organizationId,
      assessmentId: assessment._id,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'risk_recalculated',
      details: {
        calculatedRiskScore: assessment.calculatedRiskScore,
        calculatedRiskLevel: assessment.calculatedRiskLevel
      }
    });

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

export const submitDpoReview: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { status, comment } = req.body;

    if ((status === 'rejected' || status === 'reassessed') && (!comment || comment.trim() === '')) {
      res.status(400).json({ success: false, message: `A comment is required when status is ${status}` });
      return;
    }

    const assessment = await Assessment.findOne({ _id: req.params.id, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    assessment.dpoReviewStatus = status;
    if (comment !== undefined) {
      assessment.dpoReviewComment = comment;
    }
    assessment.dpoReviewedBy = req.user.userId as any;
    assessment.dpoReviewedAt = new Date();

    await assessment.save();

    let action: any = 'dpo_approved';
    if (status === 'rejected') action = 'dpo_rejected';
    else if (status === 'reassessed') action = 'dpo_reassessment_requested';
    else if (status === 'pending') action = 'dpo_reassessment_requested'; // fallback

    await createAuditLog({
      organizationId,
      assessmentId: assessment._id,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action
    });

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

export const generateReport: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessment = await Assessment.findOne({ _id: req.params.id, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    const aiReport = await generateComprehensivePrivacyReport(assessment.toObject());

    if (!aiReport) {
      res.status(503).json({ success: false, message: 'AI report generation failed or is unavailable' });
      return;
    }

    assessment.executiveSummary = aiReport.executiveSummary;
    assessment.complianceGaps = aiReport.complianceGaps;
    assessment.riskExplanation = aiReport.riskExplanation;
    assessment.aiReportRecommendations = aiReport.recommendations;
    assessment.aiReportGeneratedAt = new Date();
    assessment.aiReportAssessmentUpdatedAt = new Date();

    await assessment.save();

    await createAuditLog({
      organizationId,
      assessmentId: assessment._id,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: 'ai_report_generated'
    });

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};
