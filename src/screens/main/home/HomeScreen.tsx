import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Image, TextInput, Pressable, FlatList, Animated, Modal, ScrollView, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { getAllTemples, getTemplesByRegion, getTemplesWithOneDayPrograms, getTemplesWithOneDayProgramsByRegion } from '../../../data/temple-data';
import { Temple } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import useLocationStore from '../../../store/locationStore';
import useTempleStore from '../../../store/templeStore';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isLargeScreen = height > 800;

// Responsive sizes
const headerFontSize = isSmallScreen ? 18 : (isLargeScreen ? 24 : 20);
const subHeaderFontSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const quickActionSize = isSmallScreen ? 36 : (isLargeScreen ? 48 : 42);
const quickActionFontSize = isSmallScreen ? 9 : (isLargeScreen ? 12 : 10);
const cardPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
const cardMargin = isSmallScreen ? 4 : (isLargeScreen ? 8 : 6);
const templeImageSize = isSmallScreen ? 36 : (isLargeScreen ? 48 : 42);
const templeTitleSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const templeDescSize = isSmallScreen ? 9 : (isLargeScreen ? 13 : 11);
const templeDistanceSize = isSmallScreen ? 8 : (isLargeScreen ? 12 : 10);
const sectionPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
const searchFontSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const searchPadding = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
const iconSize = isSmallScreen ? 14 : (isLargeScreen ? 18 : 16);

const QuickAction = memo<{
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}>(function QuickAction({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} className="items-center mr-4">
      <View 
        className="rounded-full bg-[#FFFDF8] border border-stone-200 justify-center items-center active:bg-stone-50"
        style={{ width: quickActionSize, height: quickActionSize }}
      >
        {icon}
      </View>
      <Text 
        className="font-medium text-neutral-700 mt-1"
        style={{ fontSize: quickActionFontSize }}
      >
        {label}
      </Text>
    </Pressable>
  );
});

const TempleCard = memo<{
  temple: Temple;
  onPress: () => void;
  onToggleFavorite: (temple: Temple) => void;
  isFavorite: boolean;
  coords?: { latitude: number; longitude: number } | null;
}>(({ temple, onPress, onToggleFavorite, isFavorite, coords }) => {
  const handleHeartPress = useCallback((e: any) => {
    e.stopPropagation();
    onToggleFavorite(temple);
  }, [onToggleFavorite, temple]);

  return (
    <TouchableOpacity
      className="flex-row items-center bg-[#FFFDF8] rounded-2xl border border-stone-200 active:bg-stone-50"
      style={{ padding: cardPadding, marginBottom: cardMargin }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View 
        className="rounded-xl bg-stone-100 justify-center items-center mr-3.5 border border-stone-200"
        style={{ width: templeImageSize, height: templeImageSize }}
      >
        {temple.imageUrl ? (
          <Image 
            source={typeof temple.imageUrl === 'string' ? { uri: temple.imageUrl } : temple.imageUrl} 
            className="rounded-xl" 
            style={{ width: templeImageSize, height: templeImageSize }}
          />
        ) : (
          <Ionicons name="business-outline" size={templeImageSize * 0.8} color="#9AA0A6" />
        )}
      </View>
      <View className="flex-1">
        <Text 
          className="font-semibold text-neutral-900 mb-0.5"
          style={{ fontSize: templeTitleSize }}
        >
          {temple.name}
        </Text>
        <Text 
          className="text-neutral-600 mb-1 font-normal"
          style={{ fontSize: templeDescSize }}
        >
          {temple.region}
        </Text>
        <View className="flex-row items-center">
          <FontAwesome name="star" size={iconSize - 2} color="#FF6B6B" style={{ marginRight: 2 }} />
          <Text 
            className="text-neutral-900 ml-0.5 mr-2.5 font-medium"
            style={{ fontSize: templeDistanceSize }}
          >
            {temple.rating || '4.8'}
          </Text>
          <Text 
            className="text-neutral-600 font-normal"
            style={{ fontSize: templeDistanceSize }}
          >
            {coords && temple.latitude && temple.longitude
              ? `${(Math.round(((function(){
                  const R = 6371;
                  const dLat = (temple.latitude - coords.latitude) * (Math.PI / 180);
                  const dLon = (temple.longitude - coords.longitude) * (Math.PI / 180);
                  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(coords.latitude * (Math.PI / 180)) * Math.cos(temple.latitude * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                  return R * c;
                })()) * 10) / 10)}km`
              : '—'}
          </Text>
        </View>
      </View>
      <TouchableOpacity className="ml-2.5 p-1" onPress={handleHeartPress}>
        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={iconSize + 2} color={isFavorite ? '#FF6B6B' : '#9AA0A6'} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const RegionButton = memo<{
  region: string;
  isSelected: boolean;
  onPress: (region: string) => void;
}>(({ region, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(region);
  }, [region, onPress]);

  return (
    <TouchableOpacity
      className={`rounded-2xl mr-2 border ${isSelected ? 'bg-sage-600 border-sage-600' : 'bg-white border-stone-200 active:bg-stone-50'}`}
      style={{ paddingHorizontal: sectionPadding, paddingVertical: sectionPadding - 4 }}
      onPress={handlePress}
    >
      <Text 
        className={`font-medium ${isSelected ? 'text-white font-semibold' : 'text-neutral-600'}`}
        style={{ fontSize: templeDescSize }}
      >
        {region}
      </Text>
    </TouchableOpacity>
  );
});

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [selectedRegion, setSelectedRegion] = useState('Gyeongbuk');
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOneDayMode, setIsOneDayMode] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const { coords, initialize, forceRequestPermission, permissionStatus } = useLocationStore();
  const { toggleFavorite, isFavorite } = useTempleStore();

  const safeCoords = coords || null;
  const safeIsFavorite = isFavorite || (() => false);

  // 당일형 프로그램을 가진 사찰들의 지역 목록
  const ONE_DAY_REGIONS = useMemo(() => [
    { key: 'all', label: t('home.regions.all'), value: 'All' },
    { key: 'gyeongju', label: t('home.regions.gyeongju'), value: 'Gyeongju' },
    { key: 'mungyeong', label: '문경', value: 'Mungyeong' },
    { key: 'pohang', label: t('home.regions.pohang'), value: 'Pohang' },
    { key: 'gyeongsan', label: '경산', value: 'Gyeongsan' },
    { key: 'seongju', label: '성주', value: 'Seongju' },
  ], [t]);

  // 일반 지역 목록
  const REGULAR_REGIONS = useMemo(() => [
    { key: 'all', label: t('home.regions.all'), value: 'All' },
    { key: 'gyeongju', label: t('home.regions.gyeongju'), value: 'Gyeongju' },
    { key: 'andong', label: t('home.regions.andong'), value: 'Andong' },
    { key: 'yeongju', label: t('home.regions.yeongju'), value: 'Yeongju' },
    { key: 'pohang', label: t('home.regions.pohang'), value: 'Pohang' },
    { key: 'gumi', label: t('home.regions.gumi'), value: 'Gumi' },
  ], [t]);

  // 현재 모드에 따른 지역 목록 선택
  const currentRegions = isOneDayMode ? ONE_DAY_REGIONS : REGULAR_REGIONS;

  const loadTemples = useCallback(async () => {
    try {
      setLoading(true);
      let templeData: Temple[];
      
      if (isOneDayMode) {
        // 당일형 모드일 때는 당일형 프로그램을 가진 사찰들만 로드
        if (selectedRegion === 'All') {
          templeData = getTemplesWithOneDayPrograms();
        } else {
          templeData = getTemplesWithOneDayProgramsByRegion(selectedRegion);
        }
      } else {
        // 일반 모드일 때는 기존 로직 사용
        if (selectedRegion === 'All') templeData = getAllTemples();
        else templeData = getTemplesByRegion(selectedRegion);
      }
      
      setTemples(templeData);
    } catch (error) {
      console.error('Failed to load temples:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, isOneDayMode]);

  useEffect(() => { loadTemples(); }, [loadTemples]);

  // 홈 화면 진입 시 위치 권한 요청
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        console.log('🏠 HomeScreen: 위치 권한 요청 시작');
        
        // 현재 권한 상태 확인
        const currentStatus = await Location.getForegroundPermissionsAsync();
        console.log('🏠 HomeScreen: 현재 위치 권한 상태:', currentStatus.status);
        
        if (currentStatus.status === Location.PermissionStatus.GRANTED) {
          console.log('🏠 HomeScreen: 위치 권한 이미 허용됨');
          return;
        }
        
        // 권한이 거부된 경우 알림 표시
        if (currentStatus.status === Location.PermissionStatus.DENIED) {
          console.log('🏠 HomeScreen: 위치 권한 거부됨 - 알림 표시');
          setTimeout(() => {
            showLocationPermissionAlert();
          }, 1000);
          return;
        }
        
        // 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('🏠 HomeScreen: 위치 권한 요청 결과:', status);
        
        if (status === Location.PermissionStatus.DENIED) {
          setTimeout(() => {
            showLocationPermissionAlert();
          }, 1000);
        }
      } catch (error) {
        console.error('🏠 HomeScreen: 위치 권한 요청 실패:', error);
      }
    };
    
    requestLocationPermission();
  }, []);

  const handleRegionSelect = useCallback((region: string) => { 
    setSelectedRegion(region); 
  }, []);

  const handleTemplePress = useCallback((templeId: string) => {
    try { navigation?.navigate('TempleStack', { screen: 'ReservationDetail', params: { templeId } }); } catch {}
  }, [navigation]);

  // One-Day 버튼 클릭 핸들러
  const handleOneDayPress = useCallback(() => {
    try { 
      setIsOneDayMode(true); // HomeScreen에서도 one-day 모드 활성화
      navigation?.navigate('TempleStack', { 
        screen: 'TempleList',
        params: { oneDayMode: true }
      }); 
    } catch {}
  }, [navigation]);

  // 일반 모드로 돌아가는 핸들러
  const handleRegularModePress = useCallback(() => {
    setIsOneDayMode(false);
    setSelectedRegion('Gyeongbuk'); // 기본 지역으로 초기화
  }, []);

  // Apple 가이드라인 5.1.1 준수: 위치 권한 거부 시 재허용 유도 금지
  // 권한이 필요한 기능 사용 시에만 간단한 안내만 제공
  const showLocationPermissionAlert = useCallback(() => {
    // Apple 가이드라인 준수를 위해 재허용 유도 메시지 제거
    // 단순히 로그만 남기고 사용자 결정 존중
    console.log('🏠 HomeScreen: 위치 권한이 거부되어 기본 템플 목록을 표시합니다');
  }, []);

  const templeCards = useMemo(() =>
    temples.map(temple => (
      <TempleCard
        key={temple.id}
        temple={temple}
        onPress={() => handleTemplePress(temple.id)}
        onToggleFavorite={toggleFavorite}
        isFavorite={safeIsFavorite(temple.id)}
        coords={safeCoords}
      />
    )), [temples, handleTemplePress, toggleFavorite, safeIsFavorite, safeCoords]
  );

  // ===== Scroll/Layouts =====
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_H = 120; // 타이틀+검색바 높이

  // 배너
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const bannerWidth = width - 40; // 화면 너비 - 좌우 패딩
  const bannerImages = [
    require('../../../../assets/banner-1.jpg'),
    require('../../../../assets/banner-2.jpg'),
    require('../../../../assets/banner-3.jpg'),
  ];

  // 두 번째 배너 자동 스크롤 (후기용)
  const reviewRef = useRef<FlatList>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
  // 후기 데이터
  const reviewData = [
    {
      id: '1',
      image: require('../../../../assets/bulguksa-temple.jpg'),
      title: 'Bulguksa Temple Stay was really great!',
      temple: 'Bulguksa',
      rating: 4
    },
    {
      id: '2',
      image: require('../../../../assets/bogyeongsa-temple.jpg'),
      title: 'Peaceful time at Bogyeongsa Temple',
      temple: 'Bogyeongsa',
      rating: 5
    },
    {
      id: '3',
      image: require('../../../../assets/daeseungsa-temple.jpg'),
      title: 'Temple Stay experience at Daeseungsa',
      temple: 'Daeseungsa',
      rating: 5
    },
    {
      id: '4',
      image: require('../../../../assets/jikjisa-temple.jpg'),
      title: 'Finding peace of mind at Jikjisa',
      temple: 'Jikjisa',
      rating: 4
    }
  ];
  
  // 무한 스크롤을 위한 확장된 후기 배열
  const extendedReviewData = [...reviewData, ...reviewData, ...reviewData];

  // 배너 자동 스크롤 (Animated 사용)
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentBannerIndex + 1) % bannerImages.length;
      
      // Animated로 부드럽게 이동
      Animated.timing(bannerScrollX, {
        toValue: -nextIndex * bannerWidth,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // 애니메이션 완료 후 숫자 변경
        setCurrentBannerIndex(nextIndex);
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [bannerImages.length, bannerWidth, bannerScrollX, currentBannerIndex]);

  // 두 번째 배너 자동 스크롤 (후기용)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => {
        const next = (prev + 1) % reviewData.length;
        // 무한 스크롤을 위해 확장된 배열의 인덱스 계산
        const scrollIndex = next + reviewData.length;
        reviewRef.current?.scrollToOffset({ 
          offset: scrollIndex * 381, // 정확한 픽셀 위치 계산
          animated: true 
        });
        return next;
      });
    }, 5000); // 5초마다 다음 후기로
    return () => clearInterval(interval);
  }, [reviewData.length]);
  

  // 두 번째 배너 초기 위치 설정 (중앙에서 시작)
  useEffect(() => {
    if (reviewRef.current) {
      reviewRef.current.scrollToOffset({ 
        offset: reviewData.length * 381, // 정확한 픽셀 위치 계산
        animated: false 
      });
    }
  }, [reviewData.length]);

  const handleBannerPress = useCallback((index: number) => {
    if (index === 1) navigation?.navigate('Market');
    else if (index === 2) navigation?.navigate('Transportation');
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFDF8' }} edges={['top', 'left', 'right']}>
      {/* 1) 헤더: 먼저 렌더 → 기본 쌓임순서에서 아래 레이어 */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          // zIndex/elevation 안 줌(=아래). 필요시 zIndex:0 명시 가능
        }}
        pointerEvents="box-none"
        collapsable={false}
      >
        <View className="px-5 pt-18 pb-2">
          <View className="px-0">
            <View className="flex-row items-start justify-center">
              <View className="items-center mt-2">
                <Image
                  source={require('../../../../assets/home-logo.png')}
                  style={{ width: 198, height: 66 }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 2) 오버레이: 헤더 다음에 렌더 → 기본 쌓임순서에서 위 레이어(=헤더를 덮음) */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        renderToHardwareTextureAndroid
        collapsable={false}
      >
        <Animated.ScrollView
          contentContainerStyle={{ paddingTop: HEADER_H + 36, paddingBottom: 100, height: 1670 }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* 🟫 베이지 섹션 */}
          <View className="bg-[#F5F1EB] rounded-t-[30px] px-5 pt-6">
            {/* 배너 */}
             <View className="mt-1  ml-1">
              <View style={{ width: bannerWidth, height: 110 }} className="rounded-4xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative">
                <Animated.View
                  style={{
                    flexDirection: 'row',
                    transform: [{ translateX: bannerScrollX }],
                  }}
                >
                  {bannerImages.map((item, index) => (
                    <View key={index} style={{ width: bannerWidth, height: 110 }}>
                      <TouchableOpacity activeOpacity={0.9} onPress={() => handleBannerPress(index)}>
                        <Image source={item} style={{ width: bannerWidth, height: 110}} resizeMode="cover" />
                        <View className="absolute bottom-1 left-0 right-0">
                          <View className="bg-black/30 px-3 py-0.5">
                            <Text className="text-white text-base font-bold ml-3">
                              {index === 0 ? "Join a Templestay in Gyeongbuk!" :
                               index === 1 ? "Browse Buddhist Souvenirs" :
                               "Explore comfortably with a tour taxi"}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </Animated.View>
                {/* 인디케이터 */}
                <View className="absolute top-2 right-3">
                  <View className="bg-black/50 px-2 py-1 rounded-full">
                    <Text className="text-white text-sm font-bold">
                      {currentBannerIndex + 1}/{bannerImages.length}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 섹션들 */}
            <View className="mt-8">
              {/* Recommend Temple */}
              <View className="flex-row justify-between items-center mb-3">
                <View>
                  <Text 
                    className="font-bold text-neutral-800"
                    style={{ fontSize: headerFontSize }}
                  >
                    Recommend Temple
                  </Text>
                </View>
              </View>

              {/* Popular */}
                              <View className="-mt-0, -ml-2">
                <TouchableOpacity
                  className="w-[380px] h-32 rounded-tl-3xl rounded-tr-3xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative"
                  onPress={() => { try { navigation?.navigate('TempleStack', { screen: 'RecommendTemples', params: { boxType: 'popular' } }); } catch {} }}
                  activeOpacity={0.8}
                >
                  <Image source={require('../../../../assets/jikjisa-temple.jpg')} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute bottom-2 left-2">
                                          <View className="bg-black/25 px-3 py-1 rounded-2xl">
                        <Text className="text-white text-lg font-bold">Popular</Text>
                      </View>
                  </View>
                </TouchableOpacity>
              </View>



              {/* By Distance */}
              <View className="mt-0, -ml-2">
                <TouchableOpacity
                  className="w-[380px] h-32 rounded-1xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative"
                  onPress={() => { try { navigation?.navigate('TempleStack', { screen: 'RecommendTemples', params: { boxType: 'distance' } }); } catch {} }}
                  activeOpacity={0.8}
                >
                  <Image source={require('../../../../assets/map.jpg')} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute bottom-2 left-2">
                    <View className="bg-black/25 px-3 py-1 rounded-2xl">
                      <Text className="text-white text-lg font-bold">By Distance</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* One-Day */}
              <View className="mt-0, -ml-2">
                <TouchableOpacity
                  className="w-[380px] h-32 rounded-bl-3xl rounded-br-3xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative"
                  onPress={() => { try { navigation?.navigate('TempleStack', { screen: 'RecommendTemples', params: { boxType: 'oneday' } }); } catch {} }}
                  activeOpacity={0.8}
                >
                  <Image source={require('../../../../assets/day-trip.jpg')} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute bottom-2 left-2">
                                          <View className="bg-black/25 px-3 py-1 rounded-2xl">
                        <Text className="text-white text-lg font-bold">One-Day</Text>
                      </View>
                  </View>
                </TouchableOpacity>
              </View>





              {/* Top Places to Visit in Gyeongbuk */}
              <View className="mt-16 mb-4 ml-1">
                <Text 
                  className="font-bold text-neutral-800"
                  style={{ fontSize: headerFontSize }}
                >
                  Top Places to Visit in Gyeongbuk
                </Text>
              </View>

              {/* Top Places Box */}
              <View className="w-[360px] h-128 rounded-1xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative mb-4 ml-1">
                <View className="w-full h-full bg-gradient-to-r from-sage-100 to-stone-100 relative">
                  
                  {/* 가로 5등분 선들 */}
                  <View className="absolute top-0 left-0 right-0 h-full">
                    {/* 1/5 선 */}
                    <View className="absolute top-0 left-0 right-0 h-px bg-stone-200/40" style={{ top: '20%' }} />
                    {/* 2/5 선 */}
                    <View className="absolute top-0 left-0 right-0 h-px bg-stone-200/40" style={{ top: '40%' }} />
                    {/* 3/5 선 */}
                    <View className="absolute top-0 left-0 right-0 h-px bg-stone-200/40" style={{ top: '60%' }} />
                    {/* 4/5 선 */}
                    <View className="absolute top-0 left-0 right-0 h-px bg-stone-200/40" style={{ top: '80%' }} />
                  </View>

                  {/* 섹터별 숫자들 */}
                  {/* 1번 섹터 */}
                  <View className="absolute left-4" style={{ top: '6.5%' }}>
                    <Text className="text-6xl font-bold text-neutral-800" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>1</Text>
                  </View>
                  
                  {/* 2번 섹터 */}
                  <View className="absolute left-4" style={{ top: '26.5%' }}>
                    <Text className="text-6xl font-bold text-neutral-800" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>2</Text>
                  </View>
                  
                  {/* 3번 섹터 */}
                  <View className="absolute left-4" style={{ top: '46.5%' }}>
                    <Text className="text-6xl font-bold text-neutral-800" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>3</Text>
                  </View>
                  
                  {/* 4번 섹터 */}
                  <View className="absolute left-4" style={{ top: '66.5%' }}>
                    <Text className="text-6xl font-bold text-neutral-800" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>4</Text>
                  </View>
                  
                  {/* 5번 섹터 */}
                  <View className="absolute left-4" style={{ top: '86.5%' }}>
                    <Text className="text-6xl font-bold text-neutral-800" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>5</Text>
                  </View>

                  {/* 장소명과 주소들 */}
                  {/* 1번 섹터 - Donggung Palace */}
                  <View className="absolute left-16" style={{ top: '6%' }}>
                    <Text className="text-lg font-semibold text-neutral-800 mb-1">Donggung Palace and Wolji Pond</Text>
                    <Text className="text-sm text-neutral-700">102 Wonhwa-ro, Gyeongju-si</Text>
                  </View>
                  
                  {/* 2번 섹터 - Bulguksa Temple */}
                  <View className="absolute left-16" style={{ top: '25%' }}>
                    <Text className="text-lg font-semibold text-neutral-800 mb-1">Andong Hahoe Folk Village</Text>
                    <Text className="text-sm text-neutral-700">186 Jeonseo-ro, Pungcheon-myeon,</Text>
                    <Text className="text-sm text-neutral-700">Andong-si</Text>
                  </View>
                  
                  {/* 3번 섹터 - Seokguram Grotto */}
                  <View className="absolute left-16" style={{ top: '46%' }}>
                    <Text className="text-lg font-semibold text-neutral-800 mb-1">Space Walk</Text>
                    <Text className="text-sm text-neutral-700">30 Hwanhogongwon-gil, Buk-gu, Pohang-si</Text>
                  </View>
                  
                  {/* 4번 섹터 - Andong Hahoe Folk Village */}
                  <View className="absolute left-16" style={{ top: '65%' }}>
                    <Text className="text-lg font-semibold text-neutral-800 mb-1">Homigot Sunrise Square</Text>
                    <Text className="text-sm text-neutral-700">20 Haemaji-ro 150beon-gil, Homigot-myeon,</Text>
                    <Text className="text-sm text-neutral-700">Nam-gu, Pohang-si</Text>
                 </View>
                  
                  {/* 5번 섹터 - Space Walk */}
                  <View className="absolute left-16" style={{ top: '86%' }}>
                    <Text className="text-lg font-semibold text-neutral-800 mb-1">Bomun Lake</Text>
                    <Text className="text-sm text-neutral-700">424-33 Bomun-ro, Gyeongju-si</Text>
                  </View>

                  {/* 사진칸들 */}
                  {/* 1번 섹터 사진칸 */}
                  <TouchableOpacity 
                    className="absolute right-2" 
                    style={{ top: '2%' }}
                                  onPress={() => {
                try {
                  navigation?.navigate('Map', {
                    address: '102 Wonhwa-ro, Gyeongju-si, Gyeongsangbuk-do'
                  });
                } catch {}
              }}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={require('../../../../assets/sector-1.jpg')}
                      className="w-20 h-20 rounded-md"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  
                  {/* 2번 섹터 사진칸 */}
                  <TouchableOpacity 
                    className="absolute right-2" 
                    style={{ top: '22%' }}
                                  onPress={() => {
                try {
                  navigation?.navigate('Map', {
                    address: '186 Jeonseo-ro, Pungcheon-myeon, Andong-si, Gyeongsangbuk-do'
                  });
                } catch {}
              }}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={require('../../../../assets/sector-2.jpg')}
                      className="w-20 h-20 rounded-md"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  
                  {/* 3번 섹터 사진칸 */}
                  <TouchableOpacity 
                    className="absolute right-2" 
                    style={{ top: '42%' }}
                                  onPress={() => {
                try {
                  navigation?.navigate('Map', {
                    address: '30 Hwanhogongwon-gil, Buk-gu, Pohang-si, Gyeongsangbuk-do'
                  });
                } catch {}
              }}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={require('../../../../assets/sector-3.jpg')}
                      className="w-20 h-20 rounded-md"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  
                  {/* 4번 섹터 사진칸 */}
                  <TouchableOpacity 
                    className="absolute right-2" 
                    style={{ top: '62%' }}
                    onPress={() => {
                      try {
                        navigation?.navigate('Map', {
                          address: '20 Haemaji-ro 150beon-gil, Homigot-myeon, Nam-gu, Pohang-si, Gyeongsangbuk-do'
                        });
                      } catch {}
                    }}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={require('../../../../assets/sector-4.jpg')}
                      className="w-20 h-20 rounded-md"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  
                  {/* 5번 섹터 사진칸 */}
                  <TouchableOpacity 
                    className="absolute right-2" 
                    style={{ top: '82%' }}
                    onPress={() => {
                      try {
                        navigation?.navigate('Map', {
                          address: '424-33 Bomun-ro, Gyeongju-si, Gyeongsangbuk-do'
                        });
                      } catch {}
                    }}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={require('../../../../assets/sector-5.jpg')}
                      className="w-20 h-20 rounded-md"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 새로운 박스 */}
              <TouchableOpacity
                className="w-[360px] h-14 rounded-1xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative mb-1 ml-1 -mt-3"
                onPress={() => { try { navigation?.navigate('Map'); } catch {} }}
                activeOpacity={0.8}
              >
                <View className="w-full h-full bg-gradient-to-r from-sage-100 to-stone-100 relative p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1" />
                    <Text className="text-lg font-semibold text-neutral-900">Start exploring nearby attractions!</Text>
                    <View className="flex-1" />
                    <Ionicons name="chevron-forward" size={20} color="#616351" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* 후기 섹션 */}
              <View className="mt-16 mb-4 ml-4">
                <Text 
                  className="font-bold text-neutral-800"
                  style={{ fontSize: headerFontSize }}
                >
                  Review
                </Text>
              </View>

              {/* 후기 리스트 */}
              <View className="ml-0">
                <FlatList
                  ref={reviewRef}
                  data={extendedReviewData}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={381}
                  decelerationRate={0.8}
                  contentContainerStyle={{ paddingHorizontal: 0 }}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  getItemLayout={(data, index) => ({
                    length: 381, // 카드 너비(365px) + 오른쪽 마진(16px)
                    offset: 381 * index,
                    index,
                  })}
                  onMomentumScrollEnd={(e) => {
                    const offsetX = e.nativeEvent.contentOffset.x;
                    const index = Math.round(offsetX / 381);
                    
                    // 경계에 도달했을 때 중앙으로 이동
                    if (index < reviewData.length) {
                      reviewRef.current?.scrollToOffset({ 
                        offset: index + reviewData.length * 381, 
                        animated: false 
                      });
                    } else if (index >= reviewData.length * 2) {
                      reviewRef.current?.scrollToOffset({ 
                        offset: index - reviewData.length * 381, 
                        animated: false 
                      });
                    }
                  }}
                  renderItem={({ item }) => (
                    <View className="w-[365px] rounded-3xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative p-4 mr-2" style={{ marginLeft: 7.5 }}>
                      <View className="flex-row items-start">
                        {/* 왼쪽: 사찰 이미지 */}
                        <View className="w-16 h-16 bg-stone-200 rounded-lg mr-4 flex-shrink-0">
                          <Image 
                            source={item.image}
                            className="w-full h-full rounded-lg"
                            resizeMode="cover"
                          />
                        </View>
                        
                        {/* 중앙: 후기 제목과 사찰 이름 */}
                        <View className="flex-1 mr-4">
                          <Text className="text-sm font-semibold text-neutral-900 mb-2 leading-4">
                            {item.title}
                          </Text>
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="location" size={14} color="#6b7280" className="mr-1" />
                            <Text className="text-xs text-neutral-600">
                              {item.temple}
                            </Text>
                          </View>
                          {/* 별점 */}
                          <View className="flex-row items-center">
                            <View className="flex-row">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons 
                                  key={star}
                                  name={star <= item.rating ? "star" : "star-outline"} 
                                  size={16} 
                                  color={star <= item.rating ? "#F59E0B" : "#D1D5DB"} 
                                  style={{ marginRight: 2 }}
                                />
                              ))}
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                />
              </View>

              {loading ? (
                <View className="flex-1 justify-center items-center py-10">
                  <LoadingSpinner />
                </View>
              ) : (
                <View className="space-y-3">{templeCards}</View>
              )}

              {/* Privacy Policy Section */}
              <View className="mt-16">
                <View className="w-[480px] bg-[#F5F1EB] rounded-2xl border border-stone-200 p-5 -ml-9">
                  <TouchableOpacity 
                    className="flex-row items-center justify-between"
                    onPress={() => {
                      setShowPrivacyPolicy(true);
                    }}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-neutral-500 text-center mr-8">
                        Privacy Policy
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </View>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyPolicy}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyPolicy(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl mx-4 max-h-[90%] w-[95%]">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-stone-200">
              <Text className="text-xl font-bold text-neutral-900">Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Content */}
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
              <Text className="text-sm text-neutral-700 leading-6 mb-4">
                Templebuk ("the Company") complies with the Personal Information Protection Act and is committed to protecting users' personal information and rights, as well as smoothly handling user complaints related to personal data.
              </Text>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">1. Purpose of Processing Personal Information</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                The Company processes personal information for the following purposes. Personal data will not be used for any purposes other than those stated below, and if the purpose of use changes, necessary actions such as obtaining additional consent will be taken in accordance with Article 18 of the Personal Information Protection Act.
              </Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                <Text className="font-semibold">Membership Registration and Management:</Text> To confirm membership intention, identify and authenticate users for membership-based services, maintain and manage user status, prevent misuse of services, verify consent of a legal representative when collecting personal data of children under 14, provide notices and notifications, and handle complaints.
              </Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                <Text className="font-semibold">Provision of Goods or Services:</Text> To deliver products, provide services and content, offer personalized services, perform identity verification, and process payments.
              </Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                <Text className="font-semibold">Complaint Handling:</Text> To verify the identity of complainants, confirm complaints, communicate notices for fact-finding, and notify results of processing.
              </Text>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">2. Processing and Retention Period of Personal Information</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                The Company processes and retains personal data within the period specified by law or agreed upon when collecting personal data.
              </Text>
              <View className="bg-stone-50 p-3 rounded-lg mb-3">
                <Text className="text-sm font-semibold text-neutral-800 mb-2">Category | Retention Period | Legal Basis</Text>
                <Text className="text-sm text-neutral-700 mb-1">Membership Information | Until withdrawal of membership | Service use contract</Text>
                <Text className="text-sm text-neutral-700 mb-1">Service Usage Records | 3 years | E-Commerce Act</Text>
                <Text className="text-sm text-neutral-700 mb-1">Records of Contract or Cancellation | 5 years | E-Commerce Act</Text>
                <Text className="text-sm text-neutral-700 mb-1">Records of Payment and Supply of Goods | 5 years | E-Commerce Act</Text>
                <Text className="text-sm text-neutral-700 mb-1">Records of Consumer Complaints or Dispute Handling | 3 years | E-Commerce Act</Text>
              </View>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">3. Provision of Personal Information to Third Parties</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                The Company processes personal information only within the scope stated in Article 1 (Purpose of Processing) and provides personal data to third parties only when consent is obtained or as permitted by law under Articles 17 and 18 of the Personal Information Protection Act.
              </Text>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">4. Entrustment of Personal Information Processing</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                To ensure smooth processing, the Company entrusts the following personal information handling tasks:
              </Text>
              <View className="bg-stone-50 p-3 rounded-lg mb-3">
                <Text className="text-sm font-semibold text-neutral-800 mb-2">Entrusted Party | Entrusted Task</Text>
                <Text className="text-sm text-neutral-700 mb-1">Cloud Service Providers | Data storage and backup</Text>
                <Text className="text-sm text-neutral-700 mb-1">Payment Service Providers | Payment processing and management</Text>
              </View>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">5. Rights of Data Subjects and How to Exercise Them</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                Users, as data subjects, may exercise the following rights:
              </Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-1">• Request to Access Personal Information (Article 35 of the Act)</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-1">• Request to Correct or Delete Personal Information (Article 36 of the Act)</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">• Request to Suspend Processing of Personal Information (Article 37 of the Act)</Text>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">6. Personal Information Items Processed</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-1">• Required: ID, password, email address</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-1">• Optional: Name, location information</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">• Automatically Collected: IP address, cookies, service usage records, access logs</Text>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">7. Destruction of Personal Information</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                The Company promptly destroys personal information when the retention period has expired or the purpose of processing has been achieved.
              </Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-1">• Electronic files: Permanently deleted in an unrecoverable way</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">• Printed documents: Shredded or incinerated</Text>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">8. Measures to Ensure the Security of Personal Information</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                In accordance with Article 29 of the Personal Information Protection Act, the Company takes the following measures:
              </Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-1">• <Text className="font-semibold">Encryption of Personal Data:</Text> Passwords are encrypted and stored, and important data is encrypted during storage and transmission.</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-1">• <Text className="font-semibold">Technical Measures Against Hacking:</Text> Security programs are installed, regularly updated, and inspected. Systems are placed in restricted-access zones and monitored/blocked against unauthorized access.</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">• <Text className="font-semibold">Access Control:</Text> Access rights to the personal data system are managed by granting, changing, and revoking permissions, while intrusion prevention systems restrict unauthorized access.</Text>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">9. Personal Information Protection Officer</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                The Company designates the following person to oversee personal information protection, handle complaints, and provide remedies:
              </Text>
              <View className="bg-stone-50 p-3 rounded-lg mb-3">
                <Text className="text-sm text-neutral-700 mb-1">• Name: Kim Seo-hyun</Text>
                <Text className="text-sm text-neutral-700 mb-1">• Position: Data Protection Officer</Text>
                <Text className="text-sm text-neutral-700 mb-1">• Email: kimziin0513@gmail.com</Text>
              </View>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">10. Changes to the Privacy Policy</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                This Privacy Policy will take effect from the effective date. Any additions, deletions, or modifications required by law or internal policy will be notified through announcements at least 7 days prior to enforcement.
              </Text>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">11. Department for Requests to Access Personal Information</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-3">
                Users may request access to their personal information under Article 35 of the Act through the following department. The Company will strive to process requests promptly.
              </Text>
              <View className="bg-stone-50 p-3 rounded-lg mb-3">
                <Text className="text-sm text-neutral-700 mb-1">• Department: Kim Seo-hyun</Text>
                <Text className="text-sm text-neutral-700 mb-1">• Person in Charge: Data Protection Officer</Text>
                <Text className="text-sm text-neutral-700 mb-1">• Email: kimziin0513@gmail.com</Text>
              </View>
              
              <Text className="text-base font-bold text-neutral-900 mb-2">Effective Date</Text>
              <Text className="text-sm text-neutral-700 leading-6 mb-4">
                This Privacy Policy will be effective as of August 19, 2025.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>


    </SafeAreaView>
  );
};

export default HomeScreen;

