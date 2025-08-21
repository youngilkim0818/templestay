import { supabase } from '../lib/supabase';
import { Reservation } from '../types';

export class ReservationService {
  // 예약 생성
  static async createReservation(reservationData: any): Promise<Reservation> {
    if (__DEV__) {
      console.log('🔄 Creating reservation with data:', reservationData);
    }
    
    const {
      userId,
      templeId,
      templeName,
      programTitle,
      reservationDate,
      reservationTime,
      participants,
      totalAmount,
      paymentMethod,
      userName,
      userPhone,
      userEmail,
      status = 'confirmed',
    } = reservationData;

    // 필수 필드 검증
    if (!userId || !templeId || !templeName || !programTitle) {
      throw new Error('Required fields are missing for reservation.');
    }

    const insertData: any = {
      user_id: userId,
      temple_id: templeId,
      temple_name: templeName,
      program_title: programTitle,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      participants,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      user_name: userName,
      user_email: userEmail,
      status,
    };

    // 전화번호가 있을 때만 추가
    if (userPhone) {
      insertData.user_phone = userPhone;
    }
    
    if (__DEV__) {
      console.log('📝 Reservation data prepared:', insertData);
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }

    if (__DEV__) {
      console.log('✅ Reservation created successfully:', data);
    }
    return data as Reservation;
  }

  // 사용자 예약 목록 조회
  static async getUserReservations(userId: string): Promise<Reservation[]> {
    if (__DEV__) {
      console.log('🔄 Fetching reservations for user:', userId);
    }
    
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reservations:', error);
      throw error;
    }

    if (__DEV__) {
      console.log('✅ User reservations fetched:', data?.length || 0, 'reservations');
    }
    return data as Reservation[];
  }

  // 예약 상세 조회
  static async getReservationById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching reservation:', error);
      throw error;
    }

    return data as Reservation;
  }

  // 예약 취소
  static async cancelReservation(id: string) {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }

    return data as Reservation;
  }

  // 예약 가능 시간 조회
  static async getAvailableTimeSlots(templeId: string, date: string): Promise<string[]> {
    // 해당 날짜의 이미 예약된 시간대 조회
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('reservation_time')
      .eq('temple_id', templeId)
      .eq('reservation_date', date)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }

    // 사찰의 전체 이용 가능 시간대 조회
    const { data: temple, error: templeError } = await supabase
      .from('temples')
      .select('available_times')
      .eq('id', templeId)
      .single();

    if (templeError) {
      console.error('Error fetching temple:', templeError);
      throw templeError;
    }

    const reservedTimes = reservations?.map(r => r.reservation_time) || [];
    const availableTimes = temple?.available_times?.filter((time: string) => !reservedTimes.includes(time)) || [];

    return availableTimes;
  }

  // 예약 상태 업데이트
  static async updateReservationStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }

    return data as Reservation;
  }
}