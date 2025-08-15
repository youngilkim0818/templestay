import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Card from '../../../components/common/Card';
import { Temple } from '../../../types';
import { TEMPLES_DATA } from '../../../data/temple-data';
import * as Location from 'expo-location';

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
  
  // 박스 타입별 추천 사찰 목록
  const getBoxSpecificTemples = (type: string): Temple[] => {
    switch (type) {
      case 'popular':
        // 인기 사찰들: 불국사, 골굴사, 직지사, 대승사, 심원사
        return TEMPLES_DATA.filter(temple => 
          ['1', '2', '3', '5', '8'].includes(temple.id)
        );
      case 'region':
        // TEMPLES_DATA에서 지역별 사찰들을 필터링 (안동, 문경, 포항 지역)
        return TEMPLES_DATA.filter(temple => 
          ['안동', '문경', '포항'].includes(temple.region)
        );
      case 'distance':
        // 모든 사찰을 포함 (거리별로 정렬됨)
        return TEMPLES_DATA;
      case 'oneday':
        // 골굴사 제외하고 당일형 프로그램을 제공하는 사찰들을 필터링
        return TEMPLES_DATA.filter(temple => 
          temple.id !== '2' && // 골굴사 제외
          temple.templestay && temple.templestay.some(program => program.type === 'One-Day Type')
        );
      default:
        return [];
    }
  };

  const boxSpecificTemples = getBoxSpecificTemples(boxType);
  
  // 박스 타입별 제목과 설명
  const getBoxInfo = (type: string) => {
    switch (type) {
      case 'popular':
        return {
          title: '인기 사찰 추천',
          subtitle: '방문객들이 가장 많이 찾는 인기 사찰들을 추천합니다',
          color: '#FF6B6B'
        };
      case 'region':
        return {
          title: '지역별 사찰 추천',
          subtitle: '경북 지역의 대표적인 사찰들을 지역별로 추천합니다',
          color: '#4ECDC4'
        };
      case 'distance':
        return {
          title: '거리별 사찰 추천',
          subtitle: '현재 위치에서 가까운 사찰들을 추천합니다',
          color: '#45B7D1'
        };
      case 'oneday':
        return {
          title: '당일형 프로그램 추천',
          subtitle: 'We recommend temple stay programs that can be experienced in one day',
          color: '#96CEB4'
        };
      default:
        return {
          title: '사찰 추천',
          subtitle: '경북의 아름다운 사찰들을 추천합니다',
          color: '#616351'
        };
    }
  };

  const boxInfo = getBoxInfo(boxType);

  // 지역 이름을 영어로 변환하는 함수
  const getRegionDisplayName = (region: string): string => {
    switch (region) {
      case '경주': return 'Gyeongju';
      case '김천': return 'Gimcheon';
      case '문경': return 'Mungyeong';
      case '포항': return 'Pohang';
      case '경산': return 'Gyeongsan';
      case '성주': return 'Seongju';
      default: return region;
    }
  };

  // 사찰 이름을 영어로 변환하는 함수
  const getTempleDisplayName = (templeName: string): string => {
    switch (templeName) {
      case '불국사': return 'Bulguksa';
      case '골굴사': return 'Golgulsa';
      case '직지사': return 'Jikjisa';
      case '선본사': return 'Seonbongsa';
      case '대승사': return 'Daeseungsa';
      case '보경사': return 'Bogyungsa';
      case '심원사': return 'Simwonsa';
      case '감산사': return 'Gamsansa';
      default: return templeName;
    }
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
      console.log('위치 권한 요청 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 위치 권한 요청
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // 두 지점 간의 거리 계산 (Haversine 공식)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 검색어와 지역에 따른 사찰 필터링
  const filteredTemples = useMemo(() => {
    let filtered = boxSpecificTemples;
    
    // 지역 필터링
    if (selectedRegion && selectedRegion !== '' && selectedRegion !== 'all') {
      filtered = filtered.filter(temple => temple.region === selectedRegion);
    }
    
    // 사찰 필터링
    if (selectedTemple && selectedTemple !== '') {
      filtered = filtered.filter(temple => temple.name === selectedTemple);
    }
    
    // 프로그램 필터링
    if (selectedProgram && selectedProgram !== '') {
      filtered = filtered.filter(temple => 
        temple.templestay && temple.templestay.some(program => program.type === selectedProgram)
      );
    }
    
    // 검색어 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(temple => 
        temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        temple.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        temple.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 아무것도 선택하지 않았을 때 추천
    if (!selectedRegion && !selectedTemple && !selectedProgram && !searchQuery.trim()) {
      if (boxType === 'popular') {
        // 인기 템플 5개 모두 표시 (불국사, 골굴사, 직지사, 대승사, 심원사)
        filtered = filtered; // 이미 getBoxSpecificTemples에서 필터링됨
      } else if (boxType === 'oneday') {
        // oneday 타입일 때는 모든 사찰 표시 (필터링하지 않음)
        filtered = filtered;
      } else if (boxType === 'distance' && currentLocation) {
        // 거리별로 정렬하고 모든 사찰 표시
        filtered = filtered
          .map(temple => ({
            ...temple,
            distance: calculateDistance(
              currentLocation.coords.latitude,
              currentLocation.coords.longitude,
              temple.latitude,
              temple.longitude
            )
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    }
    
    return filtered;
  }, [boxSpecificTemples, selectedRegion, selectedTemple, selectedProgram, searchQuery, boxType, currentLocation]);

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

  const renderTemple = useCallback(({ item }: { item: Temple }) => (
    <TouchableOpacity 
      className="active:opacity-80"
      onPress={() => handleTemplePress(item)}
    >
      <Card variant="elevated" className="mx-4 mb-4">
        <Image
          source={item.imageUrl}
          className="w-full h-40 rounded-xl mb-4"
          resizeMode="cover"
        />
        <Text className="text-xl font-semibold text-neutral-900 mb-2">
          {item.name}
        </Text>
        <Text className="text-base text-neutral-600 mb-2">
          {item.region}
        </Text>
        <Text className="text-sm text-neutral-700 mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <FontAwesome name="star" size={14} color="#FF6B6B" style={{ marginRight: 4 }} />
            <Text className="text-sm text-neutral-900 font-medium">4.8</Text>
            {boxType === 'distance' && (item as any).distance && (
              <Text className="text-sm text-neutral-500 ml-2">
                • {(item as any).distance.toFixed(1)}km
              </Text>
            )}
          </View>
          <Text className="text-sm text-sage-600 font-semibold">₩{item.basePrice?.toLocaleString()}</Text>
        </View>
        {boxType === 'distance' && (item as any).distance && (
          <View className="mt-2">
            <Text className="text-xs text-neutral-500 text-right">
              현재 위치에서 {(item as any).distance.toFixed(1)}km
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  ), [handleTemplePress]);

  return (
    <View className="flex-1 bg-white">
      {/* 헤더와 검색창/옵션박스 영역에만 배경 이미지 적용 */}
      <View className="relative h-80">
        {/* 배경 이미지 */}
        <Image 
          source={require('../../../../assets/레코멘드1.jpg')}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
        {/* 배경 이미지 위의 오버레이 */}
        <View className="bg-black/20 absolute inset-0" />
        
        {/* 헤더와 검색창/옵션박스 내용 */}
        <View className="relative z-10">
                                 {/* 헤더 */}
            <View className="px-4 py-20">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="mr-4 p-2"
                >
                  <Ionicons name="arrow-back" size={24} color="#616351" />
                </TouchableOpacity>
                                 <View className="-ml-16 mt-4">
                   <Text className="text-2xl font-bold text-white">A peaceful retreat in harmony with nature,</Text>
                   <Text className="text-xl font-medium text-white mt-1">embark on a journey with a Templestay.</Text>
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
                    >
                      <Ionicons name="close-circle" size={20} color="#9AA0A6" />
                    </TouchableOpacity>
                  )}
                  
                  {/* 옵션박스 토글 버튼 */}
                  <TouchableOpacity
                    onPress={() => setShowOptionsBox(!showOptionsBox)}
                    className="ml-2 p-1"
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
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === 'all' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    All
                                  </Text>
                                </TouchableOpacity>
                                
                                {Array.from(new Set(boxSpecificTemples.map(temple => temple.region))).map((region) => (
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
                                >
                                                                      <Text className={`text-sm font-medium text-center ${
                                      selectedProgram === 'One-Day Type' ? 'text-white' : 'text-neutral-700'
                                    }`}>
                                    Daily
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedProgram(selectedProgram === '체험형' ? '' : '체험형')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedProgram === '체험형' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedProgram === '체험형' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Experience
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedProgram(selectedProgram === '휴식형' ? '' : '휴식형')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedProgram === '휴식형' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedProgram === '휴식형' ? 'text-white' : 'text-neutral-700'
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
      
            {/* 추천 안내 */}
      {!selectedRegion && !selectedTemple && !selectedProgram && !searchQuery.trim() && (
        <View className="px-4 py-6 bg-white">
          <Text className="text-2xl font-bold text-neutral-900 mb-2 text-left">
            {boxType === 'popular' ? 'Popular Temple Picks' : 
             boxType === 'distance' ? 'Nearest Temples' : 
             boxType === 'region' ? 'Regional Temple Picks' : 
             boxType === 'oneday' ? 'One-Day Templestay Programs' : 'Temple Recommendations'}
          </Text>
          <Text className="text-base text-neutral-600 text-left">
            {boxType === 'popular' ? 'Most Popular Temple' :
             boxType === 'distance' ? 'Temples Near You!' :
             boxType === 'region' ? '경북 지역의 대표적인 사찰들을 지역별로 추천합니다' :
             boxType === 'oneday' ? 'Experience a Relaxing One-Day Templestay' :
             '경북의 아름다운 사찰들을 추천합니다'}
          </Text>
        </View>
      )}
      
      {/* 템플 리스트는 기존 베이지 배경 유지 */}
      {filteredTemples.length > 0 && (
        <FlatList
          data={filteredTemples}
          renderItem={renderTemple}
          keyExtractor={(item) => item.id}
          className="flex-1"
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
