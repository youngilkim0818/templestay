import React, { useMemo, useCallback, memo, useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Dimensions, Alert, Modal } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TempleStackParamList } from '../../../navigation/TempleStackNavigator';
import { TEMPLES_DATA, getTempleByIdWithImages } from '../../../data/temple-data';
import { TempleService } from '../../../services/templeService';
import { Temple } from '../../../types';
import { TourApiService, TourAttraction, formatApiDistance, calculateDistanceFromApi } from '../../../services/tourApiService';
import { COLORS } from '../../../constants/colors';

import { enrichTempleWithImages } from '../../../services/templeImageService';

const { width } = Dimensions.get('window');

// Google Translate 무료 API 사용
const translateText = async (text: string): Promise<string> => {
  if (!text || text.trim() === '') return text;
  
  // 이미 영어인지 간단히 체크 (한글이 포함되어 있는지 확인)
  const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
  if (!hasKorean) return text;
  
  try {
    // Google Translate 무료 API - API 키 불필요
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const result = await response.json();
    
    if (result && result[0] && result[0][0] && result[0][0][0]) {
      return result[0][0][0];
    }
    
    return text; // 번역 실패시 원본 반환
  } catch (error) {
    console.log('Translation failed, using original text:', error);
    return text; // 에러시 원본 반환
  }
};

// 번역 함수 제거 - 모든 텍스트는 영어로 표시

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



const AttractionCard = memo<{
  attraction: TourAttraction | { name: string; distance: string; description: string; };
  templeLocation?: { latitude: number; longitude: number };
}>(({ attraction, templeLocation }) => {
  const isTourAttraction = 'contentid' in attraction;
  const [translatedName, setTranslatedName] = useState<string>('');
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  
  useEffect(() => {
    const translateContent = async () => {
      const originalName = isTourAttraction ? attraction.title : attraction.name;
      const originalDesc = isTourAttraction 
        ? `${attraction.addr1} ${attraction.addr2 || ''}`.trim()
        : (attraction as any).description;
      
      const [name, desc] = await Promise.all([
        translateText(originalName),
        translateText(originalDesc)
      ]);
      
      setTranslatedName(name);
      setTranslatedDescription(desc);
    };
    
    translateContent();
  }, [attraction]);
  
  const displayName = translatedName || (isTourAttraction ? attraction.title : attraction.name);
  const displayDistance = isTourAttraction && templeLocation 
    ? formatApiDistance(calculateDistanceFromApi(templeLocation.latitude, templeLocation.longitude, attraction.mapy, attraction.mapx))
    : (attraction as any).distance;
  const displayDescription = translatedDescription || (isTourAttraction 
    ? `${attraction.addr1} ${attraction.addr2 || ''}`.trim()
    : (attraction as any).description);

  return (
    <View className="bg-white rounded-2xl p-4 mr-3 w-72 border border-stone-200">
      {/* 사진이 있으면 실제 사진 표시, 없으면 사진칸 제거 */}
      {isTourAttraction && attraction.firstimage && (
        <View className="w-full h-28 rounded-xl mb-3 bg-stone-100 overflow-hidden">
          <Image source={{ uri: attraction.firstimage }} className="w-full h-full" resizeMode="cover" />
        </View>
      )}
      
      <Text className="text-lg font-bold text-sage-600 mb-1" numberOfLines={1}>
        {displayName}
      </Text>
      <Text className="text-sm text-neutral-600 mb-2" numberOfLines={2}>
        {displayDescription || 'No address information'}
      </Text>
      <Text className="text-sm font-semibold text-neutral-700">
        {displayDistance || 'No distance information'}
      </Text>
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
    <View className="bg-white p-2 border border-stone-200">
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
  const templeData = params?.templeData || params?.params?.templeData;
  
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [attractions, setAttractions] = useState<TourAttraction[]>([]);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [adultCount, setAdultCount] = useState(0);
  const [teenagerCount, setTeenagerCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [preschoolCount, setPreschoolCount] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showReservationModal, setShowReservationModal] = useState(false);

  // 네비게이션 헤더 수정
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
      ),
      headerTitle: '',
      headerStyle: {
        backgroundColor: '#F5F5F4', // stone-100
      },
    });
  }, [navigation]);

  useEffect(() => {
    const loadTempleWithImages = async () => {
      if (!templeId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('🏛️ 사찰 상세 데이터 로딩:', templeId);
        
        let templeToUse: Temple;
        
        // templeData가 있으면 우선 사용, 없으면 TEMPLES_DATA에서 찾기
        if (templeData) {
          templeToUse = templeData;
          console.log('✅ 전달받은 사찰 데이터 사용:', templeData.name);
          console.log('🔍 templeData.programDetails:', templeData.programDetails);
        } else {
          const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
          if (!basicTemple) {
            console.log('❌ 사찰 데이터를 찾을 수 없음');
            setTemple(null);
            setLoading(false);
            return;
          }
          templeToUse = basicTemple;
          console.log('✅ TEMPLES_DATA에서 사찰 데이터 로드 완료:', basicTemple.name);
        }
        
        // TEMPLES_DATA에서 programDetails 보충 (가격 정보 유지를 위해)
        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
        if (basicTemple && basicTemple.programDetails) {
          templeToUse = { ...templeToUse, programDetails: basicTemple.programDetails };
          console.log('✅ TEMPLES_DATA에서 programDetails 보충 완료');
          console.log('🔍 보충된 programDetails 키들:', Object.keys(basicTemple.programDetails));
        }
        
        // TempleImageService를 사용하여 이미지와 설명 보강
        try {
          const enrichedTemple = await enrichTempleWithImages(templeToUse);
          console.log('✅ TempleImageService를 통한 데이터 보강 완료');
          console.log('🔍 보강된 사찰 데이터 templestay:', enrichedTemple.templestay);
          console.log('🔍 보강된 사찰 데이터 programDetails:', enrichedTemple.programDetails);
          
          // 기본 사찰 정보 설정 (보강된 데이터)
          setTemple(enrichedTemple);
          
          // Supabase에서 프로그램 최신화 비활성화 (영어 데이터 사용을 위해)
          // try {
          //   const programs = await TempleService.getTemplePrograms(String(templeToUse.id));
          //   if (programs && programs.length > 0) {
          //     setTemple({ ...enrichedTemple, programs });
          //     console.log(`✅ 프로그램 ${programs.length}개 로드`);
          //   } else {
          //     console.log('⚠️ Supabase에서 프로그램 정보를 찾을 수 없음, 기본 데이터 사용');
          //   }
          // } catch (error) {
          //   console.log('⚠️ Supabase 프로그램 로딩 실패, 기본 데이터 사용:', error);
          // }
          console.log('✅ 로컬 영어 데이터 사용 (Supabase 비활성화)');
        } catch (error) {
          console.log('⚠️ TempleImageService 보강 실패, 기본 데이터 사용:', error);
          setTemple(templeToUse);
        }
        
      } catch (error) {
        console.error('❌ 사찰 데이터 로드 실패:', error);
        // 에러 발생 시에도 기본 데이터 사용 시도
        if (templeData) {
          setTemple(templeData);
          console.log('✅ 에러 후 전달받은 데이터 사용:', templeData.name);
        } else {
          const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
          if (basicTemple) {
            setTemple(basicTemple);
            console.log('✅ 에러 후 TEMPLES_DATA 사용:', basicTemple.name);
          } else {
            setTemple(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadTempleWithImages();
  }, [templeId, templeData]);

  // Load attractions based on area code when temple data is available
  useEffect(() => {
    const loadAttractionsByArea = async () => {
      if (temple && typeof temple.areaCd === 'number') {
        setAttractionsLoading(true);
        try {
          console.log(`🏞️ 지역코드 기반 주변 관광지 검색 시작: areaCd=${temple.areaCd}, sigunguCd=${temple.sigunguCd}`);

          // 1. 시군구 단위로 정확하게 검색
          let nearbyAttractions: TourAttraction[] = await TourApiService.getHubAttractionsByAreaWithFallback(
            temple.areaCd,
            temple.sigunguCd,
            6,
            20
          );

          // 2. 결과가 없으면 광역 단위로 재검색
          if (nearbyAttractions.length === 0) {
            console.log(`⚠️ 주변 관광지 정보 없음. 광역 단위로 재검색 (areaCd: ${temple.areaCd})`);
            nearbyAttractions = await TourApiService.getAttractionsByArea(temple.areaCd);
          }

          // 3. 그래도 결과가 없으면 지역명으로 키워드 검색
          if (nearbyAttractions.length === 0) {
            console.log(`⚠️ 광역 검색 실패. 지역명 키워드 검색 시도 (region: ${temple.region})`);
            nearbyAttractions = await TourApiService.searchAttractions(temple.region);
          }
          
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
    navigation.navigate('ReservationConfirm', {
      temple,
      selectedProgram,
      selectedDate: [],
      participants: {
        adults: 0,
        teenagers: 0,
        children: 0,
        preschool: 0,
      },
      totalAmount: 0
    });
  }, [navigation, temple, selectedProgram]);
  
  const handleFavoritePress = useCallback(() => {
    // Favorite logic
  }, []);
  
  const handleDateSelect = useCallback((date: Date) => {
    if (!selectedProgram) {
      setErrorMessage('Please select a program first.');
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
            if (errorMessage === 'Please select a date.') {
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
      console.log('📋 선택된 프로그램:', program);
      console.log('📋 선택된 프로그램 제목:', program.title);
      console.log('📋 선택된 프로그램 설명:', program.description);
      
      // programDetails에서 해당 프로그램의 가격 정보 찾기
      console.log('🔍 programDetails 찾기:', program.title);
      console.log('🔍 현재 temple 객체:', temple);
      console.log('🔍 temple.programDetails:', temple?.programDetails);
      
      const programDetail = temple?.programDetails?.[program.title];
      console.log('🔍 programDetails 결과:', programDetail);
      
      if (!programDetail) {
        console.log('❌ programDetails에서 가격 정보를 찾을 수 없음');
        console.log('🔍 사용 가능한 programDetails 키들:', Object.keys(temple?.programDetails || {}));
        
        // TEMPLES_DATA에서 직접 찾기
        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
        if (basicTemple?.programDetails?.[program.title]) {
          console.log('✅ TEMPLES_DATA에서 programDetails 찾음:', basicTemple.programDetails[program.title]);
        }
      }
    }
    
    // 프로그램 관련 경고문 초기화
            if (errorMessage === 'Please select a program.') {
      setErrorMessage('');
    }
  }, [selectedProgram, errorMessage]);

  // 총 금액 계산 (TEMPLES_DATA에서 직접 가져오기)
  const totalAmount = useMemo(() => {
    if (!selectedProgram) {
      // 프로그램이 선택되지 않은 경우 0 반환
      return 0;
    }
    
    // TEMPLES_DATA에서 직접 해당 프로그램의 정확한 가격 사용
    const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
    const programPricing = basicTemple?.programDetails?.[selectedProgram.title]?.pricing;
    
    if (programPricing) {
      return (adultCount * (programPricing.adult || 0)) + 
              (teenagerCount * (programPricing.teenager || 0)) + 
              (childCount * (programPricing.child || 0)) + 
              (preschoolCount * (programPricing.preschool || 0));
    }
    
    // programDetails가 없는 경우 fallback으로 차등 가격 사용
    const basePrice = selectedProgram.price || 0;
    return (adultCount * basePrice) + 
            (teenagerCount * Math.floor(basePrice * 0.9)) + 
            (childCount * Math.floor(basePrice * 0.8)) + 
            (preschoolCount * Math.floor(basePrice * 0.7));
  }, [selectedProgram, adultCount, teenagerCount, childCount, preschoolCount, templeId]);

  // 예약 처리 함수
  const handleReservation = useCallback(() => {
    if (!selectedProgram) {
      setErrorMessage('Please select a program.');
      return;
    }
    
    // 에러 메시지 초기화
    setErrorMessage('');
    
    // 예약 확정 페이지로 이동
    if (temple) {
      navigation.navigate('ReservationConfirm', {
        temple,
        selectedProgram,
        selectedDate: [], // 빈 배열로 초기화
        participants: {
          adults: 0, // 0으로 초기화
          teenagers: 0,
          children: 0,
          preschool: 0,
        },
        totalAmount: 0
      });
    }
  }, [selectedProgram, navigation, temple]);


  
  const fallbackAttractions = useMemo(() => [
    { name: 'Seoraksan National Park', distance: '🚗 1.5km • 20 min walk', description: 'A beautiful natural landscape and a place to experience the tranquility of the temple.' },
    { name: 'Bulguksa Grotto', distance: '🚗 2.3km • 30 min walk', description: 'A historically significant site designated as a UNESCO World Heritage site.' }
  ], []);

  if (loading || !temple) {
    return (
      <View className="flex-1 justify-center items-center bg-stone-100">
        <ActivityIndicator size="large" color={COLORS.brand.sage} />
        <Text className="mt-3 text-neutral-600">Loading details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-stone-100">
      {/* 전체 사진칸 */}
      <View className="relative h-80 bg-stone-200">
        {(() => {
          console.log('🔍 사찰 이미지 디버깅:', {
            templeName: temple.name,
            imageUrl: temple.imageUrl,
            imageUrlType: typeof temple.imageUrl,
            hasImageUrl: !!temple.imageUrl
          });
          
          return temple.imageUrl ? (
            <Image 
              source={temple.imageUrl} 
              className="w-full h-full" 
              resizeMode="cover"
              onError={(error) => {
                console.log('❌ Image loading error:', error);
                console.log('🔍 temple.imageUrl:', temple.imageUrl);
                console.log('🔍 temple.name:', temple.name);
              }}
              onLoad={() => console.log('✅ Image loaded successfully:', temple.imageUrl)}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-4xl">🏯</Text>
              <Text className="text-sm text-neutral-500 mt-2">Could not load image</Text>
              <Text className="text-xs text-neutral-400 mt-1">imageUrl: {JSON.stringify(temple.imageUrl)}</Text>
              <Text className="text-xs text-neutral-400 mt-1">temple.name: {temple.name}</Text>
            </View>
          );
        })()}
      </View>

      {/* 본문 */}
      <View className="bg-white -mt-5 rounded-t-1xl px-5 pt-6 pb-10">
        {/* 상단: 제목/주소 + 캘린더 + 인원선택 */}
        <View className="mb-6">
          {/* 제목과 주소 */}
          <View className="mb-4">
        <Text className="text-2xl font-bold text-neutral-900 mb-2">{temple.name.replace(/Temple/g, '').trim()}</Text>
            <Text className="text-neutral-700 mb-2">{temple.address}</Text>

          </View>

        {/* 템플스테이 프로그램 */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-3">Templestay Programs</Text>
          {(() => {
            const programs: any[] = (temple as any).programs && (temple as any).programs.length > 0
              ? (temple as any).programs
              : ((temple as any).templestay || []);
            if (!programs || programs.length === 0) {
              return (
                <Text className="text-neutral-600">No programs registered.</Text>
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
                  <Text className="text-base font-bold text-neutral-900">₩{(() => {
                    // TEMPLES_DATA에서 직접 해당 프로그램의 성인 가격을 가져오기
                    const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                    const programDetail = basicTemple?.programDetails?.[program.title];
                    if (programDetail?.pricing?.adult) {
                      return programDetail.pricing.adult.toLocaleString();
                    }
                    // programDetails에 없으면 기본 가격 사용
                    return program.price?.toLocaleString() || '0';
                  })()}</Text>
                  {selectedProgram && selectedProgram.title === program.title && (
                    <View className="mt-2 flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#059669" />
                      <Text className="text-sm text-sage-600 ml-1">Selected</Text>
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
                  <Text className="text-lg font-bold text-neutral-900">Participation Fee</Text>
                </View>
                
                {/* 가격표 */}
                <View className="bg-stone-100 border border-stone-200 rounded p-3 mb-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-neutral-700">Adult</Text>
                    <Text className="text-sm font-semibold text-neutral-700">Teenager</Text>
                    <Text className="text-sm font-semibold text-neutral-700">Child</Text>
                    <Text className="text-sm font-semibold text-neutral-700">Preschool</Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-base font-bold text-neutral-900">
                      {(() => {
                        // TEMPLES_DATA에서 직접 가져오기
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                        
                        console.log('🔍 Adult 가격 계산:', {
                          templeId,
                          selectedProgramTitle: selectedProgram.title,
                          basicTemple: basicTemple?.name,
                          programDetail,
                          adultPrice: programDetail?.pricing?.adult,
                          fallbackPrice: selectedProgram.price
                        });
                        
                        if (programDetail?.pricing?.adult) {
                          return programDetail.pricing.adult.toLocaleString();
                        }
                        // fallback: 기본 가격 사용
                        return selectedProgram.price?.toLocaleString() || '가격 정보 없음';
                      })()}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {(() => {
                        // TEMPLES_DATA에서 직접 가져오기
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                        
                        console.log('🔍 Teenager 가격 계산:', {
                          templeId,
                          selectedProgramTitle: selectedProgram.title,
                          teenagerPrice: programDetail?.pricing?.teenager,
                          fallbackPrice: selectedProgram.price ? Math.floor(selectedProgram.price * 0.9) : 'N/A'
                        });
                        
                        if (programDetail?.pricing?.teenager) {
                          return programDetail.pricing.teenager.toLocaleString();
                        }
                        // fallback: 기본 가격의 90%
                        const basePrice = selectedProgram.price;
                        return basePrice ? Math.floor(basePrice * 0.9).toLocaleString() : '가격 정보 없음';
                      })()}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {(() => {
                        // TEMPLES_DATA에서 직접 가져오기
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                        
                        console.log('🔍 Child 가격 계산:', {
                          templeId,
                          selectedProgramTitle: selectedProgram.title,
                          childPrice: programDetail?.pricing?.child,
                          fallbackPrice: selectedProgram.price ? Math.floor(selectedProgram.price * 0.8) : 'N/A'
                        });
                        
                        if (programDetail?.pricing?.child) {
                          return programDetail.pricing.child.toLocaleString();
                        }
                        // fallback: 기본 가격의 80%
                        const basePrice = selectedProgram.price;
                        return basePrice ? Math.floor(basePrice * 0.8).toLocaleString() : '가격 정보 없음';
                      })()}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {(() => {
                        // TEMPLES_DATA에서 직접 가져오기
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                        
                        console.log('🔍 Preschool 가격 계산:', {
                          templeId,
                          selectedProgramTitle: selectedProgram.title,
                          preschoolPrice: programDetail?.pricing?.preschool,
                          fallbackPrice: selectedProgram.price ? Math.floor(selectedProgram.price * 0.7) : 'N/A'
                        });
                        
                        if (programDetail?.pricing?.preschool) {
                          return programDetail.pricing.preschool.toLocaleString();
                        }
                        // fallback: 기본 가격의 70%
                        const basePrice = selectedProgram.price;
                        return basePrice ? Math.floor(basePrice * 0.7).toLocaleString() : '가격 정보 없음';
                      })()}
                    </Text>
                  </View>
                </View>
                
                {/* 예약 안내 */}
                <Text className="text-sm text-red-500">
                  ※ {(() => {
                    const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                    return basicTemple?.programDetails?.[selectedProgram.title]?.reservationNotice || 'Reservations available until 3 days before program start date';
                  })()}
                </Text>
              </View>

              {/* 프로그램 소개 섹션 */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="calendar" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">Program Introduction</Text>
                </View>
                
                <View className="space-y-3">
                    <Text className="text-sm text-neutral-700 leading-5">
                      {(() => {
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        return basicTemple?.programDetails?.[selectedProgram.title]?.description || selectedProgram.description || 'Loading program details...';
                      })()}
                    </Text>
                    
                    {/* 추가 정보 */}
                    <View className="space-y-2">
                      {(() => {
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const additionalInfo = basicTemple?.programDetails?.[selectedProgram.title]?.additionalInfo;
                        return additionalInfo ? additionalInfo.map((info: string, index: number) => (
                          <Text key={index} className="text-sm text-neutral-700">
                            • {info}
                          </Text>
                        )) : (
                        <>
                          <Text className="text-sm text-neutral-700">
                            • Reservations may be cancelled if payment is not made within 7 days.
                          </Text>
                          <Text className="text-sm text-neutral-700">
                            • Group programs require prior consultation and may be subject to change based on temple circumstances.
                          </Text>
                        </>
                        );
                      })()}
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
                  <Text className="text-lg font-bold text-neutral-900">Required Items</Text>
                </View>
                
                <Text className="text-sm text-neutral-700 leading-5">
                  {temple.commonDetails?.preparationItems || 'Personal toiletries, towel, spare clothes (outerwear), sneakers (comfortable shoes), socks, personal (insulated) water bottle. For winter participation: winter gear and ice cleats.'}
                </Text>
              </View>

              {/* 환불규정 섹션 */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="megaphone" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">Refund Policy</Text>
                </View>
                
                <View className="space-y-2">
                  {temple.commonDetails?.refundPolicy ? (
                    temple.commonDetails.refundPolicy.map((policy, index) => (
                      <Text key={index} className="text-sm text-neutral-700">• {policy}</Text>
                    ))
                  ) : (
                    <>
                      <Text className="text-sm text-neutral-700">• 100% refund 3 days before scheduled participation</Text>
                      <Text className="text-sm text-neutral-700">• 50% refund 2 days before scheduled participation</Text>
                      <Text className="text-sm text-neutral-700">• No refund for same-day cancellation</Text>
                      <Text className="text-sm text-neutral-700">• Bank transfer fees deducted</Text>
                      <Text className="text-sm text-neutral-700">• No refund during travel week events</Text>
                    </>
                  )}
                </View>
              </View>

              {/* 청규 섹션 */}
                <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="document-text" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">Temple Rules</Text>
                </View>
                
                <View className="space-y-2">
                  {temple.commonDetails?.templeRules ? (
                    temple.commonDetails.templeRules.map((rule, index) => (
                      <Text key={index} className="text-sm text-neutral-700">• {rule}</Text>
                    ))
                  ) : (
                    <>
                      <Text className="text-sm text-neutral-700">• Please refrain from drinking and smoking within the temple grounds.</Text>
                      <Text className="text-sm text-neutral-700">• Please refrain from loud behavior and noise.</Text>
                    </>
                  )}
                </View>
              </View>

                {/* 예약하기 버튼 */}
                  <TouchableOpacity 
                  onPress={handleReservation}
                  className="w-full bg-sage-600 py-4 rounded-lg mb-6"
                >
                  <Text className="text-white font-semibold text-lg text-center">Make Reservation</Text>
                  </TouchableOpacity>


                </View>
          )}


        </View>


        {/* 하단: Nearby Attractions */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-neutral-900 mb-3">Nearby Attractions</Text>
          {attractionsLoading ? (
            <View className="py-6 items-center"><ActivityIndicator color={COLORS.brand.sage} /></View>
          ) : attractions.length > 0 ? (
            <FlatList<any>
              horizontal
              data={attractions}
              keyExtractor={(item: any) => item.contentid || `attr-${Math.random()}`}
              renderItem={({ item }: any) => (
                <AttractionCard 
                  attraction={item} 
                  templeLocation={temple ? { latitude: temple.latitude, longitude: temple.longitude } : undefined}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              // 성능 최적화
              removeClippedSubviews={true}
              maxToRenderPerBatch={3}
              updateCellsBatchingPeriod={100}
              initialNumToRender={3}
              windowSize={5}
            />
          ) : (
            <View className="bg-stone-50 border border-stone-200 rounded-lg p-6 items-center">
              <Text className="text-4xl mb-2">🏞️</Text>
              <Text className="text-sm font-medium text-neutral-700 mb-1">주변 관광지 정보를 불러올 수 없습니다</Text>
              <Text className="text-xs text-neutral-500 text-center">
                현재 이 지역의 관광지 정보가 제공되지 않습니다
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 예약 완료 모달 */}
      <Modal
        visible={showReservationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReservationModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-amber-50 rounded-2xl p-6 w-full max-w-sm border border-amber-200">
            {/* 모달 헤더 */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-green-200 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-circle" size={32} color="#059669" />
              </View>
              <Text className="text-xl font-bold text-amber-800">Reservation Complete!</Text>
              <Text className="text-sm text-amber-700 text-center mt-2">
                Your reservation has been successfully completed
              </Text>
            </View>

            {/* 버튼들 */}
            <View className="space-y-3">
              <TouchableOpacity 
                className="w-full bg-green-600 py-4 rounded-xl"
                onPress={() => setShowReservationModal(false)}
              >
                <Text className="text-white font-semibold text-center">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
             </Modal>
     </ScrollView>
   );
 };

export default ReservationDetailScreen;


