export type UserRole = 'admin' | 'dpo' | 'privacy_manager' | 'compliance_officer' | 'analyst' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface Organization {
  name: string;
  industry?: string;
  size?: string;
  country?: string;
  contactEmail?: string;
}

export interface RegisterRequest {
  organization: Organization;
  user: {
    name: string;
    email: string;
    password?: string;
  };
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user: User;
    organization?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface MeResponse {
  success: boolean;
  data?: {
    user: User;
  };
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export interface ResendEmailOtpRequest {
  email: string;
}

export interface VerifyEmailOtpResponse {
  success: boolean;
  message: string;
}
