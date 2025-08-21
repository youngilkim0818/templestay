// API 사용 예시 파일
// 실제 컴포넌트에서 이런 식으로 사용하시면 됩니다.

import { AuthAPI, TemplesAPI, ReservationsAPI, AttractionsAPI } from './index';
import { useAuthAPI, useTemplesAPI, useReservationsAPI, usePaginatedAPI } from '../hooks/useAPI';

// ==================== 인증 API 사용 예시 ====================

// 1. 로그인
export const loginExample = async () => {
  try {
    const response = await AuthAPI.login({
      email: 'user@example.com',
      password: 'password123',
    });
    
    if (__DEV__) {
      console.log('Login successful:', response.data);
    }
    // 토큰을 AsyncStorage에 저장하거나 상태 관리에 저장
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// 2. 소셜 로그인
export const googleLoginExample = async () => {
  try {
    const response = await AuthAPI.googleLogin('google_oauth_token');
    if (__DEV__) {
      console.log('Google login successful:', response.data);
    }
  } catch (error) {
    console.error('Google login failed:', error);
  }
};

// ==================== 템플 API 사용 예시 ====================

// 1. 템플 목록 조회
export const getTemplesExample = async () => {
  try {
    const response = await TemplesAPI.getTemples({
      region: '경상북도',
      sortBy: 'popularity',
      limit: 10,
    });
    
    if (__DEV__) {
      console.log('Temples:', response.data.temples);
    }
    if (__DEV__) {
      console.log('Total count:', response.data.total);
    }
  } catch (error) {
    console.error('Failed to fetch temples:', error);
  }
};

// 2. 내 위치 기반 근처 템플
export const getNearbyTemplesExample = async () => {
  try {
    const response = await TemplesAPI.getNearbyTemples(
      35.7749, // 위도
      128.8086, // 경도
      50 // 반경 (km)
    );
    
    if (__DEV__) {
      console.log('Nearby temples:', response.data.temples);
    }
  } catch (error) {
    console.error('Failed to fetch nearby temples:', error);
  }
};

// 3. 템플 검색
export const searchTemplesExample = async () => {
  try {
    const response = await TemplesAPI.searchTemples('불국사', {
      region: '경상북도',
      limit: 20,
    });
    
    if (__DEV__) {
      console.log('Search results:', response.data.temples);
    }
  } catch (error) {
    console.error('Search failed:', error);
  }
};

// ==================== 예약 API 사용 예시 ====================

// 1. 예약 생성
export const createReservationExample = async () => {
  try {
    const response = await ReservationsAPI.createReservation({
      templeId: 'temple-123',
      programId: 'program-456',
      reservationDate: '2024-08-15',
      reservationTime: '14:00',
      numberOfPeople: 2,
      guestInfo: {
        name: '김철수',
        phone: '010-1234-5678',
        email: 'kim@example.com',
        hasAllergies: false,
      },
      paymentMethod: 'card',
    });
    
    if (__DEV__) {
      console.log('Reservation created:', response.data);
    }
  } catch (error) {
    console.error('Reservation failed:', error);
  }
};

// 2. 내 예약 목록
export const getMyReservationsExample = async () => {
  try {
    const response = await ReservationsAPI.getMyReservations({
      status: 'confirmed',
      limit: 10,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    
    if (__DEV__) {
      console.log('My reservations:', response.data.reservations);
    }
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
  }
};

// ==================== 관광지 API 사용 예시 ====================

// 1. 관광지 검색
export const searchAttractionsExample = async () => {
  try {
    const response = await AttractionsAPI.searchAttractions('경주', {
      type: 'cultural_site',
      limit: 20,
    });
    
    if (__DEV__) {
      console.log('Attractions:', response.data.attractions);
    }
  } catch (error) {
    console.error('Search failed:', error);
  }
};

// 2. 관광 루트 추천
export const getTourRoutesExample = async () => {
  try {
    const response = await AttractionsAPI.getTourRoutes(
      35.7749, // 시작 위도
      128.8086, // 시작 경도
      {
        duration: 480, // 8시간
        interests: ['temple', 'cultural_site'],
        difficulty: 'easy',
        includeTemples: true,
      }
    );
    
    if (__DEV__) {
      console.log('Tour routes:', response.data);
    }
  } catch (error) {
    console.error('Failed to get tour routes:', error);
  }
};

// ==================== React Hook 사용 예시 ====================

// 컴포넌트에서 useAPI 훅 사용
export const TempleListComponent = () => {
  const api = useTemplesAPI({
    onSuccess: (data) => {
      if (__DEV__) {
        console.log('Temples loaded:', data);
      }
    },
    onError: (error) => console.error('Failed to load temples:', error),
  });

  const loadTemples = () => {
    api.execute(() => TemplesAPI.getTemples({ region: '경상북도' }));
  };

  // JSX에서 사용
  // {api.loading && <LoadingSpinner />}
  // {api.error && <ErrorMessage message={api.error} />}
  // {api.data && <TempleList temples={api.data.temples} />}
};

// 페이지네이션 사용 예시
export const PaginatedTempleListComponent = () => {
  const api = usePaginatedAPI({
    onError: (error) => console.error('Error:', error),
  });

  const loadFirstPage = () => {
    api.loadPage((params) => 
      TemplesAPI.getTemples({ ...params, region: '경상북도' })
    );
  };

  const loadMoreTemples = () => {
    api.loadMore((params) => 
      TemplesAPI.getTemples({ ...params, region: '경상북도' })
    );
  };

  // JSX에서 사용
  // {api.allItems.map(temple => <TempleCard key={temple.id} temple={temple} />)}
  // {api.hasMore && <Button onPress={loadMoreTemples} title="더 보기" />}
};

// 검색 기능 사용 예시
export const TempleSearchComponent = () => {
  // const searchAPI = useSearchAPI(300); // 300ms 디바운스 - 임시 주석
  const searchAPI = { search: (query: string, callback: (term: string) => void) => {} }; // 임시 구현

  const handleSearch = (query: string) => {
    searchAPI.search(query, (searchTerm: string) =>
      TemplesAPI.searchTemples(searchTerm)
    );
  };

  // JSX에서 사용
  // <TextInput onChangeText={handleSearch} value={searchAPI.searchTerm} />
  // {searchAPI.loading && <SearchingIndicator />}
  // {searchAPI.data && <SearchResults results={searchAPI.data} />}
};

// ==================== 에러 처리 예시 ====================

export const errorHandlingExample = async () => {
  try {
    const response = await TemplesAPI.getTemples();
    if (__DEV__) {
      console.log('Success:', response.data);
    }
  } catch (error) {
    // ApiError 타입의 에러 처리
    if (error && typeof error === 'object' && 'status' in error) {
      switch (error.status) {
        case 401:
          if (__DEV__) {
            console.log('로그인이 필요합니다.');
          }
          // 로그인 화면으로 리다이렉트
          break;
        case 403:
          if (__DEV__) {
            console.log('접근 권한이 없습니다.');
          }
          break;
        case 404:
          if (__DEV__) {
            console.log('요청한 정보를 찾을 수 없습니다.');
          }
          break;
        case 500:
          if (__DEV__) {
            console.log('서버 오류가 발생했습니다.');
          }
          break;
        default:
          if (__DEV__) {
            console.log('알 수 없는 오류:', (error as any).message || '오류 발생');
          }
      }
    } else {
      if (__DEV__) {
        console.log('네트워크 오류:', error);
      }
    }
  }
};

// ==================== 설정 예시 ====================

// 앱 시작 시 API 설정
export const initializeAPI = () => {
  // configureAPI({
  //   baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.templestay.kr/v1',
  //   timeout: 15000,
  //   defaultHeaders: {
  //     'X-App-Version': '1.0.0',
  //     'X-Platform': 'mobile',
  //   },
  // });
};

export default {
  loginExample,
  getTemplesExample,
  createReservationExample,
  searchAttractionsExample,
  TempleListComponent,
  PaginatedTempleListComponent,
  TempleSearchComponent,
  errorHandlingExample,
  initializeAPI,
};