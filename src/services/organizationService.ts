import api from './api';
import { 
  OrganizationResponse, 
  OrganizationMembersResponse, 
  UpdateOrganizationRequest 
} from '../types/organization';

export const organizationService = {
  getMyOrganization: async (): Promise<OrganizationResponse> => {
    const response = await api.get<OrganizationResponse>('/organizations/me');
    return response.data;
  },

  updateMyOrganization: async (data: UpdateOrganizationRequest): Promise<OrganizationResponse> => {
    const response = await api.put<OrganizationResponse>('/organizations/me', data);
    return response.data;
  },

  getMyOrganizationMembers: async (): Promise<OrganizationMembersResponse> => {
    const response = await api.get<OrganizationMembersResponse>('/organizations/me/members');
    return response.data;
  },
};
