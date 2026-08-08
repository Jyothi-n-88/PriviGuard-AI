import api from './api';
import { Assessment } from '../types/assessment';

export interface DashboardSummary {
  privacyPostureScore: number | null;
  activeRisks: number;
  pendingAssessments: number;
  remediationTasks: number;
  recentAssessments: Assessment[];
  aiInsights: string[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardSummary;
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/dashboard/summary');
    return response.data;
  }
};
