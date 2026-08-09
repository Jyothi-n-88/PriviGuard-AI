export type RemediationStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DPO_VERIFIED' | 'CLOSED';
export type RemediationPriority = 'low' | 'medium' | 'high' | 'critical';
export type RemediationSourceType = 'risk_finding' | 'ai_compliance_gap' | 'dpo_recommendation' | 'other';

export interface Remediation {
  _id: string;
  organizationId: string;
  assessmentId: string;
  title: string;
  description: string;
  sourceType: RemediationSourceType;
  sourceReference?: string;
  priority: RemediationPriority;
  status: RemediationStatus;
  assignedTo?: { _id: string; name: string; email: string };
  createdBy: { _id: string; name: string; email: string };
  dueDate?: string;
  completionDate?: string;
  completionNotes?: string;
  evidenceRef?: string;
  dpoVerifiedBy?: { _id: string; name: string; email: string };
  dpoVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRemediationRequest {
  title: string;
  description: string;
  sourceType: RemediationSourceType;
  sourceReference?: string;
  priority: RemediationPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateRemediationRequest {
  title?: string;
  description?: string;
  priority?: RemediationPriority;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateRemediationStatusRequest {
  status: RemediationStatus;
  completionNotes?: string;
  evidenceRef?: string;
}

export interface VerifyRemediationRequest {
  action: 'verify' | 'reopen';
  comments?: string;
}

export interface RemediationResponse {
  success: boolean;
  data: Remediation;
}

export interface RemediationsListResponse {
  success: boolean;
  data: Remediation[];
}
