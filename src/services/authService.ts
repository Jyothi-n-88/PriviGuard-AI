import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, MeResponse, VerifyEmailOtpResponse } from '../types/auth';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>('/auth/me');
    return response.data;
  },

  verifyEmailOtp: async (email: string, otp: string): Promise<VerifyEmailOtpResponse> => {
    const response = await api.post<VerifyEmailOtpResponse>('/auth/verify-email-otp', { email, otp });
    return response.data;
  },

  resendEmailOtp: async (email: string): Promise<VerifyEmailOtpResponse> => {
    const response = await api.post<VerifyEmailOtpResponse>('/auth/resend-email-otp', { email });
    return response.data;
  },
};
