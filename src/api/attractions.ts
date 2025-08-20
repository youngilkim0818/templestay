import httpClient, { ApiResponse } from './httpClient';

export interface Attraction {
  id: string;
  name: string;
  type: 'temple' | 'cultural_site' | 'natural_site' | 'museum' | 'park' | 'restaurant' | 'shopping' | 'accommodation';
  category: string;
  description: string;
  shortDescription?: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  openingHours?: string;
  contactPhone?: string;
  website?: string;
  entryFee?: number;
  isFree?: boolean;
  tags?: string[];
  nearbyTemples?: string[];
  distance?: number; // 검색 기준점으로부터의 거리
}

export interface AttractionSearchParams {
  query?: string;
  type?: string;
  category?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // km 단위
  minRating?: number;
  isFree?: boolean;
  openNow?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'distance' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface AttractionListResponse {
  attractions: Attraction[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface AttractionDetail extends Attraction {
  detailedDescription: string;
  facilities: string[];
  accessibility: {
    wheelchairAccessible: boolean;
    parkingAvailable: boolean;
    publicTransportAccessible: boolean;
  };
  reviews: AttractionReview[];
  nearbyAttractions: Attraction[];
  operatingInfo: {
    openingHours: { [day: string]: string };
    holidays: string[];
    specialNotes?: string;
  };
  transportationInfo: {
    publicTransport: string[];
    parkingInfo?: string;
    walkingDistance?: { [templeId: string]: number };
  };
}

export interface AttractionReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
  visitDate?: string;
  helpfulCount?: number;
}

export interface TourRoute {
  id: string;
  name: string;
  description: string;
  duration: number; // 소요 시간 (분)
  distance: number; // 총 거리 (km)
  difficulty: 'easy' | 'moderate' | 'hard';
  attractions: Attraction[];
  startPoint: {
    name: string;
    latitude: number;
    longitude: number;
  };
  endPoint: {
    name: string;
    latitude: number;
    longitude: number;
  };
  waypoints: Array<{
    order: number;
    attraction: Attraction;
    stayDuration?: number; // 머무는 시간 (분)
  }>;
  totalCost?: number;
  bestVisitTime?: string;
  tags?: string[];
}

export interface NearbyServicesParams {
  latitude: number;
  longitude: number;
  radius?: number;
  services?: Array<'restaurant' | 'accommodation' | 'parking' | 'gas_station' | 'hospital' | 'bank'>;
}

export class AttractionsAPI {
  private static readonly BASE_PATH = '/attractions';

  // 관광지 목록 조회 (검색, 필터링 포함)
  static async getAttractions(params?: AttractionSearchParams): Promise<ApiResponse<AttractionListResponse>> {
    try {
      const queryParams = {
        query: params?.query,
        type: params?.type,
        category: params?.category,
        region: params?.region,
        latitude: params?.latitude,
        longitude: params?.longitude,
        radius: params?.radius,
        min_rating: params?.minRating,
        is_free: params?.isFree,
        open_now: params?.openNow,
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

  // 특정 관광지 상세 정보 조회
  static async getAttractionById(attractionId: string): Promise<ApiResponse<AttractionDetail>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/${attractionId}`);
    } catch (error) {
      throw error;
    }
  }

  // 관광지 검색
  static async searchAttractions(query: string, options?: Partial<AttractionSearchParams>): Promise<ApiResponse<AttractionListResponse>> {
    try {
      const params = {
        query,
        ...options,
      };
      return await this.getAttractions(params);
    } catch (error) {
      throw error;
    }
  }

  // 내 위치 기반 근처 관광지 조회
  static async getNearbyAttractions(
    latitude: number,
    longitude: number,
    radius: number = 30
  ): Promise<ApiResponse<AttractionListResponse>> {
    try {
      const params: AttractionSearchParams = {
        latitude,
        longitude,
        radius,
        sortBy: 'distance',
        sortOrder: 'asc',
      };
      return await this.getAttractions(params);
    } catch (error) {
      throw error;
    }
  }

  // 특정 템플 근처 관광지 조회
  static async getAttractionsNearTemple(
    templeId: string,
    radius: number = 20
  ): Promise<ApiResponse<AttractionListResponse>> {
    try {
      const params = { temple_id: templeId, radius };
      return await httpClient.get(`${this.BASE_PATH}/near-temple`, params);
    } catch (error) {
      throw error;
    }
  }

  // 타입별 관광지 조회
  static async getAttractionsByType(type: string): Promise<ApiResponse<AttractionListResponse>> {
    try {
      const params: AttractionSearchParams = {
        type,
        sortBy: 'popularity',
        sortOrder: 'desc',
      };
      return await this.getAttractions(params);
    } catch (error) {
      throw error;
    }
  }

  // 인기 관광지 조회
  static async getPopularAttractions(
    region?: string,
    limit: number = 10
  ): Promise<ApiResponse<AttractionListResponse>> {
    try {
      const params = {
        region,
        limit,
        sort_by: 'popularity',
        sort_order: 'desc',
      };
      return await httpClient.get(`${this.BASE_PATH}/popular`, params);
    } catch (error) {
      throw error;
    }
  }

  // 추천 관광지 조회 (사용자 선호도 기반)
  static async getRecommendedAttractions(): Promise<ApiResponse<AttractionListResponse>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/recommended`);
    } catch (error) {
      throw error;
    }
  }

  // 관광지 리뷰 조회
  static async getAttractionReviews(
    attractionId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ApiResponse<{
    reviews: AttractionReview[];
    total: number;
    averageRating: number;
  }>> {
    try {
      const params = { limit, offset };
      return await httpClient.get(`${this.BASE_PATH}/${attractionId}/reviews`, params);
    } catch (error) {
      throw error;
    }
  }

  // 관광지 리뷰 작성
  static async createAttractionReview(
    attractionId: string,
    review: {
      rating: number;
      comment: string;
      images?: string[];
      visitDate?: string;
    }
  ): Promise<ApiResponse<AttractionReview>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${attractionId}/reviews`, review);
    } catch (error) {
      throw error;
    }
  }

  // 관광지 찜하기/찜 해제
  static async toggleFavoriteAttraction(attractionId: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${attractionId}/favorite`);
    } catch (error) {
      throw error;
    }
  }

  // 내가 찜한 관광지 목록
  static async getFavoriteAttractions(): Promise<ApiResponse<AttractionListResponse>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/favorites`);
    } catch (error) {
      throw error;
    }
  }

  // 관광 루트 추천
  static async getTourRoutes(
    startLat: number,
    startLng: number,
    preferences?: {
      duration?: number; // 총 소요시간 (분)
      interests?: string[]; // 관심사
      difficulty?: 'easy' | 'moderate' | 'hard';
      includeTemples?: boolean;
    }
  ): Promise<ApiResponse<TourRoute[]>> {
    try {
      const params = {
        start_lat: startLat,
        start_lng: startLng,
        duration: preferences?.duration,
        interests: preferences?.interests?.join(','),
        difficulty: preferences?.difficulty,
        include_temples: preferences?.includeTemples,
      };
      return await httpClient.get(`${this.BASE_PATH}/tour-routes`, params);
    } catch (error) {
      throw error;
    }
  }

  // 특정 루트 상세 정보
  static async getTourRouteById(routeId: string): Promise<ApiResponse<TourRoute>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/tour-routes/${routeId}`);
    } catch (error) {
      throw error;
    }
  }

  // 커스텀 루트 생성
  static async createCustomTourRoute(
    route: {
      name: string;
      description?: string;
      attractionIds: string[];
      startPoint: { latitude: number; longitude: number };
      preferences?: {
        transportMode?: 'walking' | 'driving' | 'public_transport';
        avoidTolls?: boolean;
      };
    }
  ): Promise<ApiResponse<TourRoute>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/tour-routes/custom`, route);
    } catch (error) {
      throw error;
    }
  }

  // 근처 편의시설 조회
  static async getNearbyServices(params: NearbyServicesParams): Promise<ApiResponse<{
    services: Array<{
      type: string;
      name: string;
      address: string;
      latitude: number;
      longitude: number;
      distance: number;
      isOpen?: boolean;
      rating?: number;
    }>;
  }>> {
    try {
      const queryParams = {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 5,
        services: params.services?.join(','),
      };
      return await httpClient.get(`${this.BASE_PATH}/nearby-services`, queryParams);
    } catch (error) {
      throw error;
    }
  }

  // 관광지 카테고리 목록 조회
  static async getAttractionCategories(): Promise<ApiResponse<Array<{
    type: string;
    categories: string[];
  }>>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/categories`);
    } catch (error) {
      throw error;
    }
  }

  // 관광지 운영 시간 확인
  static async checkOperatingHours(attractionId: string, date?: string): Promise<ApiResponse<{
    isOpen: boolean;
    openingTime?: string;
    closingTime?: string;
    specialNotes?: string;
  }>> {
    try {
      const params = date ? { date } : {};
      return await httpClient.get(`${this.BASE_PATH}/${attractionId}/operating-hours`, params);
    } catch (error) {
      throw error;
    }
  }

  // 관광지 이미지 업로드
  static async uploadAttractionImage(
    attractionId: string,
    imageFile: FormData
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${attractionId}/images`, {
        image: imageFile,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // 관광지 방문 기록
  static async recordVisit(attractionId: string, visitData?: {
    visitDate?: string;
    duration?: number; // 체류 시간 (분)
    rating?: number;
  }): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${attractionId}/visit`, visitData || {});
    } catch (error) {
      throw error;
    }
  }

  // 내 방문 기록 조회
  static async getMyVisitHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<ApiResponse<{
    visits: Array<{
      attraction: Attraction;
      visitDate: string;
      duration?: number;
      rating?: number;
    }>;
    total: number;
  }>> {
    try {
      const params = { limit, offset };
      return await httpClient.get(`${this.BASE_PATH}/my/visits`, params);
    } catch (error) {
      throw error;
    }
  }
}

export default AttractionsAPI; 