import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Temple, SearchFilters, LoadingState, ErrorState, SortParams } from '../types';

interface TempleState {
  // 템플 데이터
  temples: Temple[];
  favoriteTemples: Temple[];
  searchResults: Temple[];
  currentTemple: Temple | null;
  
  // 검색 및 필터링
  filters: SearchFilters;
  sortParams: SortParams;
  searchQuery: string;
  
  // 상태 관리
  loading: LoadingState;
  error: ErrorState;
  
  // 템플 관리 액션
  setTemples: (temples: Temple[]) => void;
  addTemples: (temples: Temple[]) => void;
  updateTemple: (templeId: string, updates: Partial<Temple>) => void;
  setCurrentTemple: (temple: Temple | null) => void;
  
  // 검색 및 필터링 액션
  setSearchResults: (results: Temple[]) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  updateFilters: (updates: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  setSortParams: (sortParams: SortParams) => void;
  
  // 찜하기 관리
  setFavoriteTemples: (temples: Temple[]) => void;
  addToFavorites: (temple: Temple) => void;
  removeFromFavorites: (templeId: string) => void;
  toggleFavorite: (temple: Temple) => void;
  isFavorite: (templeId: string) => boolean;
  
  // 유틸리티 액션
  getTempleById: (templeId: string) => Temple | undefined;
  getTemplesByRegion: (region: string) => Temple[];
  getTemplesByType: (type: string) => Temple[];
  searchTemplesLocal: (query: string) => Temple[];
  
  // 로딩/에러 상태 관리
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // 데이터 초기화
  clearAll: () => void;
}

const defaultFilters: SearchFilters = {
  region: undefined,
  type: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  rating: undefined,
  facilities: [],
  accessibility: {
    wheelchairAccessible: undefined,
    parkingAvailable: undefined,
    publicTransportAccessible: undefined,
  },
};

const defaultSortParams: SortParams = {
  sortBy: 'name',
  sortOrder: 'asc',
};

const useTempleStore = create<TempleState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      temples: [],
      favoriteTemples: [],
      searchResults: [],
      currentTemple: null,
      filters: defaultFilters,
      sortParams: defaultSortParams,
      searchQuery: '',
      loading: {},
      error: {},
      
      // 템플 관리 액션
      setTemples: (temples: Temple[]) =>
        set({ temples }),
      
      addTemples: (newTemples: Temple[]) =>
        set((state) => {
          const existingIds = new Set(state.temples.map(t => t.id));
          const uniqueNewTemples = newTemples.filter(t => !existingIds.has(t.id));
          return { temples: [...state.temples, ...uniqueNewTemples] };
        }),
      
      updateTemple: (templeId: string, updates: Partial<Temple>) =>
        set((state) => ({
          temples: state.temples.map(temple =>
            temple.id === templeId
              ? { ...temple, ...updates, updatedAt: new Date().toISOString() }
              : temple
          ),
          currentTemple: state.currentTemple?.id === templeId
            ? { ...state.currentTemple, ...updates, updatedAt: new Date().toISOString() }
            : state.currentTemple,
        })),
      
      setCurrentTemple: (temple: Temple | null) =>
        set({ currentTemple: temple }),
      
      // 검색 및 필터링 액션
      setSearchResults: (results: Temple[]) =>
        set({ searchResults: results }),
      
      setSearchQuery: (query: string) =>
        set({ searchQuery: query }),
      
      setFilters: (filters: SearchFilters) =>
        set({ filters }),
      
      updateFilters: (updates: Partial<SearchFilters>) =>
        set((state) => ({
          filters: { ...state.filters, ...updates }
        })),
      
      clearFilters: () =>
        set({ filters: defaultFilters }),
      
      setSortParams: (sortParams: SortParams) =>
        set({ sortParams }),
      
      // 찜하기 관리
      setFavoriteTemples: (temples: Temple[]) =>
        set({ favoriteTemples: temples }),
      
      addToFavorites: (temple: Temple) =>
        set((state) => {
          const exists = state.favoriteTemples.some(t => t.id === temple.id);
          if (!exists) {
            return { favoriteTemples: [...state.favoriteTemples, temple] };
          }
          return state;
        }),
      
      removeFromFavorites: (templeId: string) =>
        set((state) => ({
          favoriteTemples: state.favoriteTemples.filter(t => t.id !== templeId)
        })),
      
      toggleFavorite: (temple: Temple) =>
        set((state) => {
          const exists = state.favoriteTemples.some(t => t.id === temple.id);
          if (exists) {
            return {
              favoriteTemples: state.favoriteTemples.filter(t => t.id !== temple.id)
            };
          } else {
            return {
              favoriteTemples: [...state.favoriteTemples, temple]
            };
          }
        }),
      
      isFavorite: (templeId: string) => {
        const state = get();
        return state.favoriteTemples.some(t => t.id === templeId);
      },
      
      // 유틸리티 함수들
      getTempleById: (templeId: string) => {
        const state = get();
        return state.temples.find(temple => temple.id === templeId);
      },
      
      getTemplesByRegion: (region: string) => {
        const state = get();
        return state.temples.filter(temple => temple.region === region);
      },
      
      getTemplesByType: (type: string) => {
        const state = get();
        return state.temples.filter(temple => 
          temple.programs.some(program => program.type === type)
        );
      },
      
      searchTemplesLocal: (query: string) => {
        const state = get();
        const lowercaseQuery = query.toLowerCase();
        return state.temples.filter(temple =>
          temple.name.toLowerCase().includes(lowercaseQuery) ||
          temple.region.toLowerCase().includes(lowercaseQuery) ||
          temple.address.toLowerCase().includes(lowercaseQuery) ||
          temple.description.toLowerCase().includes(lowercaseQuery)
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
      
      // 데이터 초기화
      clearAll: () =>
        set({
          temples: [],
          searchResults: [],
          currentTemple: null,
          filters: defaultFilters,
          sortParams: defaultSortParams,
          searchQuery: '',
          loading: {},
          error: {},
          // favoriteTemples는 유지
        }),
    }),
    {
      name: 'temple-store',
      storage: createJSONStorage(() => AsyncStorage),
      // 일부 데이터만 persist
      partialize: (state) => ({
        favoriteTemples: state.favoriteTemples,
        temples: state.temples, // 캐싱을 위해 temples도 저장
        // 검색 결과, 현재 템플, 로딩/에러 상태는 persist하지 않음
      }),
    }
  )
);

export default useTempleStore;