import httpClient, { ApiResponse } from './httpClient';
import { Reservation } from '../types';

export interface CreateReservationRequest {
  templeId: string;
  programId?: string;
  reservationDate: string;
  reservationTime: string;
  numberOfPeople: number;
  guestInfo: {
    name: string;
    phone: string;
    email: string;
    hasAllergies: boolean;
    allergyDetails?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  specialRequests?: string;
  paymentMethod: 'card' | 'bank_transfer' | 'kakao_pay' | 'naver_pay';
}

export interface ReservationListParams {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'created_at' | 'temple_name';
  sortOrder?: 'asc' | 'desc';
}

export interface ReservationListResponse {
  reservations: ReservationDetail[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface ReservationDetail extends Omit<Reservation, 'paymentMethod'> {
  templeName: string;
  templeAddress: string;
  templeImageUrl?: string;
  programTitle?: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: 'card' | 'bank_transfer' | 'kakao_pay' | 'naver_pay';
  paymentId?: string;
  qrCode?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface PaymentRequest {
  reservationId: string;
  paymentMethod: 'card' | 'bank_transfer' | 'kakao_pay' | 'naver_pay';
  cardInfo?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    cardHolderName: string;
  };
  amount: number;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId?: string;
  receipt?: {
    paymentMethod: string;
    amount: number;
    paidAt: string;
    merchantId: string;
  };
}

export interface CancelReservationRequest {
  reservationId: string;
  reason: string;
  refundMethod?: 'original' | 'account_transfer';
  refundAccount?: {
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface RefundRequest {
  reservationId: string;
  amount: number;
  reason: string;
  refundMethod: 'original' | 'account_transfer';
  refundAccount?: {
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export class ReservationsAPI {
  private static readonly BASE_PATH = '/reservations';

  // 예약 생성
  static async createReservation(request: CreateReservationRequest): Promise<ApiResponse<ReservationDetail>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}`, request);
    } catch (error) {
      throw error;
    }
  }

  // 내 예약 목록 조회
  static async getMyReservations(params?: ReservationListParams): Promise<ApiResponse<ReservationListResponse>> {
    try {
      const queryParams = {
        status: params?.status,
        start_date: params?.startDate,
        end_date: params?.endDate,
        limit: params?.limit || 20,
        offset: params?.offset || 0,
        sort_by: params?.sortBy || 'date',
        sort_order: params?.sortOrder || 'desc',
      };

      return await httpClient.get(`${this.BASE_PATH}/my`, queryParams);
    } catch (error) {
      throw error;
    }
  }

  // 특정 예약 상세 조회
  static async getReservationById(reservationId: string): Promise<ApiResponse<ReservationDetail>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/${reservationId}`);
    } catch (error) {
      throw error;
    }
  }

  // 예약 수정
  static async updateReservation(
    reservationId: string,
    updates: Partial<CreateReservationRequest>
  ): Promise<ApiResponse<ReservationDetail>> {
    try {
      return await httpClient.put(`${this.BASE_PATH}/${reservationId}`, updates);
    } catch (error) {
      throw error;
    }
  }

  // 예약 취소
  static async cancelReservation(request: CancelReservationRequest): Promise<ApiResponse<{
    success: boolean;
    refundAmount: number;
    refundId?: string;
    estimatedRefundDate?: string;
  }>> {
    try {
      const { reservationId, ...cancelData } = request;
      return await httpClient.post(`${this.BASE_PATH}/${reservationId}/cancel`, cancelData);
    } catch (error) {
      throw error;
    }
  }

  // 결제 처리
  static async processPayment(request: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const { reservationId, ...paymentData } = request;
      return await httpClient.post(`${this.BASE_PATH}/${reservationId}/payment`, paymentData);
    } catch (error) {
      throw error;
    }
  }

  // 결제 상태 확인
  static async getPaymentStatus(reservationId: string): Promise<ApiResponse<{
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    amount: number;
    paymentMethod?: string;
    paidAt?: string;
    transactionId?: string;
  }>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/${reservationId}/payment/status`);
    } catch (error) {
      throw error;
    }
  }

  // 환불 요청
  static async requestRefund(request: RefundRequest): Promise<ApiResponse<{
    success: boolean;
    refundId: string;
    estimatedRefundDate: string;
    refundAmount: number;
  }>> {
    try {
      const { reservationId, ...refundData } = request;
      return await httpClient.post(`${this.BASE_PATH}/${reservationId}/refund`, refundData);
    } catch (error) {
      throw error;
    }
  }

  // 체크인
  static async checkIn(reservationId: string): Promise<ApiResponse<{
    success: boolean;
    checkInTime: string;
    qrCode?: string;
  }>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${reservationId}/checkin`);
    } catch (error) {
      throw error;
    }
  }

  // 체크아웃
  static async checkOut(reservationId: string): Promise<ApiResponse<{
    success: boolean;
    checkOutTime: string;
  }>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${reservationId}/checkout`);
    } catch (error) {
      throw error;
    }
  }

  // QR 코드 생성/재생성
  static async generateQRCode(reservationId: string): Promise<ApiResponse<{
    qrCode: string;
    expiresAt: string;
  }>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${reservationId}/qr-code`);
    } catch (error) {
      throw error;
    }
  }

  // 예약 확인서/영수증 조회
  static async getReservationReceipt(reservationId: string): Promise<ApiResponse<{
    receiptUrl: string;
    receiptData: {
      reservationNumber: string;
      templeName: string;
      programTitle: string;
      reservationDate: string;
      guestName: string;
      totalAmount: number;
      paymentMethod: string;
      issuedAt: string;
    };
  }>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/${reservationId}/receipt`);
    } catch (error) {
      throw error;
    }
  }

  // 예약 가능한 시간대 조회
  static async getAvailableTimeSlots(
    templeId: string,
    date: string,
    programId?: string
  ): Promise<ApiResponse<{
    availableSlots: Array<{
      time: string;
      available: boolean;
      price: number;
      remainingCapacity: number;
    }>;
  }>> {
    try {
      const params = {
        temple_id: templeId,
        date,
        program_id: programId,
      };
      return await httpClient.get(`${this.BASE_PATH}/available-slots`, params);
    } catch (error) {
      throw error;
    }
  }

  // 예약 통계 (사용자용)
  static async getMyReservationStats(): Promise<ApiResponse<{
    totalReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    totalSpent: number;
    favoriteRegion: string;
    averageRating: number;
  }>> {
    try {
      return await httpClient.get(`${this.BASE_PATH}/my/stats`);
    } catch (error) {
      throw error;
    }
  }

  // 예약 알림 설정
  static async updateNotificationSettings(
    reservationId: string,
    settings: {
      reminderEnabled: boolean;
      reminderTime: number; // 시간 단위 (예: 24시간 전)
      smsEnabled: boolean;
      emailEnabled: boolean;
      pushEnabled: boolean;
    }
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await httpClient.put(`${this.BASE_PATH}/${reservationId}/notifications`, settings);
    } catch (error) {
      throw error;
    }
  }

  // 예약 리뷰 작성
  static async createReservationReview(
    reservationId: string,
    review: {
      rating: number;
      comment: string;
      images?: string[];
      tags?: string[];
    }
  ): Promise<ApiResponse<{
    reviewId: string;
    success: boolean;
  }>> {
    try {
      return await httpClient.post(`${this.BASE_PATH}/${reservationId}/review`, review);
    } catch (error) {
      throw error;
    }
  }

  // 예약 상태 업데이트 (관리자용)
  static async updateReservationStatus(
    reservationId: string,
    status: 'confirmed' | 'cancelled' | 'completed',
    note?: string
  ): Promise<ApiResponse<ReservationDetail>> {
    try {
      return await httpClient.patch(`${this.BASE_PATH}/${reservationId}/status`, {
        status,
        note,
      });
    } catch (error) {
      throw error;
    }
  }
}

export default ReservationsAPI; 