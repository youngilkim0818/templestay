import React, { useMemo, useCallback, memo, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TempleStackParamList } from '../../navigation/TempleStackNavigator';
import { TEMPLES_DATA, getTempleByIdWithImages } from '../../data/temple-data';
import { TempleService } from '../../services/templeService';
import { Temple } from '../../types';
import { TourApiService, TourAttraction, formatApiDistance, calculateDistanceFromApi } from '../../services/tourApiService';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// Hub(LocgoHubTarService1) 지역 코드 매핑 (도/광역시 코드)
const REGION_TO_HUB_AREA: Record<string, number> = {
  '서울': 11,
  '부산': 26,
  '대구': 27,
  '인천': 28,
  '광주': 29,
  '대전': 30,
  '울산': 31,
  '세종': 36,
  '경기': 41,
  '강원': 42,
  '충북': 43,
  '충남': 44,
  '전북': 45,
  '전남': 46,
  '경북': 47,
  '경남': 48,
  '제주': 50,
};

const getHubAreaCdFromTemple = (temple: Temple): number | undefined => {
  if (!temple?.region) return undefined;
  // region이 '경북', '경남', '부산' 등으로 들어옴
  const key = Object.keys(REGION_TO_HUB_AREA).find(k => temple.region.startsWith(k));
  return key ? REGION_TO_HUB_AREA[key] : undefined;
};

// 주소 기반 허브 시군구코드(5자리) 추론 - 앱 내 주요 사찰에 대한 최소 매핑
const HUB_SIGUNGU_FROM_ADDRESS = [
  { includes: ['경주시'], code: 47130 }, // 불국사/골굴사
  { includes: ['김천시'], code: 47150 }, // 직지사
  { includes: ['합천군'], code: 48740 }, // 해인사(경남)
  { includes: ['양산시'], code: 48270 }, // 통도사(경남)
  { includes: ['금정구'], code: 26410 }, // 범어사(부산)
];

const getHubSigunguFromTemple = (temple: Temple): number | undefined => {
  const addr = temple?.address || '';
  const hit = HUB_SIGUNGU_FROM_ADDRESS.find(m => m.includes.some(tok => addr.includes(tok)));
  return hit?.code;
};

const ImageGallery = memo<{
  images: string[];
  mainImage: string;
}>(({ images, mainImage }) => {
  return (
    <View className="w-full h-80 rounded-t-3xl overflow-hidden">
      <Image source={{ uri: mainImage } as any} className="w-full h-full" resizeMode="cover" />
    </View>
  );
});

const ProgramCard = memo<{
  program: any;
  onReservePress: () => void;
}>(({ program, onReservePress }) => {
  return (
    <View className="bg-stone-50 rounded-xl p-3 border border-stone-200 mb-3">
      <Text className="text-lg font-semibold text-sage-600 mb-1">{program.title}</Text>
      <Text className="text-sm text-neutral-600 mb-2" numberOfLines={2}>{program.description}</Text>
      <Text className="text-base font-bold text-neutral-900">₩{program.price?.toLocaleString()}</Text>
    </View>
  );
});

const AttractionCard = memo<{
  attraction: TourAttraction | { name: string; distance: string; description: string; };
  templeLocation?: { latitude: number; longitude: number };
}>(({ attraction, templeLocation }) => {
  const isTourAttraction = 'contentid' in attraction;
  
  const displayName = isTourAttraction ? attraction.title : attraction.name;
  const displayDistance = isTourAttraction && templeLocation 
    ? `🚗 ${formatApiDistance(calculateDistanceFromApi(templeLocation.latitude, templeLocation.longitude, attraction.mapy, attraction.mapx))}`
    : (attraction as any).distance;
  const displayDescription = isTourAttraction 
    ? `${attraction.addr1} ${attraction.addr2 || ''}`.trim()
    : (attraction as any).description;

  return (
    <View className="bg-white rounded-2xl p-5 mb-4 border border-stone-200">
      {isTourAttraction && attraction.firstimage && (
        <View className="w-full h-24 rounded-xl mb-3 bg-stone-100 overflow-hidden">
          <Image source={{ uri: attraction.firstimage }} className="w-full h-full" resizeMode="cover" />
        </View>
      )}
      <View className="mb-3">
        <Text className="text-lg font-bold text-sage-600 mb-2">{displayName}</Text>
        <Text className="text-sm font-semibold text-neutral-600">{displayDistance}</Text>
      </View>
      <Text className="text-sm text-neutral-600 leading-5">{displayDescription}</Text>
    </View>
  );
});

// 간단한 캘린더 컴포넌트
const SimpleCalendar = memo<{
  selectedDate: Date[];
  currentMonth: Date;
  selectedProgram: any;
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}>(({ selectedDate, currentMonth, selectedProgram, onDateSelect, onMonthChange }) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    // 이전 달의 마지막 날들 (빈 칸으로 채움)
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // 7의 배수로 맞추기 위해 마지막에 빈 칸 추가
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 0; i < remainingDays; i++) {
        days.push(null);
      }
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View className="bg-white p-4 border border-stone-200">
      {/* 월 네비게이션 */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => onMonthChange('prev')} className="p-1">
          <Ionicons name="chevron-back" size={16} color="#616351" />
        </TouchableOpacity>
        <Text className="text-sm font-semibold text-neutral-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => onMonthChange('next')} className="p-1">
          <Ionicons name="chevron-forward" size={16} color="#616351" />
        </TouchableOpacity>
      </View>

      {/* 분리선 */}
      <View className="h-px bg-stone-200 mb-4" />

                  {/* 요일 헤더 */}
            <View className="flex-row mb-4">
              {dayNames.map((day, index) => (
                                  <View key={day} className="flex-1 items-center px-0.5">
                    <Text className={`text-xs font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-neutral-600'}`} numberOfLines={1}>
                      {day}
                    </Text>
                  </View>
              ))}
            </View>

      {/* 날짜 그리드 - 7열로 정확하게 배치 */}
      <View className="items-center">
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
          <View key={weekIndex} className="flex-row mb-0">
            {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
              const today = new Date();
              const isPastDate = day && day < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              
              // 프로그램별 예약 가능 날짜 확인
              let isReservationAvailable = true;
              if (day && selectedProgram) {
                const daysUntilProgram = Math.ceil((day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (selectedProgram.title.includes('석굴암')) {
                  // 3번 프로그램: 3일 전까지 예약 가능 (오늘, 내일, 모레 빨간색)
                  isReservationAvailable = daysUntilProgram >= 3;
                } else if (selectedProgram.title.includes('국악문화공연')) {
                  // 2번 프로그램: 1일 전까지 예약 가능 (오늘만 빨간색)
                  isReservationAvailable = daysUntilProgram >= 1;
                } else {
                  // 1번 프로그램: 3일 전까지 예약 가능 (오늘, 내일, 모레 빨간색)
                  isReservationAvailable = daysUntilProgram >= 3;
                }
              }
              
              return (
                <View key={dayIndex} className="w-6 h-6 items-center justify-center m-0.5">
                  {day ? (
                    isPastDate ? (
                      // 지난 날짜 - 회색 처리, 터치 불가
                      <View className="w-6 h-6 items-center justify-center rounded-full bg-stone-200">
                        <Text className="text-xs font-medium text-stone-400">
                          {day.getDate()}
                        </Text>
                      </View>
                    ) : !isReservationAvailable ? (
                      // 예약 불가능한 날짜 - 빨간색 처리, 터치 불가
                      <View className="w-6 h-6 items-center justify-center rounded-full bg-red-200">
                        <Text className="text-xs font-medium text-red-600">
                          {day.getDate()}
                        </Text>
                      </View>
                    ) : (
                      // 예약 가능한 날짜 - 터치 가능
                      <TouchableOpacity
                        onPress={() => onDateSelect(day)}
                        className={`w-6 h-6 items-center justify-center rounded-full ${
                          selectedDate.some(selected => day.toDateString() === selected.toDateString())
                            ? 'bg-sage-600'
                            : 'bg-stone-50'
                        }`}
                      >
                        <Text className={`text-xs font-medium ${
                          selectedDate.some(selected => day.toDateString() === selected.toDateString())
                            ? 'text-white'
                            : 'text-neutral-700'
                        }`}>
                          {day.getDate()}
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    <View className="w-6 h-6" />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

const ReservationDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TempleStackParamList>>();
  const route = useRoute<RouteProp<TempleStackParamList, 'ReservationDetail'>>();
  const params: any = route.params;
  const templeId = params?.templeId || params?.params?.templeId;
  
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [attractions, setAttractions] = useState<TourAttraction[]>([]);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [adultCount, setAdultCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [elementaryCount, setElementaryCount] = useState(0);
  const [preschoolCount, setPreschoolCount] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank' | 'onsite' | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const loadTempleWithImages = async () => {
      if (!templeId) {
        setLoading(false);
        return;
      }
      try {
        console.log('🏛️ 사찰 상세 데이터 로딩:', templeId);
        // 로컬 이미지를 우선적으로 사용하기 위해 getTempleByIdWithImages 대신 기본 데이터 사용
        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
        if (basicTemple) {
          setTemple(basicTemple);
          console.log('✅ 사찰 기본 데이터 로드 완료:', basicTemple.name);
          console.log('🔍 basicTemple.imageUrl:', basicTemple.imageUrl);
          // Supabase에서 프로그램 최신화 (있으면 덮어쓰기)
          try {
            const programs = await TempleService.getTemplePrograms(String(basicTemple.id));
            if (programs && programs.length > 0) {
              setTemple({ ...basicTemple, programs });
              console.log(`✅ 프로그램 ${programs.length}개 로드`);
            }
          } catch {}
        } else {
          console.log('❌ 사찰 데이터를 찾을 수 없음');
          setTemple(null);
        }
      } catch (error) {
        console.error('❌ 사찰 데이터 로드 실패:', error);
        // 에러 발생 시에도 기본 데이터 사용 시도
        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
        if (basicTemple) {
          setTemple(basicTemple);
          console.log('✅ 에러 후 기본 데이터 사용:', basicTemple.name);
        } else {
          setTemple(null);
        }
      } finally {
        setLoading(false);
      }
    };
    loadTempleWithImages();
  }, [templeId]);

  // Load attractions based on area code when temple data is available
  useEffect(() => {
    const loadAttractionsByArea = async () => {
      if (temple) {
        setAttractionsLoading(true);
        try {
          const hubAreaCd = getHubAreaCdFromTemple(temple);
          const hubSigungu = getHubSigunguFromTemple(temple);
          console.log(`🏞️ 허브 지역코드 기반 주변 관광지 검색 시작: hubAreaCd=${hubAreaCd}, hubSigungu=${hubSigungu}`);
          // 허브 API (최근 n개월 롤백) 우선
          let nearbyAttractions: TourAttraction[] = await TourApiService.getHubAttractionsByAreaWithFallback(
            hubAreaCd || 47,
            hubSigungu,
            6,
            20
          );
          
          const filteredAttractions = (nearbyAttractions || [])
            .filter(attraction => !attraction.title.includes(temple.name))
            .slice(0, 5);

          // 3) 이미지 보강: firstimage가 없으면 사진갤러리에서 1장 수집
          const enriched = await Promise.all(
            filteredAttractions.map(async (a) => {
              if (!a.firstimage) {
                try {
                  const photos = await TourApiService.getGalleryDetailByTitle(a.title, 1, 1);
                  if (photos && photos.length > 0 && photos[0].galWebImageUrl) {
                    const safeUrl = photos[0].galWebImageUrl.startsWith('http://')
                      ? photos[0].galWebImageUrl.replace('http://', 'https://')
                      : photos[0].galWebImageUrl;
                    return { ...a, firstimage: safeUrl } as TourAttraction;
                  }
                } catch {}
              }
              return a;
            })
          );
          
          if (enriched.length > 0) {
            setAttractions(enriched);
            console.log(`✅ 주변 관광지 ${enriched.length}개 로드 완료 (이미지 보강 포함)`);
          } else {
            console.log('⚠️ 주변 관광지 없음 → fallback 사용');
            setAttractions([]);
          }
        } catch (error) {
          console.error('❌ 주변 관광지 로드 실패:', error);
          setAttractions([]);
        } finally {
          setAttractionsLoading(false);
        }
      }
    };

    loadAttractionsByArea();
  }, [temple]);
  
  const handleReservePress = useCallback(() => {
    navigation.navigate('ReservationPeople');
  }, [navigation]);
  
  const handleFavoritePress = useCallback(() => {
    // Favorite logic
  }, []);
  
  const handleDateSelect = useCallback((date: Date) => {
    if (!selectedProgram) {
      setErrorMessage('프로그램을 먼저 선택해주세요.');
      return;
    }
    
    // 프로그램별 예약 가능 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilProgram = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let isReservationAvailable = false;
    
    if (selectedProgram.title.includes('석굴암')) {
      // 3번 프로그램: 석굴암 - 당일 예약 가능
      isReservationAvailable = daysUntilProgram >= 0;
    } else if (selectedProgram.title.includes('국악문화공연')) {
      // 2번 프로그램: 국악문화공연 - 1일 전까지 예약 가능
      isReservationAvailable = daysUntilProgram >= 1;
    } else {
      // 1번 프로그램: 3일 전까지 예약 가능 (오늘, 내일, 모레 빨간색)
      isReservationAvailable = daysUntilProgram >= 3;
    }
    
    // 예약 불가능한 날짜는 선택할 수 없음
    if (!isReservationAvailable) {
      console.log('📅 예약 불가능한 날짜:', date.toDateString());
      return;
    }
    
    // 2일짜리 프로그램이므로 선택된 날짜와 다음날을 포함
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    // 이미 선택된 날짜 범위에 포함되어 있는지 확인
    const isDateInRange = selectedDate.some(selected => 
      selected.toDateString() === date.toDateString() || 
      selected.toDateString() === nextDay.toDateString()
    );
    
    if (isDateInRange) {
      // 선택된 날짜 범위를 다시 터치하면 선택 해제
      setSelectedDate([]);
      console.log('📅 날짜 선택 해제');
    } else {
      // 새로운 날짜 범위 선택
      setSelectedDate([date, nextDay]);
      console.log('📅 선택된 날짜 범위:', date.toDateString(), '~', nextDay.toDateString());
    }
    
    // 날짜 관련 경고문 초기화
    if (errorMessage === '날짜를 선택해주세요.') {
      setErrorMessage('');
    }
  }, [selectedDate, selectedProgram, errorMessage]);
  
  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  }, []);

  // 프로그램 선택 핸들러
  const handleProgramSelect = useCallback((program: any) => {
    if (selectedProgram && selectedProgram.title === program.title) {
      // 같은 프로그램을 다시 클릭하면 선택 해제
      setSelectedProgram(null);
      console.log('📋 프로그램 선택 해제:', program.title);
    } else {
      // 새로운 프로그램 선택
      setSelectedProgram(program);
      console.log('📋 선택된 프로그램:', program.title);
    }
    
    // 프로그램 관련 경고문 초기화
    if (errorMessage === '프로그램을 선택해주세요.') {
      setErrorMessage('');
    }
  }, [selectedProgram, errorMessage]);

  // 총 금액 계산 (선택된 프로그램 가격 기준)
  const totalAmount = useMemo(() => {
    if (!selectedProgram) {
      // 프로그램이 선택되지 않은 경우 기본 가격 사용
      return (adultCount * 120000) + (studentCount * 80000) + (elementaryCount * 60000) + (preschoolCount * 40000);
    }
    
    // 프로그램별 연령대별 가격 적용 (새로운 가격 기준)
    let total = 0;
    
    if (selectedProgram.title.includes('석굴암')) {
      // 3번 프로그램: 석굴암
      total = (adultCount * 150000) + (studentCount * 140000) + (elementaryCount * 130000) + (preschoolCount * 120000);
    } else if (selectedProgram.title.includes('국악문화공연')) {
      // 2번 프로그램: 국악문화공연
      total = (adultCount * 130000) + (studentCount * 120000) + (elementaryCount * 110000) + (preschoolCount * 100000);
    } else {
      // 1번 프로그램: 기본 불국사
      total = (adultCount * 120000) + (studentCount * 110000) + (elementaryCount * 100000) + (preschoolCount * 90000);
    }
    
    return total;
  }, [selectedProgram, adultCount, studentCount, elementaryCount, preschoolCount]);

  // 예약 처리 함수
  const handleReservation = useCallback(() => {
    if (selectedDate.length === 0) {
      setErrorMessage('날짜를 선택해주세요.');
      return;
    }
    if (adultCount === 0 && studentCount === 0 && elementaryCount === 0 && preschoolCount === 0) {
      setErrorMessage('인원을 선택해주세요.');
      return;
    }
    if (!selectedProgram) {
      setErrorMessage('프로그램을 선택해주세요.');
      return;
    }
    
    // 에러 메시지 초기화
    setErrorMessage('');
    // 예약 모달 표시
    setShowReservationModal(true);
  }, [selectedDate, adultCount, studentCount, elementaryCount, preschoolCount, selectedProgram]);

  // 결제 방법 선택 함수
  const handlePaymentMethodSelect = useCallback((method: 'bank' | 'onsite') => {
    setSelectedPaymentMethod(method);
  }, []);

  // 최종 예약 완료 함수
  const handleFinalReservation = useCallback(() => {
    if (!selectedPaymentMethod) {
      setErrorMessage('결제 방법을 선택해주세요.');
      return;
    }
    
    // 에러 메시지 초기화
    setErrorMessage('');
    // 예약 완료 처리
    setShowReservationModal(false);
    setSelectedPaymentMethod(null);
    setShowCompletionModal(true);
  }, [selectedPaymentMethod]);
  
  const fallbackAttractions = useMemo(() => [
    { name: '설악산 국립공원', distance: '🚗 1.5km • 도보 20분', description: '아름다운 자연경관과 함께 산사의 정취를 느낄 수 있는 명소입니다.' },
    { name: '불국사 석굴암', distance: '🚗 2.3km • 도보 30분', description: '유네스코 세계문화유산으로 지정된 역사적인 명소입니다.' }
  ], []);

  if (loading || !temple) {
    return (
      <View className="flex-1 justify-center items-center bg-stone-100">
        <ActivityIndicator size="large" color={COLORS.brand.sage} />
        <Text className="mt-3 text-neutral-600">상세 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-stone-100">
      {/* 전체 사진칸 */}
      <View className="relative h-80 bg-stone-200">
        {temple.imageUrl ? (
          <Image 
            source={temple.imageUrl} 
            className="w-full h-full" 
            resizeMode="cover"
            onError={(error) => {
              console.log('이미지 로드 에러:', error);
              console.log('temple.imageUrl:', temple.imageUrl);
              console.log('temple.name:', temple.name);
            }}
            onLoad={() => console.log('이미지 로드 성공:', temple.imageUrl)}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl">🏯</Text>
            <Text className="text-sm text-neutral-500 mt-2">이미지를 불러올 수 없습니다</Text>
            <Text className="text-xs text-neutral-400 mt-1">imageUrl: {JSON.stringify(temple.imageUrl)}</Text>
            <Text className="text-xs text-neutral-400 mt-1">temple.name: {temple.name}</Text>
          </View>
        )}
      </View>

      {/* 본문 */}
      <View className="bg-white -mt-5 rounded-t-1xl px-5 pt-6 pb-10">
        {/* 상단: 제목/주소 + 캘린더 + 인원선택 */}
        <View className="mb-6">
          {/* 제목과 주소 */}
          <View className="mb-4">
        <Text className="text-2xl font-bold text-sage-600 mb-2">{temple.name}</Text>
            <Text className="text-neutral-700 mb-2">{temple.address}</Text>

          </View>

        {/* 템플스테이 프로그램 */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-3">템플스테이 프로그램</Text>
          {(() => {
            const programs: any[] = (temple as any).programs && (temple as any).programs.length > 0
              ? (temple as any).programs
              : ((temple as any).templestay || []);
            if (!programs || programs.length === 0) {
              return (
                <Text className="text-neutral-600">등록된 프로그램이 없습니다.</Text>
              );
            }
            return programs.slice(0, 3).map((program: any, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => handleProgramSelect(program)}
                  className={`mb-3 p-3 border ${
                    selectedProgram && selectedProgram.title === program.title
                      ? 'bg-sage-50 border-sage-400'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <Text className="text-lg font-semibold text-sage-600 mb-1">{program.title}</Text>
                  <Text className="text-sm text-neutral-600 mb-2" numberOfLines={2}>{program.description}</Text>
                  <Text className="text-base font-bold text-neutral-900">₩{program.price?.toLocaleString()}</Text>
                  {selectedProgram && selectedProgram.title === program.title && (
                    <View className="mt-2 flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#059669" />
                      <Text className="text-sm text-sage-600 ml-1">선택됨</Text>
              </View>
                  )}
                </TouchableOpacity>
            ));
          })()}
        </View>

          {/* 선택된 프로그램 정보 (프로그램을 선택했을 때만 표시) */}
          {selectedProgram && (
            <View className="mb-6">
              {/* 참가비용 섹션 */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Text className="text-stone-700 font-bold text-sm">₩</Text>
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">참가비용</Text>
                </View>
                
                {/* 가격표 */}
                <View className="bg-stone-100 border border-stone-200 rounded p-3 mb-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-neutral-700">성인</Text>
                    <Text className="text-sm font-semibold text-neutral-700">중고생</Text>
                    <Text className="text-sm font-semibold text-neutral-700">초등생</Text>
                    <Text className="text-sm font-semibold text-neutral-700">미취학</Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-base font-bold text-neutral-900">
                      {selectedProgram.title.includes('석굴암') ? '150,000' : 
                       selectedProgram.title.includes('국악문화공연') ? '130,000' : '120,000'}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {selectedProgram.title.includes('석굴암') ? '140,000' : 
                       selectedProgram.title.includes('국악문화공연') ? '120,000' : '110,000'}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {selectedProgram.title.includes('석굴암') ? '130,000' : 
                       selectedProgram.title.includes('국악문화공연') ? '110,000' : '100,000'}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {selectedProgram.title.includes('석굴암') ? '120,000' : 
                       selectedProgram.title.includes('국악문화공연') ? '100,000' : '90,000'}
                    </Text>
                  </View>
                </View>
                
                {/* 예약 안내 */}
                <Text className="text-sm text-red-500">
                  ※ 프로그램 시작일 {selectedProgram.title.includes('석굴암') ? '3일' : 
                                   selectedProgram.title.includes('국악문화공연') ? '1일' : '3일'} 전까지 예약가능.
                </Text>
              </View>

              {/* 프로그램 소개 섹션 */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="calendar" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">프로그램 소개</Text>
                </View>
                
                                  <View className="space-y-3">
                    <Text className="text-sm text-neutral-700 leading-5">
                      {selectedProgram.title.includes('석굴암') ? 
                        '자랑스런 세계문화유산 석굴암에서 새벽예불을 보고 토함산 일출도 볼 수 도 있는 한시적으로 운영하는 특별템플스테이입니다. 석굴암 새벽예불을 참가하고 싶은분들을 위한 특별프로그램으로 체험권은 사용할 수 없습니다.' :
                       selectedProgram.title.includes('국악문화공연') ? 
                        '매달 네째주 토요일 문화의 날을 위하여 세계문화유산인 불국사에서 한국전통국악무용인 승무, 한량무, 작법무인 나비춤, 관음무등을 관람할 수 있는 특별 템플스테이 입니다. 또한 불국사 사찰투어 와 더불어 대웅전앞 석가탑과 다보탑의 아름다운 풍경을 느끼며 불국사 천년의 향기를 느껴볼 수 있 수 있습니다. 이프로그램은 체험권사용할 수 없습니다.' :
                        '세계문화유산인 불국사에서 많은 국보문화재를 알아보고 고즈녁한 야간에 달빛과 별빛을 벗삼아 대웅전앞 석가탑과 다보탑의 아름다운 풍경을 느끼며 불국사 천년의 향기를 느껴볼 수 있 수 있는 프로그램입니다.'}
                    </Text>
                    
                    {/* 추가 정보 */}
                    <View className="space-y-2">
                      <Text className="text-sm text-neutral-700">
                        • {selectedProgram.title.includes('석굴암') ? 
                           '예약후 7일 이내에 입금부탁드립니다. 미입금시 예약취소되실수 있습니다.' :
                           '예약후 7일 이내에 미입금시 취소될 수 있습니다.'}
                      </Text>
                      <Text className="text-sm text-neutral-700">
                        • 단체는 프로그램 사전협의 가능하며 {selectedProgram.title.includes('석굴암') ? '' : '사찰사정에 따라 프로그램이 일부 변동될 수 있습니다.'}
                      </Text>
                      {selectedProgram.title.includes('석굴암') && (
                        <Text className="text-sm text-neutral-700">
                          • 사찰사정에 따라 프로그램이 일부 변동될 수 있습니다.
                        </Text>
                      )}
                      <Text className="text-sm text-neutral-700">
                        • {selectedProgram.title.includes('석굴암') ? 
                           '또한 템플관은 불국사경내가 아닌 차량으로 5분 도보로는 25분거리에 불국사경내와 떨어져 위치하고 있음을 미리 인지하시가 바랍니다.' :
                           '또한 불국사 템플관은 불국사 경내에 위치하고 있지 않고 도보로 25분 거리에 있음을 인지하시기 바랍니다.'}
                      </Text>
                    </View>
                    
                    <Text className="text-sm text-neutral-500 text-center">***</Text>
                  </View>
              </View>

              {/* 일반 준비물 섹션 */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="briefcase" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">일반 준비물</Text>
                </View>
                
                <Text className="text-sm text-neutral-700 leading-5">
                  개인 세면도구, 수건, 여벌옷(외투), 운동화(편한 신발), 양말, 개인(보온) 물통 겨울 참가시, 방한용품 및 아이젠 등
                </Text>
              </View>

              {/* 환불규정 섹션 */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="megaphone" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">환불규정</Text>
                </View>
                
                <View className="space-y-2">
                  <Text className="text-sm text-neutral-700">• 참가 예정일 3일 전 100% 환불</Text>
                  <Text className="text-sm text-neutral-700">• 참가 예정일 2일 전 50% 환불</Text>
                  <Text className="text-sm text-neutral-700">• 참가 당일 취소 환불 없음</Text>
                  <Text className="text-sm text-neutral-700">• 계좌 이체시 수수료 차감</Text>
                  <Text className="text-sm text-neutral-700">• 여행주간 이벤트 행사시 참가비 환불없음</Text>
                </View>
              </View>

              {/* 청규 섹션 */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="document-text" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">청규</Text>
                </View>
                
                <View className="space-y-2">
                  <Text className="text-sm text-neutral-700">• 사찰 내에선 음주, 흡연은 삼가해 주세요.</Text>
                  <Text className="text-sm text-neutral-700">• 고성방가를 삼가해 주세요.</Text>
                </View>
              </View>


            </View>
          )}

          {/* 캘린더와 인원선택을 가로로 배치 */}
          <View className="flex-row justify-start items-start">
            {/* 왼쪽: 캘린더 */}
            <View className="w-54">
              <SimpleCalendar
                selectedDate={selectedDate}
                currentMonth={currentMonth}
                selectedProgram={selectedProgram}
                onDateSelect={handleDateSelect}
                onMonthChange={handleMonthChange}
              />
            </View>
            
            {/* 오른쪽: 인원수 선택 */}
            <View className="w-48 bg-stone-50 pt-3 pb-3 pl-3 pr-3 border border-stone-200 ml-0.5">
              <Text className="text-sm font-semibold text-neutral-900 mb-2">인원 선택</Text>
              

              
              {/* 성인 */}
              <View className="flex-row justify-start items-center mb-1">
                <View className="flex-1">
                  <Text className="text-sm text-neutral-700">성인</Text>
                  {selectedProgram && (
                    <Text className="text-xs text-neutral-500">
                      ₩{selectedProgram.title.includes('석굴암') ? '150,000' : 
                         selectedProgram.title.includes('국악문화공연') ? '130,000' : '120,000'}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={() => {
                      setAdultCount(Math.max(0, adultCount - 1));
                      // 인원 관련 경고문 초기화
                      if (errorMessage === '인원을 선택해주세요.') {
                        setErrorMessage('');
                      }
                    }}
                    className="w-8 h-8 items-center justify-center border border-stone-300 rounded-l-lg bg-white"
                  >
                    <Text className="text-lg font-bold text-neutral-600">-</Text>
                  </TouchableOpacity>
                  <View className="w-10 h-8 items-center justify-center border-t border-b border-stone-300 bg-white">
                    <Text className="text-sm font-semibold text-neutral-900">{adultCount}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      setAdultCount(adultCount + 1);
                      // 인원 관련 경고문 초기화
                      if (errorMessage === '인원을 선택해주세요.') {
                        setErrorMessage('');
                      }
                    }}
                    className="w-8 h-8 items-center justify-center border border-stone-300 rounded-r-lg bg-white"
                  >
                    <Text className="text-lg font-bold text-neutral-600">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* 중고생 */}
              <View className="flex-row justify-start items-center mb-1">
                <View className="flex-1">
                  <Text className="text-sm text-neutral-700">중고생</Text>
                  {selectedProgram && (
                    <Text className="text-xs text-neutral-500">
                      ₩{selectedProgram.title.includes('석굴암') ? '140,000' : 
                         selectedProgram.title.includes('국악문화공연') ? '120,000' : '110,000'}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={() => {
                      setStudentCount(Math.max(0, studentCount - 1));
                      // 인원 관련 경고문 초기화
                      if (errorMessage === '인원을 선택해주세요.') {
                        setErrorMessage('');
                      }
                    }}
                    className="w-8 h-8 items-center justify-center border border-stone-300 rounded-l-lg bg-white"
                  >
                    <Text className="text-lg font-bold text-neutral-600">-</Text>
                  </TouchableOpacity>
                  <View className="w-10 h-8 items-center justify-center border-t border-b border-stone-300 bg-white">
                    <Text className="text-sm font-semibold text-neutral-900">{studentCount}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      setStudentCount(studentCount + 1);
                      // 인원 관련 경고문 초기화
                      if (errorMessage === '인원을 선택해주세요.') {
                        setErrorMessage('');
                      }
                    }}
                    className="w-8 h-8 items-center justify-center border border-stone-300 rounded-r-lg bg-white"
                  >
                    <Text className="text-lg font-bold text-neutral-600">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* 초등생 */}
              <View className="flex-row justify-start items-center mb-1">
                <View className="flex-1">
                  <Text className="text-sm text-neutral-700">초등생</Text>
                  {selectedProgram && (
                    <Text className="text-xs text-neutral-500">
                      ₩{selectedProgram.title.includes('석굴암') ? '130,000' : 
                         selectedProgram.title.includes('국악문화공연') ? '110,000' : '100,000'}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={() => {
                      setElementaryCount(Math.max(0, elementaryCount - 1));
                      // 인원 관련 경고문 초기화
                      if (errorMessage === '인원을 선택해주세요.') {
                        setErrorMessage('');
                      }
                    }}
                    className="w-8 h-8 items-center justify-center border border-stone-300 rounded-l-lg bg-white"
                  >
                    <Text className="text-lg font-bold text-neutral-600">-</Text>
                  </TouchableOpacity>
                  <View className="w-10 h-8 items-center justify-center border-t border-b border-stone-300 bg-white">
                    <Text className="text-sm font-semibold text-neutral-900">{elementaryCount}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      setElementaryCount(elementaryCount + 1);
                      // 인원 관련 경고문 초기화
                      if (errorMessage === '인원을 선택해주세요.') {
                        setErrorMessage('');
                      }
                    }}
                    className="w-8 h-8 items-center justify-center border border-stone-300 rounded-r-lg bg-white"
                  >
                    <Text className="text-sm font-bold text-neutral-600">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* 미취학 */}
              <View className="flex-row justify-start items-center mb-1">
                <View className="flex-1">
                  <Text className="text-sm text-neutral-700">미취학</Text>
                  {selectedProgram && (
                    <Text className="text-xs text-neutral-500">
                      ₩{selectedProgram.title.includes('석굴암') ? '120,000' : 
                         selectedProgram.title.includes('국악문화공연') ? '100,000' : '90,000'}
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={() => {
                      setPreschoolCount(Math.max(0, preschoolCount - 1));
                      // 인원 관련 경고문 초기화
                      if (errorMessage === '인원을 선택해주세요.') {
                        setErrorMessage('');
                      }
                    }}
                    className="w-8 h-8 items-center justify-center border border-stone-300 rounded-l-lg bg-white"
                  >
                    <Text className="text-lg font-bold text-neutral-600">-</Text>
                  </TouchableOpacity>
                  <View className="w-10 h-8 items-center justify-center border-t border-b border-stone-300 bg-white">
                    <Text className="text-sm font-semibold text-neutral-900">{preschoolCount}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      setPreschoolCount(preschoolCount + 1);
                      // 인원 관련 경고문 초기화
                      if (errorMessage === '인원을 선택해주세요.') {
                        setErrorMessage('');
                      }
                    }}
                    className="w-8 h-8 items-center justify-center border border-stone-300 rounded-r-lg bg-white"
                  >
                    <Text className="text-sm font-bold text-neutral-600">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* 구분선 */}
              <View className="h-px bg-stone-300 my-3" />
              
              {/* 총 금액 */}
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-sm font-semibold text-neutral-900">총 금액</Text>
                <Text className="text-xl font-bold text-orange-500">
                  {totalAmount.toLocaleString()}
                  <Text className="text-sm font-normal text-neutral-900">원</Text>
                </Text>
              </View>
              
              {/* 경고문 표시 */}
              {errorMessage ? (
                <View className="mb-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Text className="text-red-600 text-sm text-center font-medium">{errorMessage}</Text>
                </View>
              ) : null}
              
              {/* 예약하기 버튼 */}
              <TouchableOpacity 
                onPress={handleReservation}
                className="w-full bg-sage-600 py-3 items-center"
              >
                <Text className="text-white font-semibold text-base">예약하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>


        {/* 하단: 근처 관광지 추천 */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-neutral-900 mb-3">근처 관광지 추천</Text>
          {attractionsLoading ? (
            <View className="py-6 items-center"><ActivityIndicator color={COLORS.brand.sage} /></View>
          ) : (
            <FlatList<any>
              horizontal
              data={attractions.length > 0 ? attractions : fallbackAttractions}
              keyExtractor={(item: any, idx) => (item.contentid ? item.contentid : `fallback-${idx}`)}
              renderItem={({ item }: any) => (
                <View className="bg-white rounded-2xl p-4 mr-3 w-72 border border-stone-200">
                  {'contentid' in item && item.firstimage ? (
                    <View className="w-full h-28 rounded-xl mb-3 bg-stone-100 overflow-hidden">
                      <Image source={{ uri: item.firstimage }} className="w-full h-full" resizeMode="cover" />
                    </View>
                  ) : null}
                  <Text className="text-lg font-bold text-sage-600 mb-1" numberOfLines={1}>
                    {'contentid' in item ? item.title : item.name}
                  </Text>
                  <Text className="text-sm text-neutral-600 mb-2" numberOfLines={2}>
                    {'contentid' in item ? (item.addr1 || '') : item.description}
                  </Text>
                  <Text className="text-sm font-semibold text-neutral-700">
                    {'contentid' in item && temple.latitude && temple.longitude
                      ? `🚗 ${formatApiDistance(calculateDistanceFromApi(temple.latitude, temple.longitude, item.mapy, item.mapx))}`
                      : (item.distance || '')}
                  </Text>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            />
          )}
        </View>
      </View>

      {/* 예약 확인 모달 */}
      {showReservationModal && (
        <View className="absolute top-30 bottom-40 left-4 right-4 justify-center items-center z-50">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            {/* 모달 헤더 */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-neutral-900">예약 확인</Text>
              <TouchableOpacity onPress={() => setShowReservationModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* 예약 정보 */}
            <View className="space-y-3 mb-6">
              <View className="flex-row justify-between">
                <Text className="text-sm text-neutral-600">사찰</Text>
                <Text className="text-sm font-semibold text-neutral-900">{temple.name}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-neutral-600">주소</Text>
                <Text className="text-sm font-semibold text-neutral-900 flex-1 text-right ml-2">{temple.address}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-neutral-600">프로그램</Text>
                <Text className="text-sm font-semibold text-neutral-900 flex-1 text-right ml-2">{selectedProgram.title}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-neutral-600">예약날짜</Text>
                <Text className="text-sm font-semibold text-neutral-900">
                  {selectedDate[0].getFullYear()}.{selectedDate[0].getMonth() + 1}.{selectedDate[0].getDate()} ~ {selectedDate[1].getFullYear()}.{selectedDate[1].getMonth() + 1}.{selectedDate[1].getDate()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-neutral-600">인원</Text>
                <Text className="text-sm font-semibold text-neutral-900">
                  {adultCount > 0 && `성인 ${adultCount}명 `}
                  {studentCount > 0 && `중고생 ${studentCount}명 `}
                  {elementaryCount > 0 && `초등생 ${elementaryCount}명 `}
                  {preschoolCount > 0 && `미취학 ${preschoolCount}명`}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm text-neutral-600">금액</Text>
                <Text className="text-lg font-bold text-orange-600">₩{totalAmount.toLocaleString()}</Text>
              </View>
            </View>

            {/* 동의 확인 */}
            <View className="mb-6">
              <Text className="text-sm text-neutral-700 text-center">위 내용으로 예약하시겠습니까?</Text>
            </View>

            {/* 결제 방법 선택 */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-neutral-900 mb-3">결제 방법 선택</Text>
              <View>
                <TouchableOpacity 
                  onPress={() => handlePaymentMethodSelect('bank')}
                  className={`p-4 border rounded-lg mb-1 ${
                    selectedPaymentMethod === 'bank' 
                      ? 'border-sage-600 bg-sage-50' 
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedPaymentMethod === 'bank' 
                        ? 'border-sage-600 bg-sage-600' 
                        : 'border-stone-300'
                    }`}>
                      {selectedPaymentMethod === 'bank' && (
                        <View className="w-2 h-2 rounded-full bg-white m-0.5" />
                      )}
                    </View>
                    <Text className={`font-medium ${
                      selectedPaymentMethod === 'bank' ? 'text-sage-600' : 'text-neutral-700'
                    }`}>계좌이체</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => handlePaymentMethodSelect('onsite')}
                  className={`p-4 border rounded-lg ${
                    selectedPaymentMethod === 'onsite' 
                      ? 'border-sage-600 bg-sage-50' 
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedPaymentMethod === 'onsite' 
                        ? 'border-sage-600 bg-sage-600' 
                        : 'border-stone-300'
                    }`}>
                      {selectedPaymentMethod === 'onsite' && (
                        <View className="w-2 h-2 rounded-full bg-white m-0.5" />
                      )}
                    </View>
                    <Text className={`font-medium ${
                      selectedPaymentMethod === 'onsite' ? 'text-sage-600' : 'text-neutral-700'
                    }`}>현장결제</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 예약 완료 버튼 */}
            <TouchableOpacity 
              onPress={handleFinalReservation}
              disabled={!selectedPaymentMethod}
              className={`w-full py-3 rounded-lg ${
                selectedPaymentMethod 
                  ? 'bg-sage-600' 
                  : 'bg-stone-300'
              }`}
            >
              <Text className={`text-center font-semibold ${
                selectedPaymentMethod ? 'text-white' : 'text-stone-500'
              }`}>
                예약 완료
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 예약 완료 모달 */}
      {showCompletionModal && (
        <View className="absolute top-30 bottom-60 left-4 right-4 justify-center items-center z-50">
          <View className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark" size={32} color="#059669" />
              </View>
              <Text className="text-xl font-bold text-neutral-900 text-center">예약 완료!</Text>
              <Text className="text-sm text-neutral-600 text-center mt-2">
                예약이 성공적으로 완료되었습니다.
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => {
                setShowCompletionModal(false);
                navigation.getParent()?.navigate('Main', { screen: 'Home' });
              }}
              className="w-full bg-sage-600 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ReservationDetailScreen;
