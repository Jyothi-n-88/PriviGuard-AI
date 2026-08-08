export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  country?: string;
  contactEmail?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface OrganizationResponse {
  success: boolean;
  message?: string;
  data: Organization;
}

export interface OrganizationMembersResponse {
  success: boolean;
  message?: string;
  data: OrganizationMember[];
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  industry?: string;
  size?: string;
  country?: string;
  contactEmail?: string;
}
