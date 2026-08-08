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
};
