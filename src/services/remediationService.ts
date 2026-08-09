import api from './api';
import {
  RemediationResponse,
  RemediationsListResponse,
  CreateRemediationRequest,
  UpdateRemediationRequest,
  UpdateRemediationStatusRequest,
  VerifyRemediationRequest,
} from '../types/remediation';

export const remediationService = {
  createRemediation: async (assessmentId: string, data: CreateRemediationRequest): Promise<RemediationResponse> => {
    const response = await api.post<RemediationResponse>(`/assessments/${assessmentId}/remediations`, data);
    return response.data;
  },
  
  getAssessmentRemediations: async (assessmentId: string): Promise<RemediationsListResponse> => {
    const response = await api.get<RemediationsListResponse>(`/assessments/${assessmentId}/remediations`);
    return response.data;
  },

  getRemediations: async (): Promise<RemediationsListResponse> => {
    const response = await api.get<RemediationsListResponse>('/remediations');
    return response.data;
  },

  getRemediation: async (id: string): Promise<RemediationResponse> => {
    const response = await api.get<RemediationResponse>(`/remediations/${id}`);
    return response.data;
  },

  updateRemediation: async (id: string, data: UpdateRemediationRequest): Promise<RemediationResponse> => {
    const response = await api.put<RemediationResponse>(`/remediations/${id}`, data);
    return response.data;
  },

  updateRemediationStatus: async (id: string, data: UpdateRemediationStatusRequest): Promise<RemediationResponse> => {
    const response = await api.patch<RemediationResponse>(`/remediations/${id}/status`, data);
    return response.data;
  },

  verifyRemediation: async (id: string, data: VerifyRemediationRequest): Promise<RemediationResponse> => {
    const response = await api.patch<RemediationResponse>(`/remediations/${id}/verify`, data);
    return response.data;
  },
};
