import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reservation, LoadingState, ErrorState } from '../types';
import { ReservationService } from '../services/reservationService';

interface ReservationState {
  // 예약 데이터
  reservations: Reservation[];
  currentReservation: Partial<Reservation> | null;
  
  // 상태 관리
  loading: LoadingState;
  error: ErrorState;
  
  // 예약 관리 액션
  setReservations: (reservations: Reservation[]) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (reservationId: string, updates: Partial<Reservation>) => void;
  removeReservation: (reservationId: string) => void;
  
  // 현재 예약 (예약 진행 중) 관리
  setCurrentReservation: (reservation: Partial<Reservation> | null) => void;
  updateCurrentReservation: (updates: Partial<Reservation>) => void;
  clearCurrentReservation: () => void;
  
  // 유틸리티 액션
  getReservationById: (reservationId: string) => Reservation | undefined;
  getReservationsByStatus: (status: Reservation['status']) => Reservation[];
  getUpcomingReservations: () => Reservation[];
  
  // 로딩/에러 상태 관리
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;

  // 백엔드 API 연동 액션들
  fetchUserReservations: (userId: string) => Promise<void>;
  createReservation: (reservationData: any) => Promise<Reservation>;
  cancelReservation: (reservationId: string) => Promise<void>;
  updateReservationStatus: (reservationId: string, status: 'confirmed' | 'cancelled') => Promise<void>;
}

const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      reservations: [],
      currentReservation: null,
      loading: {},
      error: {},
      
      // 예약 관리 액션
      setReservations: (reservations: Reservation[]) =>
        set({ reservations }),
      
      addReservation: (reservation: Reservation) =>
        set((state) => ({ 
          reservations: [...state.reservations, reservation],
          currentReservation: null // 예약 완료 후 현재 예약 초기화
        })),
      
      updateReservation: (reservationId: string, updates: Partial<Reservation>) =>
        set((state) => ({
          reservations: state.reservations.map(reservation =>
            reservation.id === reservationId
              ? { ...reservation, ...updates, updatedAt: new Date().toISOString() }
              : reservation
          )
        })),
      
      removeReservation: (reservationId: string) =>
        set((state) => ({
          reservations: state.reservations.filter(
            reservation => reservation.id !== reservationId
          )
        })),
      
      // 현재 예약 관리
      setCurrentReservation: (reservation: Partial<Reservation> | null) =>
        set({ currentReservation: reservation }),
      
      updateCurrentReservation: (updates: Partial<Reservation>) =>
        set((state) => ({
          currentReservation: state.currentReservation
            ? { ...state.currentReservation, ...updates }
            : updates
        })),
      
      clearCurrentReservation: () =>
        set({ currentReservation: null }),
      
      // 유틸리티 함수들
      getReservationById: (reservationId: string) => {
        const state = get();
        return state.reservations.find(reservation => reservation.id === reservationId);
      },
      
      getReservationsByStatus: (status: Reservation['status']) => {
        const state = get();
        return state.reservations.filter(reservation => reservation.status === status);
      },
      
      getUpcomingReservations: () => {
        const state = get();
        const now = new Date();
        return state.reservations
          .filter(reservation => {
            const reservationDate = new Date(reservation.reservationDate);
            return reservationDate >= now && 
                   (reservation.status === 'confirmed' || reservation.status === 'pending');
          })
          .sort((a, b) => 
            new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime()
          );
      },
      
      // 로딩 상태 관리
      setLoading: (key: string, loading: boolean) =>
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: loading
          }
        })),
      
      // 에러 상태 관리
      setError: (key: string, error: string | null) =>
        set((state) => ({
          error: {
            ...state.error,
            [key]: error
          }
        })),
      
      clearError: (key: string) =>
        set((state) => ({
          error: {
            ...state.error,
            [key]: null
          }
        })),
      
      clearAllErrors: () =>
        set({ error: {} }),

      // 백엔드 API 연동 액션들
      fetchUserReservations: async (userId: string) => {
        const { setLoading, setError, setReservations } = get();
        
        try {
          setLoading('fetch', true);
          setError('fetch', null);
          
          const reservations = await ReservationService.getUserReservations(userId);
          setReservations(reservations);
        } catch (error) {
          console.error('예약 목록 조회 오류:', error);
          setError('fetch', '예약 목록을 불러오는 중 오류가 발생했습니다.');
          throw error;
        } finally {
          setLoading('fetch', false);
        }
      },

      createReservation: async (reservationData: any) => {
        const { setLoading, setError, addReservation } = get();
        
        try {
          setLoading('create', true);
          setError('create', null);
          
          const newReservation = await ReservationService.createReservation(reservationData);
          addReservation(newReservation);
          return newReservation;
        } catch (error) {
          console.error('예약 생성 오류:', error);
          setError('create', '예약 생성 중 오류가 발생했습니다.');
          throw error;
        } finally {
          setLoading('create', false);
        }
      },

      cancelReservation: async (reservationId: string) => {
        const { setLoading, setError, updateReservation } = get();
        
        try {
          setLoading('cancel', true);
          setError('cancel', null);
          
          await ReservationService.cancelReservation(reservationId);
          updateReservation(reservationId, { status: 'cancelled' });
        } catch (error) {
          console.error('예약 취소 오류:', error);
          setError('cancel', '예약 취소 중 오류가 발생했습니다.');
          throw error;
        } finally {
          setLoading('cancel', false);
        }
      },

      updateReservationStatus: async (reservationId: string, status: 'confirmed' | 'cancelled') => {
        const { setLoading, setError, updateReservation } = get();
        
        try {
          setLoading('update', true);
          setError('update', null);
          
          await ReservationService.updateReservationStatus(reservationId, status);
          updateReservation(reservationId, { status });
        } catch (error) {
          console.error('예약 상태 업데이트 오류:', error);
          setError('update', '예약 상태 업데이트 중 오류가 발생했습니다.');
          throw error;
        } finally {
          setLoading('update', false);
        }
      },
    }),
    {
      name: 'reservation-store',
      storage: createJSONStorage(() => AsyncStorage),
      // currentReservation은 일시적이므로 persist하지 않음
      partialize: (state) => ({
        reservations: state.reservations,
        // loading, error, currentReservation은 persist하지 않음
      }),
    }
  )
);

export default useReservationStore;
