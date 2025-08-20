import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserPreferences, LoadingState, ErrorState } from '../types';

interface UserState {
  // 사용자 정보
  user: User | null;
  isLoggedIn: boolean;
  preferences: UserPreferences | null;
  
  // 상태 관리
  loading: LoadingState;
  error: ErrorState;
  
  // 액션들
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedInfo: Partial<User>) => void;
  setPreferences: (preferences: UserPreferences) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  
  // 로딩/에러 상태 관리
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      isLoggedIn: false,
      preferences: null,
      loading: {},
      error: {},
      
      // 인증 관련 액션
      login: (user: User) => 
        set({ 
          isLoggedIn: true, 
          user,
          error: {} // 로그인 성공 시 에러 초기화
        }),
      
      logout: async () => {
        try {
          // AsyncStorage에서 사용자 관련 데이터 정리
          await AsyncStorage.multiRemove([
            'userName',
            'userProfileImage',
            'userToken'
          ]);
        } catch (error) {
          console.error('Error clearing AsyncStorage on logout:', error);
        }
        
        set({ 
          isLoggedIn: false, 
          user: null, 
          preferences: null,
          loading: {},
          error: {}
        });
      },
      
      updateUser: (updatedInfo: Partial<User>) =>
        set((state) => ({
          user: state.user ? { 
            ...state.user, 
            ...updatedInfo,
            updatedAt: new Date().toISOString()
          } : null,
        })),
      
      // 사용자 선호도 관리
      setPreferences: (preferences: UserPreferences) =>
        set({ preferences }),
      
      updatePreferences: (updates: Partial<UserPreferences>) =>
        set((state) => ({
          preferences: state.preferences ? {
            ...state.preferences,
            ...updates
          } : null
        })),
      
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
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      // 민감한 정보는 persist하지 않도록 필터링
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        preferences: state.preferences,
        // loading과 error는 persist하지 않음
      }),
    }
  )
);

export default useUserStore; 