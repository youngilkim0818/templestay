import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Image, TextInput, Pressable, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { getAllTemples, getTemplesByRegion, getTemplesWithOneDayPrograms, getTemplesWithOneDayProgramsByRegion } from '../../../data/temple-data';
import { Temple } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import useLocationStore from '../../../store/locationStore';
import useTempleStore from '../../../store/templeStore';

const { width } = Dimensions.get('window');

const QuickAction = memo<{
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}>(function QuickAction({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} className="items-center mr-4">
      <View className="w-12 h-12 rounded-full bg-[#FFFDF8] border border-stone-200 justify-center items-center active:bg-stone-50">
        {icon}
      </View>
      <Text className="text-xs font-medium text-neutral-700 mt-1">{label}</Text>
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
      className="flex-row items-center bg-[#FFFDF8] rounded-2xl border border-stone-200 p-4 mb-3 active:bg-stone-50"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-xl bg-stone-100 justify-center items-center mr-3.5 border border-stone-200">
        {temple.imageUrl ? (
          <Image source={{ uri: temple.imageUrl }} className="w-12 h-12 rounded-xl" />
        ) : (
          <Ionicons name="business-outline" size={38} color="#9AA0A6" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-neutral-900 mb-0.5">{temple.name}</Text>
        <Text className="text-sm text-neutral-600 mb-1 font-normal">{temple.region}</Text>
        <View className="flex-row items-center">
          <FontAwesome name="star" size={14} color="#FF6B6B" style={{ marginRight: 2 }} />
          <Text className="text-xs text-neutral-900 ml-0.5 mr-2.5 font-medium">{temple.rating || '4.8'}</Text>
          <Text className="text-xs text-neutral-600 font-normal">
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
        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#FF6B6B' : '#9AA0A6'} />
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
      className={`rounded-2xl px-4 py-1.5 mr-2 border ${isSelected ? 'bg-sage-600 border-sage-600' : 'bg-white border-stone-200 active:bg-stone-50'}`}
      onPress={handlePress}
    >
      <Text className={`text-sm font-medium ${isSelected ? 'text-white font-semibold' : 'text-neutral-600'}`}>
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
  const { coords } = useLocationStore();
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

  const handleRegionSelect = useCallback((region: string) => { 
    setSelectedRegion(region); 
  }, []);

  const handleTemplePress = useCallback((templeId: string) => {
    try { navigation?.navigate('TempleStack', { screen: 'ReservationDetail', params: { templeId } }); } catch {}
  }, [navigation]);

  // One-Day 버튼 클릭 핸들러
  const handleOneDayPress = useCallback(() => {
    try { 
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
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  const bannerRef = React.useRef<FlatList>(null);
  const bannerImages = [
    require('../../../../assets/배너 1.jpg'),
    require('../../../../assets/배너 2.jpg'),
    require('../../../../assets/배너 3.jpg'),
  ];
  
  // 무한 스크롤을 위한 확장된 배열
  const extendedBannerImages = [...bannerImages, ...bannerImages, ...bannerImages];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const next = (prev + 1) % bannerImages.length;
        // 현재 스크롤 위치에서 오른쪽으로 한 칸씩 이동
        const nextScrollIndex = currentScrollPosition + 1;
        bannerRef.current?.scrollToIndex({ index: nextScrollIndex, animated: true });
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [bannerImages.length, currentScrollPosition]);
  
  // 배너 초기 위치 설정 (중앙에서 시작)
  useEffect(() => {
    if (bannerRef.current) {
      bannerRef.current.scrollToIndex({ 
        index: bannerImages.length, 
        animated: false 
      });
    }
  }, []);

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
              <View className="items-center">
                <Text className="text-[26px] font-extrabold text-[#616351]">TempleBuk</Text>
              </View>
            </View>

            {/* 검색바 */}
            <View className="mt-5 bg-[#FFFDF8] rounded-2xl px-4 py-2.5 border border-stone-200">
              <View className="flex-row items-center">
                <Ionicons name="search" size={18} color="#6B7280" />
                <TextInput
                  placeholder="사찰/지역 검색"
                  placeholderTextColor="#9AA0A6"
                  className="flex-1 ml-2 text-[15px]"
                  onSubmitEditing={() => {
                    try { navigation?.navigate('TempleStack', { screen: 'TempleList' }); } catch {}
                  }}
                  returnKeyType="search"
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
          contentContainerStyle={{ paddingTop: HEADER_H + 36, paddingBottom: 100, height: 1890 }}
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
              <View className="w-[360px] h-32 rounded-4xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative">
                <FlatList
                  ref={bannerRef}
                  data={extendedBannerImages}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={360}
                  decelerationRate={0.8}
                  contentContainerStyle={{ width: 360 * extendedBannerImages.length }}
                  keyExtractor={(_, index) => index.toString()}
                  getItemLayout={(data, index) => ({ length: 360, offset: 360 * index, index })}
                  onScroll={(e) => {
                    const offsetX = e.nativeEvent.contentOffset.x;
                    const index = Math.round(offsetX / 360);
                    const actualIndex = index % bannerImages.length;
                    setCurrentBannerIndex(actualIndex);
                    setCurrentScrollPosition(index);
                  }}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={(e) => {
                    const offsetX = e.nativeEvent.contentOffset.x;
                    const index = Math.round(offsetX / 360);
                    
                    // 경계에 도달했을 때 중앙으로 이동
                    if (index < bannerImages.length) {
                      bannerRef.current?.scrollToIndex({ 
                        index: index + bannerImages.length, 
                        animated: false 
                      });
                    } else if (index >= bannerImages.length * 2) {
                      bannerRef.current?.scrollToIndex({ 
                        index: index - bannerImages.length, 
                        animated: false 
                      });
                    }
                  }}
                  renderItem={({ item, index }) => (
                    <View style={{ width: 360, height: 128 }}>
                      <TouchableOpacity activeOpacity={0.9} onPress={() => handleBannerPress(index % bannerImages.length)}>
                        <Image source={item} style={{ width: 360, height: 128, left: 0}} resizeMode="cover" />
                        <View className="absolute bottom-6 left-0 right-0">
                          <View className="bg-black/30 px-3 py-0.5">
                            <Text className="text-white text-base font-bold ml-3">
                              {(index % bannerImages.length) === 0 ? "Join a Templestay in Gyeongbuk!" :
                               (index % bannerImages.length) === 1 ? "Browse Buddhist Souvenirs" :
                               "Explore comfortably with a tour taxi"}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                />
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
                  <Text className="text-3xl font-bold text-sage-600">Recommend Temple</Text>
                </View>
              </View>

              {/* Popular */}
                              <View className="-mt-0, -ml-2">
                <TouchableOpacity
                  className="w-[380px] h-32 rounded-tl-3xl rounded-tr-3xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative"
                  onPress={() => { try { navigation?.navigate('TempleStack', { screen: 'RecommendTemples', params: { boxType: 'popular' } }); } catch {} }}
                  activeOpacity={0.8}
                >
                  <Image source={require('../../../../assets/직지사.jpg')} className="w-full h-full" resizeMode="cover" />
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
                  <Image source={require('../../../../assets/당일.jpg')} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute bottom-2 left-2">
                                          <View className="bg-black/25 px-3 py-1 rounded-2xl">
                        <Text className="text-white text-lg font-bold">One-Day</Text>
                      </View>
                  </View>
                </TouchableOpacity>
              </View>





              {/* Top Places to Visit in Gyeongbuk */}
              <View className="mt-16 mb-4 ml-1">
                <Text className="text-2xl font-bold text-sage-600">Top Places to Visit in Gyeongbuk</Text>
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
                    <Text className="text-6xl font-bold text-sage-700" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>1</Text>
                  </View>
                  
                  {/* 2번 섹터 */}
                  <View className="absolute left-4" style={{ top: '26.5%' }}>
                    <Text className="text-6xl font-bold text-sage-700" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>2</Text>
                  </View>
                  
                  {/* 3번 섹터 */}
                  <View className="absolute left-4" style={{ top: '46.5%' }}>
                    <Text className="text-6xl font-bold text-sage-700" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>3</Text>
                  </View>
                  
                  {/* 4번 섹터 */}
                  <View className="absolute left-4" style={{ top: '66.5%' }}>
                    <Text className="text-6xl font-bold text-sage-700" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>4</Text>
                  </View>
                  
                  {/* 5번 섹터 */}
                  <View className="absolute left-4" style={{ top: '86.5%' }}>
                    <Text className="text-6xl font-bold text-sage-700" style={{ fontFamily: 'System', transform: [{ skewX: '-16deg' }] }}>5</Text>
                  </View>

                  {/* 장소명과 주소들 */}
                  {/* 1번 섹터 - Donggung Palace */}
                  <View className="absolute left-16" style={{ top: '6%' }}>
                    <Text className="text-lg font-semibold text-sage-700 mb-1">Donggung Palace and Wolji Pond</Text>
                    <Text className="text-sm text-sage-600">102 Wonhwa-ro, Gyeongju-si</Text>
                  </View>
                  
                  {/* 2번 섹터 - Bulguksa Temple */}
                  <View className="absolute left-16" style={{ top: '25%' }}>
                    <Text className="text-lg font-semibold text-sage-700 mb-1">Andong Hahoe Folk Village</Text>
                    <Text className="text-sm text-sage-600">186 Jeonseo-ro, Pungcheon-myeon,</Text>
                    <Text className="text-sm text-sage-600">Andong-si</Text>
                  </View>
                  
                  {/* 3번 섹터 - Seokguram Grotto */}
                  <View className="absolute left-16" style={{ top: '46%' }}>
                    <Text className="text-lg font-semibold text-sage-700 mb-1">Space Walk</Text>
                    <Text className="text-sm text-sage-600">30 Hwanhogongwon-gil, Buk-gu, Pohang-si</Text>
                  </View>
                  
                  {/* 4번 섹터 - Andong Hahoe Folk Village */}
                  <View className="absolute left-16" style={{ top: '65%' }}>
                    <Text className="text-lg font-semibold text-sage-700 mb-1">Homigot Sunrise Square</Text>
                    <Text className="text-sm text-sage-600">20 Haemaji-ro 150beon-gil, Homigot-myeon,</Text>
                    <Text className="text-sm text-sage-600">Nam-gu, Pohang-si</Text>
                 </View>
                  
                  {/* 5번 섹터 - Space Walk */}
                  <View className="absolute left-16" style={{ top: '86%' }}>
                    <Text className="text-lg font-semibold text-sage-700 mb-1">Bomun Lake</Text>
                    <Text className="text-sm text-sage-600">424-33 Bomun-ro, Gyeongju-si</Text>
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
                      source={require('../../../../assets/섹터1.jpg')}
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
                      source={require('../../../../assets/섹터2.jpg')}
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
                      source={require('../../../../assets/섹터3.jpg')}
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
                      source={require('../../../../assets/섹터4.jpg')}
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
                      source={require('../../../../assets/섹터5.jpg')}
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
                    <Text className="text-lg font-semibold text-sage-700">Start exploring nearby attractions!</Text>
                    <View className="flex-1" />
                    <Ionicons name="chevron-forward" size={20} color="#616351" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* 후기 박스 */}
              <View className="w-[360px] h-32 rounded-1xl bg-[#FFFDF8] border border-stone-200 overflow-hidden relative mb-4 ml-1 mt-24">
                <View className="w-full h-full bg-gradient-to-r from-orange-50 to-yellow-50 relative p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-bold text-orange-600">사용자 후기</Text>
                    <View className="flex-row items-center">
                      <Text className="text-sm text-orange-500 mr-1">4.8</Text>
                      <Ionicons name="star" size={16} color="#F59E0B" />
                    </View>
                  </View>
                  
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-orange-200 rounded-full items-center justify-center mr-3">
                        <Text className="text-sm font-bold text-orange-700">김</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-neutral-900">김민수님</Text>
                        <Text className="text-xs text-neutral-600">불국사 템플스테이 정말 좋았어요!</Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-yellow-200 rounded-full items-center justify-center mr-3">
                        <Text className="text-sm font-bold text-yellow-700">이</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-neutral-900">이영희님</Text>
                        <Text className="text-xs text-neutral-600">평화로운 시간을 보낼 수 있었습니다.</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {loading ? (
                <View className="flex-1 justify-center items-center py-10">
                  <LoadingSpinner />
                </View>
              ) : (
                <View className="space-y-3">{templeCards}</View>
              )}

              {/* 하단 정보/푸터 섹션 */}
              <View className="mt-8 -ml-6">
                <View className="w-[450px] bg-white py-6 px-2 rounded-1xl border border-stone-200">
                {/* 사업자 정보 */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-sm text-neutral-600">사업자정보</Text>
                  <Ionicons name="chevron-down" size={16} color="#6b7280" />
                </View>
                
                {/* 정책 링크들 */}
                <View className="space-y-2 mb-4">
                  <Text className="text-xs text-neutral-500">개인정보처리방침</Text>
                  <Text className="text-xs text-neutral-500">청소년보호정책</Text>
                  <Text className="text-xs text-neutral-500">서비스 이용약관</Text>
                  <Text className="text-xs text-neutral-500">위치정보 이용약관</Text>
                  <Text className="text-xs text-neutral-500">사업자 정보확인</Text>
                  <Text className="text-xs text-neutral-500">전자금융거래 이용약관</Text>
                  <Text className="text-xs text-neutral-500">전자금융거래 이용자 유의사항</Text>
                  <Text className="text-xs text-neutral-500">분쟁해결기준</Text>
                </View>
                
                {/* 법적 고지 */}
                <View className="mb-4">
                  <Text className="text-xs text-neutral-500 leading-4">
                    템플스테이는 통신판매중개자로서 통신판매의 당사자가 아니며, 상품의 예약, 이용 및 환불 등과 관련한 의무와 책임은 각 판매자에게 있습니다.
                  </Text>
                </View>
                
                {/* 콘텐츠산업 진흥법 표시 */}
                <View className="mb-4">
                  <Text className="text-xs text-neutral-500">콘텐츠산업 진흥법에 따른 표시</Text>
                </View>
                
                {/* 저작권 */}
                <View className="border-t border-stone-200 pt-6">
                  <Text className="text-xs text-neutral-400 text-center">© Templestay Co., Ltd. All rights reserved.</Text>
                </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
