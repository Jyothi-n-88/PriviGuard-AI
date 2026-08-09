import api from './api';

export interface DashboardOverview {
  totalAssessments: number;
  criticalRiskAssessments: number;
  highRiskAssessments: number;
  mediumRiskAssessments: number;
  lowRiskAssessments: number;
  pendingDpoReviews: number;
  approvedAssessments: number;
  rejectedAssessments: number;
  reassessmentRequired: number;
}

export interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RemediationStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  dpoVerified: number;
  closed: number;
  overdue: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AIGovernanceStats {
  reportsGenerated: number;
  freshReports: number;
  staleReports: number;
  reportsUnavailable: number;
}

export interface TopRiskAssessment {
  _id: string;
  title: string;
  calculatedRiskScore: number;
  calculatedRiskLevel: string;
  dpoReviewStatus: string;
  updatedAt: string;
}

export interface DashboardSummary {
  overview: DashboardOverview;
  riskDistribution: RiskDistribution;
  remediation: RemediationStats;
  aiGovernance: AIGovernanceStats;
  topRiskAssessments: TopRiskAssessment[];
}

export interface DashboardActivity {
  _id: string;
  action: string;
  actorId: {
    _id: string;
    name: string;
    email: string;
  };
  actorRole: string;
  assessmentId?: {
    _id: string;
    title: string;
  };
  createdAt: string;
}

export const dashboardService = {
  getOverview: async () => {
    const response = await api.get<{ success: boolean; data: DashboardSummary }>('/dashboard/overview');
    return response.data;
  },
  getActivity: async () => {
    const response = await api.get<{ success: boolean; data: DashboardActivity[] }>('/dashboard/activity');
    return response.data;
  }
};
