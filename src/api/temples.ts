import httpClient, { ApiResponse } from './httpClient';
import { Temple, TempleProgram } from '../types';

export interface TempleSearchParams {
  query?: string;
  region?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number; // km 단위
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'price' | 'distance' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface TempleListResponse {
  temples: Temple[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface TempleDetailResponse extends Temple {
  reviews: TempleReview[];
  averageRating: number;
  totalReviews: number;
  nearbyAttractions: NearbyAttraction[];
  availableDates: string[];
}

export interface TempleReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
}

export interface NearbyAttraction {
  id: string;
  name: string;
  type: string;
  distance: number;
  latitude: number;
  longitude: number;
}

export interface PopularTemplesResponse {
  temples: Temple[];
  period: 'week' | 'month' | 'year';
}

export interface TempleAvailabilityRequest {
  templeId: string;
  date: string;
  programId?: string;
}

export interface TempleAvailabilityResponse {
  available: boolean;
  availableSlots: string[];
  price: number;
  maxCapacity: number;
  currentBookings: number;
}

export class TemplesAPI {
  private static readonly BASE_PATH = '/temples';

  // 템플 목록 조회 (검색, 필터링 포함)
  static async getTemples(params?: TempleSearchParams): Promise<ApiResponse<TempleListResponse>> {
    try {
      const queryParams = {
        query: params?.query,
        region: params?.region,
        type: params?.type,
        min_price: params?.minPrice,
        max_price: params?.maxPrice,
        latitude: params?.latitude,
        longitude: params?.longitude,
        radius: params?.radius,
        limit: params?.limit || 20,
        offset: params?.offset || 0,
        sort_by: params?.sortBy || 'name',
        sort_order: params?.sortOrder || 'asc',
      };

      return await httpClient.get(`${this.BASE_PATH}`, queryParams);
    } catch (error) {
      throw error;
    }
  }

  // 특정 템플 상세 정보 조회
  static async getTempleById(templeId: string): Promise<ApiResponse<TempleDetailResponse>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/${templeId}`);
    } catch (error) {
      throw error;
    }
  }

  // 템플 검색 (텍스트 검색)
  static async searchTemples(query: string, options?: Partial<TempleSearchParams>): Promise<ApiResponse<TempleListResponse>> {
    try {
      const params = {
        query,
        ...options,
      };
      return await this.getTemples(params);
    } catch (error) {
      throw error;
    }
  }

  // 내 위치 기반 근처 템플 조회
  static async getNearbyTemples(
    latitude: number,
    longitude: number,
    radius: number = 50
  ): Promise<ApiResponse<TempleListResponse>> {
    try {
      const params: TempleSearchParams = {
        latitude,
        longitude,
        radius,
        sortBy: 'distance',
        sortOrder: 'asc',
      };
      return await this.getTemples(params);
    } catch (error) {
      throw error;
    }
  }

  // 지역별 템플 조회
  static async getTemplesByRegion(region: string): Promise<ApiResponse<TempleListResponse>> {
    try {
      const params: TempleSearchParams = {
        region,
        sortBy: 'popularity',
        sortOrder: 'desc',
      };
      return await this.getTemples(params);
    } catch (error) {
      throw error;
    }
  }

  // 인기 템플 조회
  static async getPopularTemples(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<PopularTemplesResponse>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/popular`, { period });
    } catch (error) {
      throw error;
    }
  }

  // 추천 템플 조회 (사용자 선호도 기반)
  static async getRecommendedTemples(): Promise<ApiResponse<TempleListResponse>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/recommended`);
    } catch (error) {
      throw error;
    }
  }

  // 템플 프로그램 목록 조회
  static async getTemplePrograms(templeId: string): Promise<ApiResponse<TempleProgram[]>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/${templeId}/programs`);
    } catch (error) {
      throw error;
    }
  }

  // 템플 예약 가능 여부 확인
  static async checkAvailability(request: TempleAvailabilityRequest): Promise<ApiResponse<TempleAvailabilityResponse>> {
    try {
      const { templeId, ...params } = request;
      return await httpClient.get(`${this.BASE_PATH}/${templeId}/availability`, params);
    } catch (error) {
      throw error;
    }
  }

  // 템플 예약 가능한 날짜 조회
  static async getAvailableDates(
    templeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<string[]>> {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
      };
      return await httpClient.get(`${this.BASE_PATH}/${templeId}/available-dates`, params);
    } catch (error) {
      throw error;
    }
  }

  // 템플 리뷰 조회
  static async getTempleReviews(
    templeId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ApiResponse<{
    reviews: TempleReview[];
    total: number;
    averageRating: number;
  }>> {
    try {
      const params = { limit, offset };
      return await httpClient.get(`${this.BASE_PATH}/${templeId}/reviews`, params);
    } catch (error) {
      throw error;
    }
  }

  // 템플 리뷰 작성
  static async createReview(
    templeId: string,
    review: {
      rating: number;
      comment: string;
      images?: string[];
    }
  ): Promise<ApiResponse<TempleReview>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${templeId}/reviews`, review);
    } catch (error) {
      throw error;
    }
  }

  // 템플 찜하기/찜 해제
  static async toggleFavorite(templeId: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${templeId}/favorite`);
    } catch (error) {
      throw error;
    }
  }

  // 내가 찜한 템플 목록
  static async getFavoriteTemples(): Promise<ApiResponse<TempleListResponse>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/favorites`);
    } catch (error) {
      throw error;
    }
  }

  // 템플 이미지 업로드
  static async uploadTempleImage(
    templeId: string,
    imageFile: FormData
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      // 멀티파트 폼 데이터 전송
      return await httpClient.post(`${this.BASE_PATH}/${templeId}/images`, {
        image: imageFile,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // 템플 통계 정보 조회 (관리자용)
  static async getTempleStats(templeId: string): Promise<ApiResponse<{
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    monthlyBookings: { month: string; count: number }[];
  }>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/${templeId}/stats`);
    } catch (error) {
      throw error;
    }
  }

  // 모든 지역 목록 조회
  static async getRegions(): Promise<ApiResponse<string[]>> {
    try {
      return await httpClient.get('/regions');
    } catch (error) {
      throw error;
    }
  }

  // 템플 타입 목록 조회
  static async getTempleTypes(): Promise<ApiResponse<string[]>> {
    try {
      return await httpClient.get('/temple-types');
    } catch (error) {
      throw error;
    }
  }
}

export default TemplesAPI; 