import { RequestHandler } from 'express';
import { Assessment } from '../models/Assessment';
import { AuthRequest } from '../middleware/auth';
import { calculatePrivacyRisk } from '../services/riskEngine';

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

    const riskResult = calculatePrivacyRisk(data);

    const assessment = new Assessment({
      ...data,
      organizationId,
      calculatedRiskScore: riskResult.score,
      calculatedRiskLevel: riskResult.level,
      riskFactors: riskResult.factors,
      riskFindings: riskResult.findings,
      riskEngineVersion: riskResult.version,
      riskCalculatedAt: riskResult.calculatedAt,
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

    const assessment = await Assessment.findOne({ _id: req.params.id, organizationId });
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found' });
      return;
    }

    Object.assign(assessment, data);

    const riskResult = calculatePrivacyRisk(assessment.toObject());
    assessment.calculatedRiskScore = riskResult.score;
    assessment.calculatedRiskLevel = riskResult.level as any;
    assessment.riskFactors = riskResult.factors;
    assessment.riskFindings = riskResult.findings;
    assessment.riskEngineVersion = riskResult.version;
    assessment.riskCalculatedAt = riskResult.calculatedAt;

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

    const riskResult = calculatePrivacyRisk(assessment.toObject());
    
    assessment.calculatedRiskScore = riskResult.score;
    assessment.calculatedRiskLevel = riskResult.level as any;
    assessment.riskFactors = riskResult.factors;
    assessment.riskFindings = riskResult.findings;
    assessment.riskEngineVersion = riskResult.version;
    assessment.riskCalculatedAt = riskResult.calculatedAt;

    await assessment.save();

    res.json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};
