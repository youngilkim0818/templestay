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
import { enrichAttractionWithImage } from '../../../services/attractionImageService';
import useUserStore from '../../../store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isLargeScreen = height > 800;

// Responsive sizes
const headerFontSize = isSmallScreen ? 18 : (isLargeScreen ? 24 : 20);
const subHeaderFontSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const cardPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
const cardMargin = isSmallScreen ? 4 : (isLargeScreen ? 8 : 6);
const templeImageHeight = isSmallScreen ? 200 : (isLargeScreen ? 280 : 240);
const templeTitleSize = isSmallScreen ? 16 : (isLargeScreen ? 22 : 18);
const templeDescSize = isSmallScreen ? 11 : (isLargeScreen ? 15 : 13);
const templeDistanceSize = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
const sectionPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
const iconSize = isSmallScreen ? 16 : (isLargeScreen ? 22 : 20);
const buttonPadding = isSmallScreen ? 8 : (isLargeScreen ? 12 : 10);
const buttonFontSize = isSmallScreen ? 11 : (isLargeScreen ? 15 : 13);
const programTitleSize = isSmallScreen ? 14 : (isLargeScreen ? 18 : 16);
const programDescSize = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
const attractionImageHeight = isSmallScreen ? 100 : (isLargeScreen ? 140 : 120);
const attractionTitleSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const attractionDescSize = isSmallScreen ? 9 : (isLargeScreen ? 13 : 11);

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
    if (__DEV__) {
      console.log('Translation failed, using original text:', error);
    }
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

  // 이미지 소스 결정 (기존 firstimage 또는 새로 추가된 로컬 이미지)
  const enrichedAttraction = isTourAttraction ? enrichAttractionWithImage(attraction) : attraction;
  const imageSource = (enrichedAttraction as any).imageUrl || (enrichedAttraction as any).firstimage;

  return (
    <View 
      className="bg-white rounded-2xl border border-stone-200"
      style={{ padding: cardPadding, marginRight: cardMargin, width: width * 0.7 }}
    >
      {/* 사진이 있으면 실제 사진 표시 (API 이미지 또는 로컬 이미지) */}
      {isTourAttraction && imageSource && (
        <View 
          className="w-full rounded-xl mb-3 bg-stone-100 overflow-hidden"
          style={{ height: attractionImageHeight }}
        >
          <Image source={{ uri: imageSource }} className="w-full h-full" resizeMode="cover" />
        </View>
      )}
      
      <Text 
        className="font-bold text-sage-600 mb-1" 
        style={{ fontSize: attractionTitleSize }}
        numberOfLines={1}
      >
        {displayName}
      </Text>
      <Text 
        className="text-neutral-600 mb-2" 
        style={{ fontSize: attractionDescSize }}
        numberOfLines={2}
      >
        {displayDescription || 'No address information'}
      </Text>
      <Text 
        className="font-semibold text-neutral-700"
        style={{ fontSize: attractionDescSize }}
      >
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
        <Text 
          className="font-semibold text-neutral-900"
          style={{ fontSize: templeDistanceSize }}
        >
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
                    <Text 
                      className={`font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-neutral-600'}`}
                      style={{ fontSize: templeDistanceSize - 2 }}
                      numberOfLines={1}
                    >
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { isGuestMode, isLoggedIn } = useUserStore();
  
  // 사찰별 리뷰 데이터 함수 - 사찰 이름으로 매칭
  const getTempleReviews = (temple: Temple | null) => {
    if (!temple) {
      if (__DEV__) {
        console.log('🔍 getTempleReviews: temple이 null입니다');
      }
      return [];
    }
    
    if (__DEV__) {
      console.log('🔍 getTempleReviews 호출됨, 사찰 이름:', temple.name);
    }
    
    const reviewsData: { [key: string]: any[] } = {
      'Bulguksa Temple': [
        {
          id: 1,
          userName: "Alexander Chen",
          rating: 5,
          comment: "I had a truly peaceful time at Bulguksa. The monks' teachings were profound and the temple atmosphere was beautiful. The early morning prayer and tea ceremony were particularly impressive.",
          date: "2024-08-15"
        },
        {
          id: 2,
          userName: "Isabella Rodriguez",
          rating: 4,
          comment: "It was a great escape from my busy daily life and helped me organize my thoughts. The temple food was delicious and I enjoyed conversations with other participants. I definitely want to participate again.",
          date: "2024-08-10"
        },
        {
          id: 3,
          userName: "Sebastian Kim",
          rating: 5,
          comment: "This was my first time participating and it was much better than I expected. The monk's dharma talk really resonated with me, and there was plenty of meditation time for true healing. Highly recommended!",
          date: "2024-08-08"
        }
      ],
      'Haeinsa Temple': [
        {
          id: 1,
          userName: "Sophia Anderson",
          rating: 5,
          comment: "Haeinsa was absolutely breathtaking! The Tripitaka Koreana is a must-see. The temple stay experience was deeply spiritual and the mountain views were incredible.",
          date: "2024-08-12"
        },
        {
          id: 2,
          userName: "Benjamin Thompson",
          rating: 4,
          comment: "The meditation sessions were very calming. The temple's historical significance really adds to the experience. The vegetarian meals were surprisingly delicious!",
          date: "2024-08-09"
        }
      ],
      'Tongdosa Temple': [
        {
          id: 1,
          userName: "Lucas Rodriguez",
          rating: 5,
          comment: "Tongdosa's mountain setting is absolutely magical. The temple stay program was well-organized and the cultural activities were fascinating. Highly recommend for nature lovers!",
          date: "2024-08-14"
        },
        {
          id: 2,
          userName: "Mia Thompson",
          rating: 4,
          comment: "The temple architecture is stunning and the surrounding forest is so peaceful. The meditation practice was challenging but rewarding. Great experience overall!",
          date: "2024-08-11"
        }
      ],
      'Songgwangsa Temple': [
        {
          id: 1,
          userName: "Zoe Smith",
          rating: 5,
          comment: "Songgwangsa is a hidden gem! The temple is surrounded by beautiful mountains and the atmosphere is so serene. The meditation sessions were life-changing.",
          date: "2024-08-13"
        },
        {
          id: 2,
          userName: "Adrian Brown",
          rating: 4,
          comment: "The temple stay program was very authentic and the monks were very patient with beginners. The mountain hiking was a great addition to the spiritual experience.",
          date: "2024-08-10"
        },
        {
          id: 3,
          userName: "Nova Garcia",
          rating: 5,
          comment: "I felt completely refreshed after my stay at Songgwangsa. The temple's history is fascinating and the natural surroundings are perfect for contemplation.",
          date: "2024-08-06"
        }
      ],
      'Beopjusa Temple': [
        {
          id: 1,
          userName: "Felix Brown",
          rating: 5,
          comment: "Beopjusa's golden temple is absolutely stunning! The temple stay experience was very well organized and the cultural programs were educational and fun.",
          date: "2024-08-15"
        },
        {
          id: 2,
          userName: "Luna Martin",
          rating: 4,
          comment: "The temple grounds are beautiful and the mountain views are spectacular. The meditation practice was challenging but very rewarding. Great for spiritual growth!",
          date: "2024-08-12"
        }
      ],
      'Golgulsa Temple': [
        {
          id: 1,
          userName: "Kai Lee",
          rating: 5,
          comment: "Golgulsa's cave temple experience was absolutely unique! The stone carving meditation was challenging but incredibly rewarding. The mountain views are breathtaking.",
          date: "2024-08-14"
        },
        {
          id: 2,
          userName: "Sage Wilson",
          rating: 4,
          comment: "The temple stay at Golgulsa was very authentic. The cave meditation was unlike anything I've experienced before. Highly recommend for those seeking a unique spiritual journey.",
          date: "2024-08-11"
        },
        {
          id: 3,
          userName: "River Park",
          rating: 5,
          comment: "The cave temple experience was absolutely incredible! The stone carving meditation was challenging but very rewarding. The monks were very knowledgeable.",
          date: "2024-08-08"
        }
      ],
      'Jikjisa Temple': [
        {
          id: 1,
          userName: "Phoenix Green",
          rating: 5,
          comment: "Jikjisa's mountain temple setting is absolutely magical. The temple stay program was very authentic and the monks were incredibly welcoming.",
          date: "2024-08-15"
        },
        {
          id: 2,
          userName: "Jasper Johnson",
          rating: 4,
          comment: "The temple's location in the mountains provides perfect conditions for meditation. The vegetarian meals were delicious and the cultural programs were educational.",
          date: "2024-08-12"
        }
      ],
      'Daeseungsa Temple': [
        {
          id: 1,
          userName: "Iris Wang",
          rating: 5,
          comment: "Daeseungsa offers a truly peaceful temple stay experience. The mountain views are spectacular and the meditation sessions were very calming.",
          date: "2024-08-14"
        },
        {
          id: 2,
          userName: "Finn Miller",
          rating: 4,
          comment: "The temple grounds are beautiful and the monks were very patient with beginners. The temple food was surprisingly delicious and healthy.",
          date: "2024-08-11"
        }
      ],
      'Gamsansa Temple': [
        {
          id: 1,
          userName: "Rowan Davis",
          rating: 5,
          comment: "Gamsansa is a hidden treasure! The temple stay program was very authentic and the monks were incredibly kind and knowledgeable.",
          date: "2024-08-13"
        },
        {
          id: 2,
          userName: "Hazel Brown",
          rating: 4,
          comment: "The temple's peaceful atmosphere and beautiful surroundings made for a perfect meditation retreat. Highly recommend for those seeking inner peace.",
          date: "2024-08-10"
        },
        {
          id: 3,
          userName: "Cedar Wilson",
          rating: 5,
          comment: "An amazing experience! The temple's history and cultural significance really added to the spiritual journey.",
          date: "2024-08-07"
        }
      ],
      'Seonbonsa Temple': [
        {
          id: 1,
          userName: "Maple Garcia",
          rating: 5,
          comment: "Seonbonsa offers a unique temple stay experience. The temple's architecture is stunning and the meditation sessions were very rewarding.",
          date: "2024-08-15"
        },
        {
          id: 2,
          userName: "Oak Martinez",
          rating: 4,
          comment: "The temple stay program was well-organized and the monks were very welcoming. The mountain views at sunrise were absolutely breathtaking.",
          date: "2024-08-12"
        }
      ],
      'Simwonsa Temple': [
        {
          id: 1,
          userName: "Aspen Rodriguez",
          rating: 5,
          comment: "Simwonsa is a beautiful temple with a very peaceful atmosphere. The temple stay program was authentic and the monks were incredibly kind.",
          date: "2024-08-14"
        },
        {
          id: 2,
          userName: "Birch Thompson",
          rating: 4,
          comment: "The temple grounds are stunning and the meditation sessions were very calming. Perfect for those seeking spiritual renewal.",
          date: "2024-08-11"
        },
        {
          id: 3,
          userName: "Willow Taylor",
          rating: 5,
          comment: "An incredible experience! The temple's history and cultural significance really added to the spiritual journey.",
          date: "2024-08-08"
        }
      ]
    };
    
    if (__DEV__) {
      console.log('🔍 사용 가능한 사찰 이름들:', Object.keys(reviewsData));
      console.log('🔍 요청된 사찰 이름:', temple.name);
      console.log('🔍 매칭되는 리뷰:', reviewsData[temple.name]);
    }
    
    // 사찰 이름에 맞는 리뷰 반환, 없으면 기본 리뷰
    const templeReviews = reviewsData[temple.name] || reviewsData['Bulguksa Temple'];
    
    if (__DEV__) {
      console.log('🔍 최종 반환될 리뷰:', templeReviews);
    }
    
    // 고정된 리뷰 개수 반환 (무작위 선택 제거)
    return templeReviews;
  };

  // 현재 사찰의 리뷰 데이터
  const [reviews, setReviews] = useState<any[]>([]);

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
        if (__DEV__) {
          console.log('🏛️ 사찰 상세 데이터 로딩:', templeId);
        }
        
        let templeToUse: Temple;
        
        // templeData가 있으면 우선 사용, 없으면 TEMPLES_DATA에서 찾기
        if (templeData) {
          templeToUse = templeData;
          if (__DEV__) {
            console.log('✅ 전달받은 사찰 데이터 사용:', templeData.name);
          }
          if (__DEV__) {
            console.log('🔍 templeData.programDetails:', templeData.programDetails);
          }
        } else {
          const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
          if (!basicTemple) {
            console.log('❌ 사찰 데이터를 찾을 수 없음');
            setTemple(null);
            setLoading(false);
            return;
          }
          templeToUse = basicTemple;
          if (__DEV__) {
            console.log('✅ TEMPLES_DATA에서 사찰 데이터 로드 완료:', basicTemple.name);
          }
        }
        
        // TEMPLES_DATA에서 programDetails 보충 (가격 정보 유지를 위해)
        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
        if (basicTemple && basicTemple.programDetails) {
          templeToUse = { ...templeToUse, programDetails: basicTemple.programDetails };
          if (__DEV__) {
            console.log('✅ TEMPLES_DATA에서 programDetails 보충 완료');
          }
          if (__DEV__) {
            console.log('🔍 보충된 programDetails 키들:', Object.keys(basicTemple.programDetails));
          }
        }
        
        // TempleImageService를 사용하여 이미지와 설명 보강
        try {
          const enrichedTemple = await enrichTempleWithImages(templeToUse);
          if (__DEV__) {
            console.log('✅ TempleImageService를 통한 데이터 보강 완료');
          }
          if (__DEV__) {
            console.log('🔍 보강된 사찰 데이터 templestay:', enrichedTemple.templestay);
          }
          if (__DEV__) {
            console.log('🔍 보강된 사찰 데이터 programDetails:', enrichedTemple.programDetails);
          }
          
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
          if (__DEV__) {
            console.log('✅ 로컬 영어 데이터 사용 (Supabase 비활성화)');
          }
        } catch (error) {
          if (__DEV__) {
            console.log('⚠️ TempleImageService 보강 실패, 기본 데이터 사용:', error);
          }
          setTemple(templeToUse);
        }
        
      } catch (error) {
        console.error('❌ 사찰 데이터 로드 실패:', error);
        // 에러 발생 시에도 기본 데이터 사용 시도
        if (templeData) {
          setTemple(templeData);
          if (__DEV__) {
            console.log('✅ 에러 후 전달받은 데이터 사용:', templeData.name);
          }
        } else {
          const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
          if (basicTemple) {
            setTemple(basicTemple);
            if (__DEV__) {
              console.log('✅ 에러 후 TEMPLES_DATA 사용:', basicTemple.name);
            }
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

  // temple이 변경될 때마다 리뷰 업데이트
  useEffect(() => {
    if (temple) {
      if (__DEV__) {
        console.log('🔍 현재 사찰 이름:', temple.name);
        console.log('🔍 사찰 타입:', typeof temple);
      }
      const templeReviews = getTempleReviews(temple);
      setReviews(templeReviews);
      if (__DEV__) {
        console.log('🔄 리뷰 업데이트:', temple.name, '리뷰 개수:', templeReviews.length);
        console.log('🔍 선택된 리뷰:', templeReviews);
      }
    }
  }, [temple]);

  // Load attractions based on area code when temple data is available
  useEffect(() => {
    const loadAttractionsByArea = async () => {
      if (temple && typeof temple.areaCd === 'number') {
        setAttractionsLoading(true);
        try {
          if (__DEV__) {
            console.log(`🏞️ 지역코드 기반 주변 관광지 검색 시작: areaCd=${temple.areaCd}, sigunguCd=${temple.sigunguCd}`);
          }

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
            if (__DEV__) {
              console.log(`✅ 주변 관광지 ${enriched.length}개 로드 완료 (이미지 보강 포함)`);
            }
          } else {
            if (__DEV__) {
              console.log('⚠️ 주변 관광지 없음 → fallback 사용');
            }
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
      if (__DEV__) {
        console.log('📅 날짜 선택 해제');
      }
    } else {
      // 새로운 날짜 범위 선택
      setSelectedDate([date, nextDay]);
      if (__DEV__) {
        console.log('📅 선택된 날짜 범위:', date.toDateString(), '~', nextDay.toDateString());
      }
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
      if (__DEV__) {
        console.log('📋 프로그램 선택 해제:', program.title);
      }
    } else {
      // 새로운 프로그램 선택
      setSelectedProgram(program);
      if (__DEV__) {
        console.log('📋 선택된 프로그램:', program);
      }
      if (__DEV__) {
        console.log('📋 선택된 프로그램 제목:', program.title);
      }
      if (__DEV__) {
        console.log('📋 선택된 프로그램 설명:', program.description);
      }
      
      // programDetails에서 해당 프로그램의 가격 정보 찾기
      if (__DEV__) {
        console.log('🔍 programDetails 찾기:', program.title);
      }
      if (__DEV__) {
        console.log('🔍 현재 temple 객체:', temple);
      }
      if (__DEV__) {
        console.log('🔍 temple.programDetails:', temple?.programDetails);
      }
      
      const programDetail = temple?.programDetails?.[program.title];
      if (__DEV__) {
        console.log('🔍 programDetails 결과:', programDetail);
      }
      
      if (!programDetail) {
        console.log('❌ programDetails에서 가격 정보를 찾을 수 없음');
        if (__DEV__) {
          console.log('🔍 사용 가능한 programDetails 키들:', Object.keys(temple?.programDetails || {}));
        }
        
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
  const handleReservation = useCallback(async () => {
    // 디버깅을 위한 로그
    if (__DEV__) {
      console.log('🔍 handleReservation 호출됨');
      console.log('🔍 isGuestMode (userStore):', isGuestMode);
      console.log('🔍 isLoggedIn (userStore):', isLoggedIn);
    }
    
    // 로그인된 상태라면 바로 예약 진행
    if (isLoggedIn && !isGuestMode) {
      if (__DEV__) {
        console.log('🔍 로그인된 사용자, 예약 진행');
      }
      // 예약 로직으로 바로 진행
    } else {
      // 게스트 모드이거나 로그인되지 않은 경우 로그인 모달 표시
      if (__DEV__) {
        console.log('🔍 게스트 모드 또는 비로그인 상태, 로그인 모달 표시');
      }
      setShowLoginModal(true);
      return;
    }
    
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
  }, [selectedProgram, navigation, temple, isGuestMode, isLoggedIn]);


  
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
      <View 
        className="relative bg-stone-200"
        style={{ height: templeImageHeight }}
      >
        {(() => {
          if (__DEV__) {
            console.log('🔍 사찰 이미지 디버깅:', {
              templeName: temple.name,
              imageUrl: temple.imageUrl,
              imageUrlType: typeof temple.imageUrl,
              hasImageUrl: !!temple.imageUrl
            });
          }
          
          return temple.imageUrl ? (
            <Image 
              source={temple.imageUrl} 
              className="w-full h-full" 
              resizeMode="cover"
              onError={(error) => {
                if (__DEV__) {
                  console.log('❌ Image loading error:', error);
                }
                if (__DEV__) {
                  console.log('🔍 temple.imageUrl:', temple.imageUrl);
                }
                if (__DEV__) {
                  console.log('🔍 temple.name:', temple.name);
                }
              }}
              onLoad={() => console.log('✅ Image loaded successfully:', temple.imageUrl)}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text style={{ fontSize: iconSize * 2 }}>🏯</Text>
              <Text 
                className="text-neutral-500 mt-2"
                style={{ fontSize: templeDescSize }}
              >
                Could not load image
              </Text>
              <Text 
                className="text-neutral-400 mt-1"
                style={{ fontSize: templeDistanceSize - 1 }}
              >
                imageUrl: {JSON.stringify(temple.imageUrl)}
              </Text>
              <Text 
                className="text-neutral-400 mt-1"
                style={{ fontSize: templeDistanceSize - 1 }}
              >
                temple.name: {temple.name}
              </Text>
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
        <Text 
          className="font-bold text-neutral-900 mb-2"
          style={{ fontSize: templeTitleSize }}
        >
          {temple.name.replace(/Temple/g, '').trim()}
        </Text>
            <Text 
              className="text-neutral-700 mb-2"
              style={{ fontSize: templeDescSize }}
            >
              {temple.address}
            </Text>

          </View>

        {/* 템플스테이 프로그램 */}
        <View className="mb-6">
          <Text 
            className="font-bold text-neutral-900 mb-3"
            style={{ fontSize: programTitleSize }}
          >
            Templestay Programs
          </Text>
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
                         <Text 
                           className="font-semibold text-sage-600 mb-1"
                           style={{ fontSize: programTitleSize }}
                         >
                           {program.title}
                         </Text>
      <Text 
        className="text-neutral-600 mb-2" 
        style={{ fontSize: programDescSize }}
        numberOfLines={2}
      >
        {program.description}
      </Text>
                  <Text 
                    className="font-bold text-neutral-900"
                    style={{ fontSize: templeDescSize }}
                  >
                    ₩{(() => {
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
                      <Text 
                        className="text-sage-600 ml-1"
                        style={{ fontSize: templeDistanceSize }}
                      >
                        Selected
                      </Text>
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
                    <Text 
                      className="text-stone-700 font-bold"
                      style={{ fontSize: templeDistanceSize }}
                    >
                      ₩
                    </Text>
                  </View>
                  <Text 
                    className="font-bold text-neutral-900"
                    style={{ fontSize: programTitleSize }}
                  >
                    Participation Fee
                  </Text>
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
                    <Text 
                      className="font-bold text-neutral-900"
                      style={{ fontSize: templeDescSize }}
                    >
                      {(() => {
                        // TEMPLES_DATA에서 직접 가져오기
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                        
                        if (__DEV__) {
                          console.log('🔍 Adult 가격 계산:', {
                            templeId,
                            selectedProgramTitle: selectedProgram.title,
                            basicTemple: basicTemple?.name,
                            programDetail,
                            adultPrice: programDetail?.pricing?.adult,
                            fallbackPrice: selectedProgram.price
                          });
                        }
                        
                        if (programDetail?.pricing?.adult) {
                          return programDetail.pricing.adult.toLocaleString();
                        }
                        // fallback: 기본 가격 사용
                        return selectedProgram.price?.toLocaleString() || '가격 정보 없음';
                      })()}
                    </Text>
                    <Text 
                      className="font-bold text-neutral-900"
                      style={{ fontSize: templeDescSize }}
                    >
                      {(() => {
                        // TEMPLES_DATA에서 직접 가져오기
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                        
                        if (__DEV__) {
                          console.log('🔍 Teenager 가격 계산:', {
                            templeId,
                            selectedProgramTitle: selectedProgram.title,
                            teenagerPrice: programDetail?.pricing?.teenager,
                            fallbackPrice: selectedProgram.price ? Math.floor(selectedProgram.price * 0.9) : 'N/A'
                          });
                        }
                        
                        if (programDetail?.pricing?.teenager) {
                          return programDetail.pricing.teenager.toLocaleString();
                        }
                        // fallback: 기본 가격의 90%
                        const basePrice = selectedProgram.price;
                        return basePrice ? Math.floor(basePrice * 0.9).toLocaleString() : '가격 정보 없음';
                      })()}
                    </Text>
                    <Text 
                      className="font-bold text-neutral-900"
                      style={{ fontSize: templeDescSize }}
                    >
                      {(() => {
                        // TEMPLES_DATA에서 직접 가져오기
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                        
                        if (__DEV__) {
                          console.log('🔍 Child 가격 계산:', {
                            templeId,
                            selectedProgramTitle: selectedProgram.title,
                            childPrice: programDetail?.pricing?.child,
                            fallbackPrice: selectedProgram.price ? Math.floor(selectedProgram.price * 0.8) : 'N/A'
                          });
                        }
                        
                        if (programDetail?.pricing?.child) {
                          return programDetail.pricing.child.toLocaleString();
                        }
                        // fallback: 기본 가격의 80%
                        const basePrice = selectedProgram.price;
                        return basePrice ? Math.floor(basePrice * 0.8).toLocaleString() : '가격 정보 없음';
                      })()}
                    </Text>
                    <Text 
                      className="font-bold text-neutral-900"
                      style={{ fontSize: templeDescSize }}
                    >
                      {(() => {
                        // TEMPLES_DATA에서 직접 가져오기
                        const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
                        const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                        
                        if (__DEV__) {
                          console.log('🔍 Preschool 가격 계산:', {
                            templeId,
                            selectedProgramTitle: selectedProgram.title,
                            preschoolPrice: programDetail?.pricing?.preschool,
                            fallbackPrice: selectedProgram.price ? Math.floor(selectedProgram.price * 0.7) : 'N/A'
                          });
                        }
                        
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
                  <Text 
                    className="font-bold text-neutral-900"
                    style={{ fontSize: programTitleSize }}
                  >
                    Program Introduction
                  </Text>
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


        {/* 하단: User Reviews */}
        <View className="mb-6">
          <Text 
            className="font-bold text-neutral-900 mb-3"
            style={{ fontSize: programTitleSize }}
          >
            User Reviews
          </Text>
          {reviews.length === 0 ? (
                         <View className="bg-stone-50 border border-stone-200 rounded-lg p-4">
               {/* 리뷰가 없을 때 */}
               <View className="items-center py-6">
                 <Text className="text-neutral-500 mt-2 text-center">No reviews yet</Text>
                 <Text className="text-xs text-neutral-400 text-center mt-1">Be the first to share your experience!</Text>
               </View>
             </View>
          ) : (
            <FlatList
              horizontal
              data={reviews}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item: review }) => (
                <View className="bg-white border border-stone-200 rounded-lg p-4 mr-3 w-80">
                                     {/* 리뷰 헤더 */}
                                       <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-neutral-900">{review.userName}</Text>
                      </View>
                    <View className="flex-row items-center">
                      {/* 별점 표시 */}
                      {[...Array(5)].map((_, index) => (
                        <Ionicons
                          key={index}
                          name={index < review.rating ? "star" : "star-outline"}
                          size={14}
                          color={index < review.rating ? "#F59E0B" : "#D1D5DB"}
                        />
                      ))}
                      <Text className="text-xs text-neutral-600 ml-1">{review.rating}</Text>
                    </View>
                  </View>
                  
                  {/* 리뷰 내용 */}
                  <Text className="text-sm text-neutral-700 mb-2 leading-5" numberOfLines={4}>{review.comment}</Text>
                  
                  {/* 리뷰 날짜 */}
                  <Text className="text-xs text-neutral-500 text-right">{review.date}</Text>
                </View>
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
          )}
        </View>

        {/* 하단: Nearby Attractions */}
        <View className="mb-4">
          <Text 
            className="font-bold text-neutral-900 mb-3"
            style={{ fontSize: programTitleSize }}
          >
            Nearby Attractions
          </Text>
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
               {temple.name === 'Simwonsa Temple' ? (
                 <>
                   <Text className="text-sm text-neutral-600 mb-1">No nearby attractions available</Text>
                   <Text className="text-xs text-neutral-500 text-center">
                     Tourist information for this area is not currently available
                   </Text>
                 </>
               ) : (
                 <>
                   <Text className="text-4xl mb-2">🏞️</Text>
                   <Text className="text-sm font-medium text-neutral-700 mb-1">주변 관광지 정보를 불러올 수 없습니다</Text>
                   <Text className="text-xs text-neutral-500 text-center">
                     현재 이 지역의 관광지 정보가 제공되지 않습니다
                   </Text>
                 </>
               )}
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
              <Text 
                className="font-bold text-amber-800"
                style={{ fontSize: programTitleSize }}
              >
                Reservation Complete!
              </Text>
              <Text 
                className="text-amber-700 text-center mt-2"
                style={{ fontSize: templeDescSize }}
              >
                Your reservation has been successfully completed
              </Text>
            </View>

            {/* 버튼들 */}
            <View className="space-y-5">
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

      {/* 로그인 필요 모달 */}
      <Modal
        visible={showLoginModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-12">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm border border-gray-200" style={{ maxWidth: 280 }}>
            {/* 모달 헤더 */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-stone-200 rounded-full items-center justify-center mb-3">
                <Ionicons name="log-in-outline" size={32} color="#5A4636" />
              </View>
              <Text 
                className="font-bold text-neutral-900"
                style={{ fontSize: programTitleSize }}
              >
                Login Required
              </Text>
              <Text 
                className="text-stone-600 text-center mt-2"
                style={{ fontSize: templeDescSize }}
              >
                Please sign in to make a reservation
              </Text>
            </View>

            {/* 버튼들 */}
            <View className="px-4">
              <TouchableOpacity 
                className="w-full bg-sage-600 py-4 rounded-xl mb-4"
                onPress={() => {
                  setShowLoginModal(false);
                  navigation.getParent()?.navigate('Login');
                }}
              >
                <Text className="text-white font-semibold text-center">Sign In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="w-full bg-stone-200 py-4 rounded-xl"
                onPress={() => setShowLoginModal(false)}
              >
                <Text className="text-stone-700 font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
     </ScrollView>
   );
 };

export default ReservationDetailScreen;


