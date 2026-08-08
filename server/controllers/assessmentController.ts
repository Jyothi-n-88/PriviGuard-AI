import { RequestHandler } from 'express';
import { Assessment } from '../models/Assessment';
import { AuthRequest } from '../middleware/auth';
import { calculatePrivacyRisk, deriveBaseRiskIndicators } from '../services/riskEngine';
import { analyzeAssessmentWithAI } from '../services/geminiService';

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

    res.status(201).json({ success: true, data: assessment });
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
    Object.assign(assessment, analyzedData);

    await assessment.save();

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
    Object.assign(assessment, analyzedData);

    await assessment.save();

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

    await assessment.save();

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};
