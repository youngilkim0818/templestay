// API 모듈 통합 익스포트
export { default as httpClient } from './httpClient';
export type { ApiResponse, ApiError } from './httpClient';

// Authentication API
export { AuthAPI } from './auth';
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  PasswordResetRequest,
  PasswordUpdateRequest,
  UserPreferences,
} from './auth';

// Temples API
export { TemplesAPI } from './temples';
export type {
  TempleSearchParams,
  TempleListResponse,
  TempleDetailResponse,
  TempleReview,
  NearbyAttraction,
  PopularTemplesResponse,
  TempleAvailabilityRequest,
  TempleAvailabilityResponse,
} from './temples';

// Reservations API
export { ReservationsAPI } from './reservations';
export type {
  CreateReservationRequest,
  ReservationListParams,
  ReservationListResponse,
  ReservationDetail,
  PaymentRequest,
  PaymentResponse,
  CancelReservationRequest,
  RefundRequest,
} from './reservations';

// Attractions API
export { AttractionsAPI } from './attractions';
export type {
  Attraction,
  AttractionSearchParams,
  AttractionListResponse,
  AttractionDetail,
  AttractionReview,
  TourRoute,
  NearbyServicesParams,
} from './attractions';

// API 설정
import { httpClient } from './httpClient';

export const configureAPI = (config: {
  baseURL?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}) => {
  if (config.baseURL) {
    httpClient.setBaseURL(config.baseURL);
  }
  if (config.timeout) {
    httpClient.setTimeout(config.timeout);
  }
};

// 공통 API 유틸리티
export const APIUtils = {
  // 이미지 URL 생성
  getImageUrl: (imagePath?: string, size?: 'thumbnail' | 'medium' | 'large'): string | undefined => {
    if (!imagePath) return undefined;
    
    const baseUrl = process.env.EXPO_PUBLIC_CDN_URL || 'https://cdn.templestay.kr';
    const sizePrefix = size ? `/${size}` : '';
    
    return `${baseUrl}${sizePrefix}/${imagePath}`;
  },

  // 페이지네이션 파라미터 생성
  createPaginationParams: (page: number, limit: number = 20) => ({
    limit,
    offset: (page - 1) * limit,
  }),

  // 거리 계산 (km)
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // 날짜 포맷 (API용)
  formatDateForAPI: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // 시간 포맷 (API용)
  formatTimeForAPI: (date: Date): string => {
    return date.toTimeString().split(' ')[0].slice(0, 5);
  },

  // 검색어 인코딩
  encodeSearchQuery: (query: string): string => {
    return encodeURIComponent(query.trim());
  },

  // 에러 메시지 다국어 처리
  getLocalizedErrorMessage: (errorCode: string, language: 'ko' | 'en' = 'ko'): string => {
    const errorMessages = {
      ko: {
        NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
        UNAUTHORIZED: '로그인이 필요합니다.',
        FORBIDDEN: '접근 권한이 없습니다.',
        NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
        VALIDATION_ERROR: '입력한 정보를 확인해주세요.',
        SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        PAYMENT_FAILED: '결제에 실패했습니다.',
        RESERVATION_CONFLICT: '이미 예약된 시간입니다.',
        INSUFFICIENT_CAPACITY: '예약 가능한 인원이 부족합니다.',
      },
      en: {
        NETWORK_ERROR: 'Please check your network connection.',
        UNAUTHORIZED: 'Login required.',
        FORBIDDEN: 'Access denied.',
        NOT_FOUND: 'Requested information not found.',
        VALIDATION_ERROR: 'Please check your input.',
        SERVER_ERROR: 'Server error occurred. Please try again later.',
        PAYMENT_FAILED: 'Payment failed.',
        RESERVATION_CONFLICT: 'Time slot already reserved.',
        INSUFFICIENT_CAPACITY: 'Insufficient capacity available.',
      },
    };

    return errorMessages[language][errorCode as keyof typeof errorMessages.ko] || 
           errorMessages[language].SERVER_ERROR;
  },
};

export default {
  AuthAPI,
  TemplesAPI,
  ReservationsAPI,
  AttractionsAPI,
  httpClient,
  configureAPI,
  APIUtils,
};