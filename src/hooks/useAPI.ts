import { useState, useCallback } from 'react';
import { ApiError, ApiResponse } from '../api/httpClient';
import { APIUtils } from '../api';

export interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseAPIOptions {
  showLoading?: boolean;
  showError?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
}

export function useAPI<T = any>(options: UseAPIOptions = {}) {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(
    async <R = T>(
      apiCall: () => Promise<ApiResponse<R>>,
      customOptions?: Partial<UseAPIOptions>
    ): Promise<R | null> => {
      const mergedOptions = { ...options, ...customOptions };
      const maxRetries = mergedOptions.retryCount || 0;
      const retryDelay = mergedOptions.retryDelay || 1000;

      let attempt = 0;
      
      while (attempt <= maxRetries) {
        try {
          setState(prev => ({ 
            ...prev, 
            loading: true, 
            error: null, 
            success: false 
          }));

          const response = await apiCall();
          
          setState(prev => ({
            ...prev,
            data: response.data,
            loading: false,
            error: null,
            success: true,
          }));

          if (mergedOptions.onSuccess) {
            mergedOptions.onSuccess(response.data);
          }

          return response.data;
        } catch (error) {
          attempt++;
          
          if (attempt <= maxRetries) {
            // 재시도 전 대기
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }

          // 최종 실패 처리
          const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : '알 수 없는 오류가 발생했습니다.';

          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
            success: false,
          }));

          if (mergedOptions.onError) {
            mergedOptions.onError(errorMessage);
          }

          return null;
        }
      }

      return null;
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const retry = useCallback(
    async <R = T>(apiCall: () => Promise<ApiResponse<R>>): Promise<R | null> => {
      return execute(apiCall);
    },
    [execute]
  );

  return {
    ...state,
    execute,
    reset,
    retry,
  };
}

// 특정 API용 커스텀 훅들
export function useAuthAPI(options?: UseAPIOptions) {
  return useAPI(options);
}

export function useTemplesAPI(options?: UseAPIOptions) {
  return useAPI({
    retryCount: 1,
    retryDelay: 500,
    ...options,
  });
}

export function useReservationsAPI(options?: UseAPIOptions) {
  return useAPI({
    retryCount: 2,
    retryDelay: 1000,
    ...options,
  });
}

export function useAttractionsAPI(options?: UseAPIOptions) {
  return useAPI({
    retryCount: 1,
    retryDelay: 500,
    ...options,
  });
}

// 페이지네이션을 지원하는 API 훅
export function usePaginatedAPI<T = any>(options?: UseAPIOptions) {
  const api = useAPI<{ items: T[]; total: number; hasMore: boolean }>(options);
  const [allItems, setAllItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const loadPage = useCallback(
    async (
      apiCall: (params: { limit: number; offset: number }) => Promise<ApiResponse<any>>,
      page: number = 1,
      limit: number = 20,
      append: boolean = false
    ) => {
      const paginationParams = APIUtils.createPaginationParams(page, limit);
      
      const result = await api.execute(() => apiCall(paginationParams));
      
      if (result) {
        if (append && page > 1) {
          setAllItems(prev => [...prev, ...result.items]);
        } else {
          setAllItems(result.items);
        }
        setCurrentPage(page);
      }
      
      return result;
    },
    [api]
  );

  const loadMore = useCallback(
    async (
      apiCall: (params: { limit: number; offset: number }) => Promise<ApiResponse<any>>,
      limit: number = 20
    ) => {
      if (api.data?.hasMore) {
        return loadPage(apiCall, currentPage + 1, limit, true);
      }
      return null;
    },
    [api.data?.hasMore, currentPage, loadPage]
  );

  const refresh = useCallback(
    async (
      apiCall: (params: { limit: number; offset: number }) => Promise<ApiResponse<any>>,
      limit: number = 20
    ) => {
      setAllItems([]);
      setCurrentPage(1);
      return loadPage(apiCall, 1, limit, false);
    },
    [loadPage]
  );

  return {
    ...api,
    allItems,
    currentPage,
    hasMore: api.data?.hasMore || false,
    loadPage,
    loadMore,
    refresh,
  };
}

// 실시간 검색을 지원하는 API 훅
export function useSearchAPI<T = any>(
  debounceDelay: number = 300,
  options?: UseAPIOptions
) {
  const api = useAPI<T[]>(options);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // 디바운스된 검색어 업데이트
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceDelay]);

  const search = useCallback(
    async (
      query: string,
      apiCall: (query: string) => Promise<ApiResponse<T[]>>
    ) => {
      setSearchTerm(query);
      
      if (query.trim()) {
        return api.execute(() => apiCall(query.trim()));
      } else {
        api.reset();
        return null;
      }
    },
    [api]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    api.reset();
  }, [api]);

  return {
    ...api,
    searchTerm,
    debouncedSearchTerm,
    search,
    clearSearch,
  };
}

export default useAPI;