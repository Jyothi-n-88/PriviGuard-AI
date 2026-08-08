export interface RiskFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  reason: string;
  recommendation: string;
  points?: number;
}

export interface Assessment {
  _id: string;
  organizationId: string;
  title: string;
  processingActivity: string;
  purpose: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  description?: string;
  personalDataCategories?: string[];
  dataSubjects?: string[];
  dataSource?: string;
  storageLocation?: string;
  retentionPeriod?: string;
  thirdPartyProcessors?: string[];
  dataSharing?: string;
  securityMeasures?: string;
  riskLikelihood?: 'low' | 'medium' | 'high';
  riskImpact?: 'low' | 'medium' | 'high';
  calculatedRiskScore?: number;
  calculatedRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  riskFactors?: string[];
  riskFindings?: RiskFinding[];
  riskEngineVersion?: string;
  riskCalculatedAt?: string;
  identifiedRisks?: string[];
  mitigationMeasures?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResponse {
  success: boolean;
  message?: string;
  data: Assessment;
}

export interface AssessmentsListResponse {
  success: boolean;
  message?: string;
  data: Assessment[];
}

export interface CreateAssessmentRequest {
  title: string;
  processingActivity: string;
  purpose: string;
  status?: string;
  description?: string;
  personalDataCategories?: string[];
  dataSubjects?: string[];
  dataSource?: string;
  storageLocation?: string;
  retentionPeriod?: string;
  thirdPartyProcessors?: string[];
  dataSharing?: string;
  securityMeasures?: string;
  riskLikelihood?: string;
  riskImpact?: string;
  identifiedRisks?: string[];
  mitigationMeasures?: string;
}

export interface UpdateAssessmentRequest extends Partial<CreateAssessmentRequest> {}
