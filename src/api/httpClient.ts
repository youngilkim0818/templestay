import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { supabase } from '../lib/supabase';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - 인증 토큰 자동 추가
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
          }
        } catch (error) {
          console.warn('Failed to get auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - 에러 처리 및 데이터 변환
    this.client.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => {
        // 원본 응답 반환 (ApiResponse 변환은 메서드에서 수행)
        return response;
      },
      (error: AxiosError) => {
        // 에러 응답 처리
        const apiError: ApiError = {
          message: 'An error occurred',
          status: error.response?.status,
          code: error.code,
        };

        if (error.response?.data) {
          const errorData = error.response.data as any;
          apiError.message = errorData.message || errorData.error || 'Server error';
        } else if (error.request) {
          apiError.message = 'Network error - please check your connection';
        } else {
          apiError.message = error.message || 'Unknown error occurred';
        }

        return Promise.reject(apiError);
      }
    );
  }

  // GET 요청
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return {
      data: response.data,
      success: true,
      message: response.data?.message || 'Success',
    };
  }

  // POST 요청
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return {
      data: response.data,
      success: true,
      message: response.data?.message || 'Success',
    };
  }

  // PUT 요청
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return {
      data: response.data,
      success: true,
      message: response.data?.message || 'Success',
    };
  }

  // DELETE 요청
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return {
      data: response.data,
      success: true,
      message: response.data?.message || 'Success',
    };
  }

  // PATCH 요청
  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data);
    return {
      data: response.data,
      success: true,
      message: response.data?.message || 'Success',
    };
  }

  // 베이스 URL 설정
  setBaseURL(baseURL: string) {
    this.client.defaults.baseURL = baseURL;
  }

  // 타임아웃 설정
  setTimeout(timeout: number) {
    this.client.defaults.timeout = timeout;
  }
}

// 싱글톤 인스턴스 생성
export const httpClient = new HttpClient();

// 환경별 API 베이스 URL 설정
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.templestay.kr/v1';
httpClient.setBaseURL(API_BASE_URL);

export default httpClient;