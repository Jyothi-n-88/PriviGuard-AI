export interface AuditLog {
  _id: string;
  organizationId: string;
  assessmentId: string;
  actorId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  actorRole: string;
  action: 'assessment_created' | 'assessment_updated' | 'risk_recalculated' | 'ai_report_generated' | 'dpo_approved' | 'dpo_rejected' | 'dpo_reassessment_requested';
  details?: any;
  createdAt: string;
}

export interface AssessmentVersion {
  _id: string;
  organizationId: string;
  assessmentId: string;
  versionNumber: number;
  changedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  factualData: any;
  calculatedRiskScore?: number;
  calculatedRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
}

export interface AssessmentVersionsResponse {
  success: boolean;
  data: AssessmentVersion[];
}
