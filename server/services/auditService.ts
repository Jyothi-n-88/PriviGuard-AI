import { AuditLog } from '../models/AuditLog';
import { AssessmentVersion } from '../models/AssessmentVersion';
import mongoose from 'mongoose';
import { IAssessment } from '../models/Assessment';

export const createAuditLog = async (params: {
  organizationId: string | mongoose.Types.ObjectId;
  assessmentId: string | mongoose.Types.ObjectId;
  actorId: string | mongoose.Types.ObjectId;
  actorRole: string;
  action: 'assessment_created' | 'assessment_updated' | 'risk_recalculated' | 'ai_report_generated' | 'dpo_approved' | 'dpo_rejected' | 'dpo_reassessment_requested' | 'remediation_created' | 'remediation_assigned' | 'remediation_updated' | 'remediation_started' | 'remediation_completed' | 'remediation_verified' | 'remediation_closed' | 'remediation_reopened';
  details?: any;
}) => {
  try {
    await AuditLog.create(params);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export const createAssessmentVersion = async (assessment: IAssessment, changedBy: string | mongoose.Types.ObjectId) => {
  try {
    const factualData = {
      title: assessment.title,
      processingActivity: assessment.processingActivity,
      purpose: assessment.purpose,
      status: assessment.status,
      description: assessment.description,
      personalDataCategories: assessment.personalDataCategories,
      dataSubjects: assessment.dataSubjects,
      dataSource: assessment.dataSource,
      storageLocation: assessment.storageLocation,
      retentionPeriod: assessment.retentionPeriod,
      thirdPartyProcessors: assessment.thirdPartyProcessors,
      dataSharing: assessment.dataSharing,
      securityMeasures: assessment.securityMeasures,
    };

    await AssessmentVersion.create({
      organizationId: assessment.organizationId,
      assessmentId: assessment._id,
      versionNumber: assessment.version,
      changedBy,
      factualData,
      calculatedRiskScore: assessment.calculatedRiskScore,
      calculatedRiskLevel: assessment.calculatedRiskLevel,
    });
  } catch (error) {
    console.error('Failed to create assessment version:', error);
  }
};
