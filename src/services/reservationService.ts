import { supabase } from '../lib/supabase';
import { Reservation } from '../types';

export class ReservationService {
  // 예약 생성
  static async createReservation(reservationData: any) {
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        user_id: reservationData.userId,
        temple_id: reservationData.templeId,
        program_id: reservationData.programId || null,
        reservation_date: reservationData.reservationDate,
        reservation_time: reservationData.reservationTime,
        user_name: reservationData.userName,
        user_phone: reservationData.userPhone,
        user_email: reservationData.userEmail,
        has_allergies: reservationData.hasAllergies,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }

    return data as Reservation;
  }

  // 사용자 예약 목록 조회
  static async getUserReservations(userId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        temples (name, region, address)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reservations:', error);
      throw error;
    }

    return data as Reservation[];
  }

  // 예약 상세 조회
  static async getReservationById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        temples (name, region, address),
        temple_programs (title, description, price)
      `)
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