import api from './api';
import {
  AssessmentResponse,
  AssessmentsListResponse,
  CreateAssessmentRequest,
  UpdateAssessmentRequest
} from '../types/assessment';

export const assessmentService = {
  getAssessments: async (): Promise<AssessmentsListResponse> => {
    const response = await api.get<AssessmentsListResponse>('/assessments');
    return response.data;
  },

  getAssessment: async (id: string): Promise<AssessmentResponse> => {
    const response = await api.get<AssessmentResponse>(`/assessments/${id}`);
    return response.data;
  },

  createAssessment: async (data: CreateAssessmentRequest): Promise<AssessmentResponse> => {
    const response = await api.post<AssessmentResponse>('/assessments', data);
    return response.data;
  },

  updateAssessment: async (id: string, data: UpdateAssessmentRequest): Promise<AssessmentResponse> => {
    const response = await api.put<AssessmentResponse>(`/assessments/${id}`, data);
    return response.data;
  },

  deleteAssessment: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/assessments/${id}`);
    return response.data;
  },

  recalculateRisk: async (id: string): Promise<AssessmentResponse> => {
    const response = await api.post<AssessmentResponse>(`/assessments/${id}/recalculate-risk`);
    return response.data;
  },

  submitDpoReview: async (id: string, status: string, comment?: string): Promise<AssessmentResponse> => {
    const response = await api.put<AssessmentResponse>(`/assessments/${id}/review`, { status, comment });
    return response.data;
  },

  generatePrivacyReport: async (id: string): Promise<AssessmentResponse> => {
    const response = await api.post<AssessmentResponse>(`/assessments/${id}/generate-report`);
    return response.data;
  },
  getAuditLogs: async (id: string): Promise<import('../types/audit').AuditLogsResponse> => {
    const response = await api.get<import('../types/audit').AuditLogsResponse>(`/assessments/${id}/audit`);
    return response.data;
  },
  getAssessmentVersions: async (id: string): Promise<import('../types/audit').AssessmentVersionsResponse> => {
    const response = await api.get<import('../types/audit').AssessmentVersionsResponse>(`/assessments/${id}/versions`);
    return response.data;
  },
};
