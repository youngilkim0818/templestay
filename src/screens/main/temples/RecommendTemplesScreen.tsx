import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Card from '../../../components/common/Card';
import { Temple } from '../../../types';
import { TEMPLES_DATA } from '../../../data/temple-data';
import * as Location from 'expo-location';
import useTempleStore from '../../../store/templeStore';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isLargeScreen = height > 800;

// Responsive sizes
const headerFontSize = isSmallScreen ? 18 : (isLargeScreen ? 24 : 20);
const subHeaderFontSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const cardPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
const cardMargin = isSmallScreen ? 4 : (isLargeScreen ? 8 : 6);
const templeImageHeight = isSmallScreen ? 120 : (isLargeScreen ? 180 : 150);
const templeTitleSize = isSmallScreen ? 14 : (isLargeScreen ? 18 : 16);
const templeDescSize = isSmallScreen ? 11 : (isLargeScreen ? 15 : 13);
const templeDistanceSize = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
const sectionPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
const searchFontSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const searchPadding = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
const iconSize = isSmallScreen ? 16 : (isLargeScreen ? 22 : 20);
const buttonPadding = isSmallScreen ? 8 : (isLargeScreen ? 12 : 10);
const buttonFontSize = isSmallScreen ? 11 : (isLargeScreen ? 15 : 13);

interface RecommendTemplesScreenProps {
  navigation: any;
  route: {
    params: {
      boxType: 'popular' | 'region' | 'distance' | 'oneday';
    };
  };
}

const RecommendTemplesScreen = ({ navigation, route }: RecommendTemplesScreenProps) => {
  const { boxType } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [showTempleSelector, setShowTempleSelector] = useState(false);
  const [showProgramSelector, setShowProgramSelector] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showOptionsBox, setShowOptionsBox] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const { toggleFavorite, isFavorite } = useTempleStore();

  // 박스 타입별 제목과 설명
  const getBoxInfo = (type: string) => {
    switch (type) {
      case 'popular':
        return { title: '인기 사찰 추천', color: '#FF6B6B' };
      case 'region':
        return { title: '지역별 사찰 추천', color: '#4ECDC4' };
      case 'distance':
        return { title: '거리별 사찰 추천', color: '#45B7D1' };
      case 'oneday':
        return { title: '당일형 프로그램 추천', color: '#96CEB4' };
      default:
        return { title: '사찰 추천', color: '#616351' };
    }
  };

  const boxInfo = getBoxInfo(boxType);

  // 지역 이름을 영어로 변환하는 함수
  const getRegionDisplayName = (region: string): string => {
    const regionMap: { [key: string]: string } = {
      '경주': 'Gyeongju', '김천': 'Gimcheon', '문경': 'Mungyeong',
      '포항': 'Pohang', '경산': 'Gyeongsan', '성주': 'Seongju',
    };
    return regionMap[region] || region;
  };

  // 사찰 이름을 영어로 변환하는 함수 (Temple 단어 제거)
  const getTempleDisplayName = (templeName: string): string => {
    const cleanName = templeName.replace(/Temple/g, '').trim();
    const templeMap: { [key: string]: string } = {
      '불국사': 'Bulguksa', '골굴사': 'Golgulsa', '직지사': 'Jikjisa',
      '선본사': 'Seonbonsa', '대승사': 'Daeseungsa', '보경사': 'Bogyungsa',
      '심원사': 'Simwonsa', '감산사': 'Gamsansa',
    };
    return templeMap[cleanName] || cleanName;
  };

  // 위치 권한 요청 및 현재 위치 가져오기
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      }
    } catch (error) {
      if (__DEV__) {
        console.log('위치 권한 요청 실패:', error);
      }
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // 두 지점 간의 거리 계산 (Haversine 공식)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 검색어와 지역에 따른 사찰 필터링 및 정렬
  const filteredTemples = useMemo(() => {
    let temples: Temple[] = [...TEMPLES_DATA];

    // 1. boxType에 따른 기본 필터링 및 정렬
    switch (boxType) {
      case 'popular':
        const popularIds = ['1', '2', '3', '5', '8'];
        temples = temples.filter(t => popularIds.includes(t.id));
        break;
      case 'oneday':
        temples = temples.filter(temple =>
          temple.id !== '2' && // 골굴사 제외
          temple.templestay?.some(program => program.type === 'One-Day Type')
        );
        break;
      case 'distance':
        if (currentLocation) {
          temples = temples
            .map(temple => ({
              ...temple,
              distance: calculateDistance(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude,
                temple.latitude,
                temple.longitude
              ),
            }))
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        break;
      case 'region':
         // 특별한 기본 필터 없음, 전체 목록 사용
        break;
    }

    // 2. 사용자가 선택한 UI 필터 적용
    if (selectedRegion && selectedRegion !== 'all') {
      temples = temples.filter(temple => temple.region === selectedRegion);
    }
    if (selectedTemple) {
      temples = temples.filter(temple => temple.name === selectedTemple);
    }
    if (selectedProgram) {
      temples = temples.filter(temple =>
        temple.templestay?.some(p => p.type === selectedProgram)
      );
    }
    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      temples = temples.filter(
        temple =>
          temple.name.toLowerCase().includes(lowercasedQuery) ||
          temple.region.toLowerCase().includes(lowercasedQuery) ||
          temple.description.toLowerCase().includes(lowercasedQuery)
      );
    }

    return temples;
  }, [boxType, currentLocation, selectedRegion, selectedTemple, selectedProgram, searchQuery]);

  const handleTemplePress = useCallback((temple: Temple) => {
    try {
      // 사찰 전체 데이터를 params로 전달
      navigation?.navigate('TempleStack', { 
        screen: 'ReservationDetail', 
        params: { 
          templeId: temple.id,
          templeData: temple // 전체 사찰 데이터 전달
        } 
      });
    } catch {}
  }, [navigation]);

  const handleHeartToggle = useCallback((temple: Temple, e: any) => {
    e.stopPropagation();
    toggleFavorite(temple);
  }, [toggleFavorite]);

  const renderTemple = useCallback(({ item }: { item: Temple }) => (
    <TouchableOpacity 
      className="active:opacity-80"
      onPress={() => handleTemplePress(item)}
      activeOpacity={1}
    >
      <Card variant="elevated" className="mx-4 mb-4 border border-stone-200">
        <View className="relative">
          <Image
            source={item.imageUrl}
            className="w-full h-40 rounded-xl mb-4"
            resizeMode="cover"
          />
          {/* 하트 버튼 - 오른쪽 상단 */}
          <TouchableOpacity
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full items-center justify-center shadow-sm"
            onPress={(e) => handleHeartToggle(item, e)}
            activeOpacity={1}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite(item.id) ? "#EF4444" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
        <Text className="text-xl font-semibold text-neutral-900 mb-2">
          {getTempleDisplayName(item.name)}
        </Text>
        <Text className="text-base text-neutral-600 mb-2">
          {item.region}
        </Text>
        <Text className="text-sm text-neutral-700 mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row items-center">
          <FontAwesome name="star" size={14} color="#FF6B6B" style={{ marginRight: 4 }} />
          <Text className="text-sm text-neutral-900 font-medium">4.8</Text>
          {boxType === 'distance' && (item as any).distance && (
            <Text className="text-sm text-neutral-500 ml-2">
              • {(item as any).distance.toFixed(1)}km
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  ), [handleTemplePress, handleHeartToggle, isFavorite, boxType]);

  return (
    <View className="flex-1 bg-white">
      {/* 헤더와 검색창/옵션박스 영역에만 배경 이미지 적용 */}
      <View className="relative h-80">
        {/* 배경 이미지 */}
        <Image 
          source={require('../../../../assets/recommend-1.jpg')}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
        
        {/* 헤더와 검색창/옵션박스 내용 */}
        <View className="relative z-10">
                                 {/* 헤더 */}
            <View className="px-4 py-20">
              <View className="flex-row items-center">
                                 <View className="mt-4">
                   <Text 
                     className="font-bold text-white"
                     style={{ fontSize: headerFontSize }}
                   >
                     {boxType === 'popular' ? 'Popular Temple Picks' : 
                      boxType === 'distance' ? 'Nearest Temples' : 
                      boxType === 'region' ? 'Regional Temple Picks' : 
                      boxType === 'oneday' ? 'One-Day Programs' : ''}
                   </Text>
                   <Text 
                     className="font-medium text-white mt-1"
                     style={{ fontSize: subHeaderFontSize }}
                   >
                     {boxType === 'popular' ? 'Most Popular Temple' :
                      boxType === 'distance' ? 'Temples Near You!' :
                      boxType === 'region' ? 'Representative temples in Gyeongbuk region by area' :
                      boxType === 'oneday' ? 'Enjoy a day of experience, hassle-free' :
                      ''}
                   </Text>
                 </View>
              </View>
            </View>

                       {/* 검색창과 옵션박스 내용 */}
            <View className="relative z-10 -mt-8">
                           {/* 검색창 */}
              <View className="px-4 pb-0">
                <View className={`bg-white/90 px-4 py-3 ${showOptionsBox ? 'rounded-t-3xl' : 'rounded-3xl'}`}>
                <View className="flex-row items-center">
                  <Ionicons name="search" size={20} color="#6B7280" />
                  <TextInput
                    placeholder="Please enter search terms"
                    placeholderTextColor="#9AA0A6"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-base text-neutral-900"
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      className="ml-2 p-1"
                      activeOpacity={1}
                    >
                      <Ionicons name="close-circle" size={20} color="#9AA0A6" />
                    </TouchableOpacity>
                  )}
                  
                  {/* 옵션박스 토글 버튼 */}
                  <TouchableOpacity
                    onPress={() => setShowOptionsBox(!showOptionsBox)}
                    className="ml-2 p-1"
                    activeOpacity={1}
                  >
                    <Ionicons 
                      name={showOptionsBox ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 접혀있을 때 여백 */}
            {!showOptionsBox && <View className="h-8" />}

                        {/* 통합 필터 바 */}
            {showOptionsBox && (
              <View className="px-4 pt-0 mb-20">
                {/* 검색창과 옵션박스 사이 구분선 */}
                <View className="w-full h-px bg-gray-200" />
                <View className="bg-white/90 rounded-b-3xl px-3 py-3">
                                                <View className="flex-row items-center justify-between">
                                {/* 지역선택 */}
                                <TouchableOpacity
                                  onPress={() => setShowRegionSelector(!showRegionSelector)}
                                  className="flex-row items-center w-20"
                                  activeOpacity={1}
                                >
                                  <Text className="ml-3 text-sm font-medium text-neutral-900 flex-1" numberOfLines={1}>
                                    {selectedRegion === '' ? 'Region' : 
                                     selectedRegion === 'all' ? 'All' : 
                                     getRegionDisplayName(selectedRegion)}
                                  </Text>
                                  <Ionicons 
                                    name={showRegionSelector ? "chevron-up" : "chevron-down"} 
                                    size={16} 
                                    color="#616351" 
                                    className="ml-1"
                                  />
                                </TouchableOpacity>

                                {/* 구분선 */}
                                <View className="w-px h-6 bg-gray-300" />

                                {/* 사찰선택 */}
                                <TouchableOpacity 
                                  onPress={() => setShowTempleSelector(!showTempleSelector)}
                                  className="flex-row items-center w-20"
                                  activeOpacity={1}
                                >
                                  <Text className="ml-2 text-sm font-medium text-neutral-900 flex-1" numberOfLines={1}>
                                    {selectedTemple ? getTempleDisplayName(selectedTemple) : 'Temple'}
                                  </Text>
                                  <Ionicons 
                                    name={showTempleSelector ? "chevron-up" : "chevron-down"} 
                                    size={16} 
                                    color="#616351" 
                                    className="ml-1" 
                                  />
                                </TouchableOpacity>

                                {/* 구분선 */}
                                <View className="w-px h-6 bg-gray-300" />

                                {/* 프로그램 선택 */}
                                <TouchableOpacity 
                                  onPress={() => setShowProgramSelector(!showProgramSelector)}
                                  className="flex-row items-center w-20"
                                  activeOpacity={1}
                                >
                                  <Text className="ml-2 text-sm font-medium text-neutral-900 flex-1" numberOfLines={1}>
                                    {selectedProgram === 'One-Day Type' ? 'Daily' : 
                                     selectedProgram === 'Experience Type' ? 'Experience' : 
                                     selectedProgram === 'Relaxation Type' ? 'Relaxation' : 
                                     selectedProgram || 'Program'}
                                  </Text>
                                  <Ionicons 
                                    name={showProgramSelector ? "chevron-up" : "chevron-down"} 
                                    size={16} 
                                    color="#616351" 
                                    className="ml-1" 
                                  />
                                </TouchableOpacity>

                                {/* 구분선 */}
                                <View className="w-px h-6 bg-gray-300" />

                                            {/* 되돌리기 버튼 */}
                                <TouchableOpacity 
                                  onPress={() => {
                                    setSearchQuery('');
                                    setSelectedRegion('');
                                    setSelectedTemple('');
                                    setSelectedProgram('');
                                    setShowRegionSelector(false);
                                    setShowTempleSelector(false);
                                    setShowProgramSelector(false);
                                  }}
                                  className="p-1"
                                  activeOpacity={1}
                                >
                                  <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
                                    <Ionicons name="refresh" size={16} color="#6B7280" />
                                  </View>
                                </TouchableOpacity>


                              </View>

                  {/* 드롭다운 영역 */}
                  {(showRegionSelector || showTempleSelector || showProgramSelector) && (
                    <View className="mt-2 pt-4 border-t border-gray-200">
                      <View className="flex-row">
                                                  {/* 지역 선택 드롭다운 - 고정 위치 */}
                          <View className="w-24">
                          {showRegionSelector && (
                            <View className="max-h-36">
                              <ScrollView showsVerticalScrollIndicator={false}>
                                <TouchableOpacity
                                  onPress={() => {
                                    setSelectedRegion(selectedRegion === 'all' ? '' : 'all');
                                  }}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedRegion === 'all' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                  activeOpacity={1}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === 'all' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    All
                                  </Text>
                                </TouchableOpacity>
                                
                                {Array.from(new Set(TEMPLES_DATA.map(temple => temple.region))).map((region) => (
                                  <TouchableOpacity
                                    key={region}
                                    onPress={() => {
                                      setSelectedRegion(selectedRegion === region ? '' : region);
                                    }}
                                    className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                      selectedRegion === region 
                                        ? 'bg-sage-600' 
                                        : 'bg-stone-50'
                                    }`}
                                    activeOpacity={1}
                                  >
                                    <Text className={`text-sm font-medium text-center ${
                                      selectedRegion === region ? 'text-white' : 'text-neutral-700'
                                    }`}>
                                      {getRegionDisplayName(region)}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>

                        {/* 사찰 선택 드롭다운 - 고정 위치 */}
                        <View className="w-24 ml-5">
                          {showTempleSelector && (
                            <View className="max-h-36">
                              <ScrollView showsVerticalScrollIndicator={false}>
                                {/* 현재 필터링된 사찰들만 표시 */}
                                {filteredTemples.map((temple) => (
                                  <TouchableOpacity
                                    key={temple.id}
                                    onPress={() => setSelectedTemple(selectedTemple === temple.name ? '' : temple.name)}
                                    className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                      selectedTemple === temple.name 
                                        ? 'bg-sage-600' 
                                        : 'bg-stone-50'
                                    }`}
                                    activeOpacity={1}
                                  >
                                    <Text className={`text-sm font-medium text-center ${
                                      selectedTemple === temple.name ? 'text-white' : 'text-neutral-700'
                                    }`}>
                                      {getTempleDisplayName(temple.name)}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </ScrollView>
                            </View>
                          )}
                        </View>

                        {/* 프로그램 선택 드롭다운 - 고정 위치 */}
                        <View className="w-24 ml-7">
                          {showProgramSelector && (
                            <View className="max-h-36">
                              <ScrollView showsVerticalScrollIndicator={false}>
                                <TouchableOpacity
                                  onPress={() => setSelectedProgram(selectedProgram === 'One-Day Type' ? '' : 'One-Day Type')}
                                                                      className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                      selectedProgram === 'One-Day Type' 
                                        ? 'bg-sage-600' 
                                        : 'bg-stone-50'
                                    }`}
                                  activeOpacity={1}
                                >
                                                                      <Text className={`text-sm font-medium text-center ${
                                      selectedProgram === 'One-Day Type' ? 'text-white' : 'text-neutral-700'
                                    }`}>
                                    Daily
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedProgram(selectedProgram === 'Experience Type' ? '' : 'Experience Type')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedProgram === 'Experience Type' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                  activeOpacity={1}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedProgram === 'Experience Type' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Experience
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedProgram(selectedProgram === 'Relaxation Type' ? '' : 'Relaxation Type')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedProgram === 'Relaxation Type' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                  activeOpacity={1}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedProgram === 'Relaxation Type' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Relaxation
                                  </Text>
                                </TouchableOpacity>
                              </ScrollView>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* 템플 리스트는 기존 베이지 배경 유지 */}
      {filteredTemples.length > 0 && (
        <FlatList
          data={filteredTemples}
          renderItem={renderTemple}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ paddingTop: 20 }}
          ListFooterComponent={
            <View className="px-4 pb-6 mt-6">
              {/* 여기에 추가 콘텐츠를 넣을 수 있습니다 */}
            </View>
          }
          // 성능 최적화 옵션들
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 320, // 예상 아이템 높이 (카드 높이 증가로 조정)
            offset: 320 * index,
            index,
          })}
        />
      )}
    </View>
  );
};

export default RecommendTemplesScreen;
