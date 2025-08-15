import { ImageSourcePropType } from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  language?: 'ko' | 'en';
  createdAt?: string;
  updatedAt?: string;
}

export interface TempleProgram {
  id: string;
  title: string;
  description: string;
  price: number;
  availableTimes: string[];
  type: 'experience' | 'rest' | 'meditation' | 'cultural'; // 체험형, 휴식형, 명상형, 문화형
  duration: number; // 소요 시간 (분)
  maxCapacity: number;
  minAge?: number;
  includes: string[]; // 포함 사항
  excludes?: string[]; // 제외 사항
}

export interface Temple {
  id: string;
  name: string;
  region: string;
  address: string;
  imageUrl?: ImageSourcePropType;
  images?: string[];
  latitude: number;
  longitude: number;
  areaCd?: number;
  sigunguCd?: number;
  basePrice: number;
  precautions: string;
  description: string;
  shortDescription?: string;
  availableTimes: string[];
  programs: TempleProgram[];
  // temple-data.ts와 호환성을 위한 속성
  templestay?: Array<{
    title: string;
    description: string;
    price: number;
    times: string[];
    type: string;
  }>;
  // 템플스테이 상세 정보
  programDetails?: {
    [programTitle: string]: {
      pricing: {
        adult: number;
        teenager: number;
        child: number;
        preschool: number;
      };
      description: string;
      additionalInfo?: string[];
      reservationNotice?: string;
    };
  };
  // 공통 상세 정보
  commonDetails?: {
    preparationItems: string;
    refundPolicy: string[];
    templeRules: string[];
  };
  rating?: number;
  reviewCount?: number;
  contactPhone?: string;
  website?: string;
  facilities?: string[];
  accessibility?: {
    wheelchairAccessible: boolean;
    parkingAvailable: boolean;
    publicTransportAccessible: boolean;
  };
  operatingHours?: {
    [day: string]: string;
  };
  holidays?: string[];
  // TourAPI 연동 관련 필드
  hasApiImages?: boolean;
  apiDescription?: string;
  apiImages?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Reservation {
  id: string;
  user_id?: string;
  userId?: string;
  temple_id?: string;
  templeId?: string;
  templeName?: string;
  program_id?: string;
  programId?: string;
  programTitle?: string;
  reservation_date?: string;
  reservationDate?: string;
  reservation_time?: string;
  reservationTime?: string;
  user_name?: string;
  userName?: string;
  user_phone?: string;
  userPhone?: string;
  user_email?: string;
  userEmail?: string;
  has_allergies?: boolean;
  hasAllergies?: boolean;
  numberOfPeople?: number;
  totalAmount?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: 'card' | 'bank_transfer' | 'kakao_pay' | 'naver_pay';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  qrCode?: string;
  checkInTime?: string;
  checkOutTime?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  // Supabase join 데이터
  temples?: {
    name: string;
    region: string;
    address: string;
  };
  // 게스트 정보
  guestInfo?: {
    name: string;
    phone: string;
    email: string;
    hasAllergies: boolean;
    specialRequests?: string;
  };
}

// 추가 타입 정의들
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  rating: number;
  comment: string;
  images?: string[];
  visitDate?: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TempleReview extends Review {
  templeId: string;
  templeName: string;
  programId?: string;
  programTitle?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface SearchFilters {
  region?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  facilities?: string[];
  accessibility?: {
    wheelchairAccessible?: boolean;
    parkingAvailable?: boolean;
    publicTransportAccessible?: boolean;
  };
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface SortParams {
  sortBy: 'name' | 'price' | 'rating' | 'distance' | 'popularity' | 'date';
  sortOrder: 'asc' | 'desc';
}

export interface UserPreferences {
  language: 'ko' | 'en';
  favoriteRegions: string[];
  preferredTempleTypes: ('experience' | 'rest' | 'meditation' | 'cultural')[];
  budgetRange: {
    min: number;
    max: number;
  };
  accessibility: {
    wheelchairAccessible: boolean;
    parkingRequired: boolean;
    publicTransportOnly: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    reminderTime: number; // 시간 (예약 전 몇 시간)
  };
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// 네비게이션 관련 타입들
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SnsLogin: undefined;
  Login: undefined;
  SignUp: undefined;
  LanguagePreset: undefined;
  ProfilePreset: undefined;
  LocationPreset: undefined;
  TemplePreference: undefined;
  Analysis: undefined;
  AnalysisResult: undefined;
  Main: undefined;
  TempleStack: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  TempleList: undefined;
  Map: undefined;
  Market: undefined;
  MyPage: undefined;
};

export type TempleStackParamList = {
  TempleList: undefined;
  TempleDetail: { templeId: string };
  Reservation: { templeId: string; programId?: string };
  ReservationDate: { templeId: string; programId?: string };
  ReservationPeople: { 
    templeId: string; 
    programId?: string; 
    date: string; 
    time: string; 
  };
  ReservationConfirm: {
    templeId: string;
    programId?: string;
    date: string;
    time: string;
    numberOfPeople: number;
    guestInfo: {
      name: string;
      phone: string;
      email: string;
      hasAllergies: boolean;
      specialRequests?: string;
    };
  };
  ReservationPayment: { reservationId: string };
  ReservationDetail: { reservationId: string };
};

export type MyPageStackParamList = {
  MyPage: undefined;
  EditProfile: undefined;
  MyReservations: undefined;
  ReservationDetail: { reservationId: string };
};

// Zustand 스토어 타입들
export interface UserStoreState {
  user: User | null;
  isLoggedIn: boolean;
  preferences: UserPreferences | null;
  loading: LoadingState;
  error: ErrorState;
}

export interface ReservationStoreState {
  reservations: Reservation[];
  currentReservation: Partial<Reservation> | null;
  loading: LoadingState;
  error: ErrorState;
}

export interface TempleStoreState {
  temples: Temple[];
  favoriteTemples: Temple[];
  searchResults: Temple[];
  currentTemple: Temple | null;
  filters: SearchFilters;
  loading: LoadingState;
  error: ErrorState;
}

// API 응답 타입들
export interface ApiListResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
} 