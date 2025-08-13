import httpClient, { ApiResponse } from './httpClient';
import { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserPreferences {
  language: 'ko' | 'en';
  templeTypes: string[];
  region: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export class AuthAPI {
  private static readonly BASE_PATH = '/auth';

  // 이메일/비밀번호 로그인
  static async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/login`, credentials);
    } catch (error) {
      throw error;
    }
  }

  // 회원가입
  static async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/register`, userData);
    } catch (error) {
      throw error;
    }
  }

  // 소셜 로그인 (Google)
  static async googleLogin(token: string): Promise<ApiResponse<AuthResponse>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/google`, { token });
    } catch (error) {
      throw error;
    }
  }

  // 소셜 로그인 (Kakao)
  static async kakaoLogin(token: string): Promise<ApiResponse<AuthResponse>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/kakao`, { token });
    } catch (error) {
      throw error;
    }
  }

  // 소셜 로그인 (Naver)
  static async naverLogin(token: string): Promise<ApiResponse<AuthResponse>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/naver`, { token });
    } catch (error) {
      throw error;
    }
  }

  // 로그아웃
  static async logout(): Promise<ApiResponse<null>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/logout`);
    } catch (error) {
      throw error;
    }
  }

  // 토큰 갱신
  static async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/refresh`, { refreshToken });
    } catch (error) {
      throw error;
    }
  }

  // 비밀번호 재설정 요청
  static async requestPasswordReset(request: PasswordResetRequest): Promise<ApiResponse<null>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/password-reset`, request);
    } catch (error) {
      throw error;
    }
  }

  // 비밀번호 업데이트
  static async updatePassword(request: PasswordUpdateRequest): Promise<ApiResponse<null>> {
    try {
      return await httpClient.put(`${this.BASE_PATH}/password`, request);
    } catch (error) {
      throw error;
    }
  }

  // 현재 사용자 정보 조회
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/me`);
    } catch (error) {
      throw error;
    }
  }

  // 사용자 프로필 업데이트
  static async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await httpClient.put(`${this.BASE_PATH}/profile`, userData);
    } catch (error) {
      throw error;
    }
  }

  // 사용자 선호도 설정
  static async setUserPreferences(preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/preferences`, preferences);
    } catch (error) {
      throw error;
    }
  }

  // 사용자 선호도 조회
  static async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/preferences`);
    } catch (error) {
      throw error;
    }
  }

  // 이메일 중복 확인
  static async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/check-email`, { email });
    } catch (error) {
      throw error;
    }
  }

  // 계정 삭제
  static async deleteAccount(): Promise<ApiResponse<null>> {
    try {
      return await httpClient.delete(`${this.BASE_PATH}/account`);
    } catch (error) {
      throw error;
    }
  }

  // 이메일 인증
  static async verifyEmail(token: string): Promise<ApiResponse<null>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/verify-email`, { token });
    } catch (error) {
      throw error;
    }
  }

  // 이메일 인증 재발송
  static async resendVerificationEmail(): Promise<ApiResponse<null>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/resend-verification`);
    } catch (error) {
      throw error;
    }
  }
}

export default AuthAPI; 