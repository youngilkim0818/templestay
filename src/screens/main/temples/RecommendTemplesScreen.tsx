import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Card from '../../../components/common/Card';
import { Temple } from '../../../types';
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
        return [
          {
            id: '1',
            name: '불국사',
            region: '경주',
            address: '경상북도 경주시 불국로 385',
            imageUrl: require('../../../../assets/불국사.jpg'),
            latitude: 35.7895,
            longitude: 129.3321,
            basePrice: 80000,
            precautions: '유네스코 세계문화유산으로 지정된 곳이므로, 문화재 훼손에 각별히 유의해야 합니다.',
            description: '신라 시대 불교 예술의 정수를 보여주는 불국사는 다보탑, 석가탑 등 수많은 국보와 함께 찬란했던 불교 문화를 생생하게 느낄 수 있는 곳입니다.',
            availableTimes: ['09:00 - 10:30', '11:00 - 12:30', '14:00 - 15:30', '16:00 - 17:30'],
            programs: [],
            templestay: []
          },
          {
            id: '2',
            name: '골굴사',
            region: '경주',
            address: '경상북도 경주시 문무대왕면 기림로 101-5',
            imageUrl: require('../../../../assets/굴국사.jpg'),
            latitude: 35.7542,
            longitude: 129.4265,
            basePrice: 60000,
            precautions: '사진 촬영은 지정된 장소에서만 가능합니다.',
            description: '골굴사는 천년의 세월을 간직한 석굴과 자연이 어우러진, 명상과 수행의 고요함이 흐르는 산사입니다.',
            availableTimes: ['10:00 - 11:30', '13:00 - 14:30'],
            programs: [],
            templestay: []
          },
          {
            id: '3',
            name: '직지사',
            region: '김천',
            address: '경상북도 김천시 대항면 직지사길 95',
            imageUrl: require('../../../../assets/직지사.jpg'),
            latitude: 36.1047,
            longitude: 128.0817,
            basePrice: 70000,
            precautions: '바닷가에 위치하여 파도와 바람에 주의해야 합니다.',
            description: '직지사는 깊은 산속 울창한 숲과 함께, 오랜 전통과 불심이 살아 숨 쉬는 경북의 대표 사찰입니다.',
            availableTimes: ['09:30 - 11:00', '14:30 - 16:00'],
            programs: [],
            templestay: []
          }
        ];
      case 'region':
        return [
          {
            id: '4',
            name: '선본사',
            region: '안동',
            address: '경상북도 안동시 도산면 선본사길 1',
            imageUrl: require('../../../../assets/선본사.jpg'),
            latitude: 36.7498799,
            longitude: 128.2720622,
            basePrice: 65000,
            precautions: '산사는 수행의 공간입니다. 기본 예절을 잘 지켜주십시오.',
            description: '선본사는 안동의 대표적인 산사로, 깊은 산속에서 고즈넉한 불교 문화를 체험할 수 있습니다.',
            availableTimes: ['09:00 - 10:30', '14:00 - 15:30'],
            programs: [],
            templestay: []
          },
          {
            id: '5',
            name: '대승사',
            region: '문경',
            address: '경상북도 문경시 산북면 대승사길 283',
            imageUrl: require('../../../../assets/대승사.jpg'),
            latitude: 36.7498799,
            longitude: 128.2720622,
            basePrice: 70000,
            precautions: '사찰은 수행의 공간입니다. 사찰에서의 기본 예절을 잘 지켜주십시오.',
            description: '대승사는 깊은 산자락에 자리한 천년고찰로, 고즈넉한 산세와 불심이 깃든 전통이 어우러진 수행 도량입니다.',
            availableTimes: ['10:00 - 11:30', '13:00 - 14:30'],
            programs: [],
            templestay: []
          },
          {
            id: '6',
            name: '보경사',
            region: '포항',
            address: '경상북도 포항시 북구 송라면 보경로 523',
            imageUrl: require('../../../../assets/보경사.jpg'),
            latitude: 36.252279,
            longitude: 129.317949,
            basePrice: 65000,
            precautions: '동해바다를 바라보는 위치에 있어 바람이 강할 수 있습니다.',
            description: '기암과 폭포가 어우러진 내연산 자락에 자리한, 천년의 불심과 자연의 아름다움을 간직한 고찰입니다.',
            availableTimes: ['09:00 - 10:30', '14:00 - 15:30'],
            programs: [],
            templestay: []
          }
        ];
      case 'distance':
        return [
          {
            id: '7',
            name: '심원사',
            region: '경산',
            address: '경상북도 경산시 자인면 심원사길 123',
            imageUrl: require('../../../../assets/심원사.jpg'),
            latitude: 35.8234,
            longitude: 128.7389,
            basePrice: 55000,
            precautions: '도시 근교에 위치하여 접근이 용이합니다.',
            description: '심원사는 경산 지역의 대표 사찰로, 현대적인 도시와 전통의 조화를 느낄 수 있습니다.',
            availableTimes: ['09:00 - 10:30', '14:00 - 15:30'],
            programs: [],
            templestay: []
          },
          {
            id: '8',
            name: '감산사',
            region: '성주',
            address: '경상북도 성주군 수륜면 감산사길 456',
            imageUrl: require('../../../../assets/감산사.jpg'),
            latitude: 35.9123,
            longitude: 128.4567,
            basePrice: 60000,
            precautions: '농촌 지역에 위치하여 자연 친화적입니다.',
            description: '감산사는 성주 지역의 고찰로, 농촌의 평화로움과 불교 문화를 동시에 체험할 수 있습니다.',
            availableTimes: ['10:00 - 11:30', '13:00 - 14:30'],
            programs: [],
            templestay: []
          },
          {
            id: '11',
            name: '보경사',
            region: '포항',
            address: '경상북도 포항시 북구 송라면 보경사길 234',
            imageUrl: require('../../../../assets/보경사.jpg'),
            latitude: 36.1234,
            longitude: 129.3456,
            basePrice: 65000,
            precautions: '바다 근처에 위치하여 해풍에 주의해야 합니다.',
            description: '보경사는 포항의 동해를 바라보는 위치에 자리잡은 사찰로, 바다와 산이 어우러진 아름다운 경관을 제공합니다.',
            availableTimes: ['09:00 - 11:00', '13:00 - 15:00'],
            programs: [],
            templestay: []
          }
        ];
      case 'oneday':
        return [
          {
            id: '9',
            name: '감산사',
            region: '성주',
            address: '경상북도 성주군 수륜면 감산사길 456',
            imageUrl: require('../../../../assets/감산사.jpg'),
            latitude: 35.9123,
            longitude: 128.4567,
            basePrice: 60000,
            precautions: '당일형 프로그램을 제공합니다.',
            description: '감산사는 당일형 템플스테이 프로그램을 제공하여 바쁜 현대인들도 쉽게 체험할 수 있습니다.',
            availableTimes: ['09:00 - 17:00'],
            programs: [],
            templestay: []
          },
          {
            id: '10',
            name: '심원사',
            region: '경산',
            address: '경상북도 경산시 자인면 심원사길 123',
            imageUrl: require('../../../../assets/심원사.jpg'),
            latitude: 35.8234,
            longitude: 128.7389,
            basePrice: 55000,
            precautions: '당일형 프로그램을 제공합니다.',
            description: '심원사는 당일형 템플스테이 프로그램을 제공하여 짧은 시간에도 의미 있는 체험을 할 수 있습니다.',
            availableTimes: ['09:00 - 17:00'],
            programs: [],
            templestay: []
          }
        ];
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
          subtitle: '하루 만에 체험할 수 있는 템플스테이 프로그램을 추천합니다',
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
    if (selectedRegion && selectedRegion !== '') {
      filtered = filtered.filter(temple => temple.region === selectedRegion);
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
        // 인기 템플 3개 (불국사, 골굴사, 직지사)
        const popularTempleIds = ['1', '2', '3'];
        filtered = filtered.filter(temple => popularTempleIds.includes(temple.id));
      } else if (boxType === 'distance' && currentLocation) {
        // 거리별로 정렬하고 상위 3개 추천
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
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          .slice(0, 3);
      }
    }
    
    return filtered;
  }, [boxSpecificTemples, selectedRegion, selectedTemple, selectedProgram, searchQuery, boxType, currentLocation]);

  const handleTemplePress = useCallback((templeId: string) => {
    try {
      navigation?.navigate('TempleStack', { screen: 'ReservationDetail', params: { templeId } });
    } catch {}
  }, [navigation]);

  const renderTemple = useCallback(({ item }: { item: Temple }) => (
    <TouchableOpacity 
      className="active:opacity-80"
      onPress={() => handleTemplePress(item.id)}
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
                    placeholder="검색어를 입력하세요..."
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
                                     selectedRegion === '경주' ? 'Gyeongju' : 
                                     selectedRegion === '김천' ? 'Gimcheon' : 
                                     selectedRegion === '안동' ? 'Andong' : 
                                     selectedRegion === '문경' ? 'Mungyeong' : 
                                     selectedRegion === '포항' ? 'Pohang' : 
                                     selectedRegion === '경산' ? 'Gyeongsan' : 
                                     selectedRegion === '성주' ? 'Seongju' : 
                                     selectedRegion === '울산' ? 'Ulsan' : 
                                     selectedRegion === '대구' ? 'Daegu' : 
                                     selectedRegion === '부산' ? 'Busan' : 
                                     selectedRegion === '창원' ? 'Changwon' : 
                                     selectedRegion === '진주' ? 'Jinju' : 
                                     selectedRegion === '통영' ? 'Tongyeong' : 
                                     selectedRegion === '거제' ? 'Geoje' : selectedRegion}
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
                                    {selectedTemple === '불국사' ? 'Bulguksa' : 
                                     selectedTemple === '골굴사' ? 'Golgulsa' : 
                                     selectedTemple === '직지사' ? 'Jikjisa' : 
                                     selectedTemple === '선본사' ? 'Seonbongsa' : 
                                     selectedTemple === '대승사' ? 'Daeseungsa' : 
                                     selectedTemple === '보경사' ? 'Bogyungsa' : 
                                     selectedTemple === '심원사' ? 'Simwonsa' : 
                                     selectedTemple === '감산사' ? 'Gamsansa' : 
                                     selectedTemple || 'Temple'}
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
                                    {selectedProgram === '당일형' ? 'Daily' : 
                                     selectedProgram === '체험형' ? 'Experience' : 
                                     selectedProgram === '휴식형' ? 'Relaxation' : 
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
                                      {region === '경주' ? 'Gyeongju' : 
                                       region === '김천' ? 'Gimcheon' : 
                                       region === '안동' ? 'Andong' : 
                                       region === '문경' ? 'Mungyeong' : 
                                       region === '포항' ? 'Pohang' : 
                                       region === '경산' ? 'Gyeongsan' : 
                                       region === '성주' ? 'Seongju' : region}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                                
                                {/* 추가 지역 카테고리들 */}
                                <TouchableOpacity
                                  onPress={() => setSelectedRegion(selectedRegion === '울산' ? '' : '울산')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedRegion === '울산' ? 'bg-sage-600' : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === '울산' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Ulsan
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedRegion(selectedRegion === '대구' ? '' : '대구')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedRegion === '대구' ? 'bg-sage-600' : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === '대구' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Daegu
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedRegion(selectedRegion === '부산' ? '' : '부산')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedRegion === '부산' ? 'bg-sage-600' : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === '부산' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Busan
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedRegion(selectedRegion === '창원' ? '' : '창원')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedRegion === '창원' ? 'bg-sage-600' : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === '창원' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Changwon
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedRegion(selectedRegion === '진주' ? '' : '진주')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedRegion === '진주' ? 'bg-sage-600' : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === '진주' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Jinju
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedRegion(selectedRegion === '통영' ? '' : '통영')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedRegion === '울산' ? 'bg-sage-600' : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === '통영' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Tongyeong
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedRegion(selectedRegion === '거제' ? '' : '거제')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedRegion === '거제' ? 'bg-sage-600' : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedRegion === '거제' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Geoje
                                  </Text>
                                </TouchableOpacity>
                              </ScrollView>
                            </View>
                          )}
                        </View>

                        {/* 사찰 선택 드롭다운 - 고정 위치 */}
                        <View className="w-24 ml-5">
                          {showTempleSelector && (
                            <View className="max-h-36">
                              <ScrollView showsVerticalScrollIndicator={false}>
                                <TouchableOpacity
                                  onPress={() => setSelectedTemple(selectedTemple === '불국사' ? '' : '불국사')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedTemple === '불국사' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedTemple === '불국사' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Bulguksa
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedTemple(selectedTemple === '골굴사' ? '' : '골굴사')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedTemple === '골굴사' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedTemple === '골굴사' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Golgulsa
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedTemple(selectedTemple === '직지사' ? '' : '직지사')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedTemple === '직지사' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedTemple === '직지사' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Jikjisa
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedTemple(selectedTemple === '선본사' ? '' : '선본사')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedTemple === '선본사' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedTemple === '선본사' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Seonbongsa
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedTemple(selectedTemple === '대승사' ? '' : '대승사')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedTemple === '대승사' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedTemple === '대승사' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Daeseungsa
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedTemple(selectedTemple === '보경사' ? '' : '보경사')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedTemple === '보경사' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedTemple === '보경사' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Bogyungsa
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedTemple(selectedTemple === '심원사' ? '' : '심원사')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedTemple === '심원사' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedTemple === '심원사' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Simwonsa
                                  </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                  onPress={() => setSelectedTemple(selectedTemple === '감산사' ? '' : '감산사')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedTemple === '감산사' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedTemple === '감산사' ? 'text-white' : 'text-neutral-700'
                                  }`}>
                                    Gamsansa
                                  </Text>
                                </TouchableOpacity>
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
                                  onPress={() => setSelectedProgram(selectedProgram === '당일형' ? '' : '당일형')}
                                  className={`py-2 px-3 rounded-md mb-1 items-center justify-center ${
                                    selectedProgram === '당일형' 
                                      ? 'bg-sage-600' 
                                      : 'bg-stone-50'
                                  }`}
                                >
                                  <Text className={`text-sm font-medium text-center ${
                                    selectedProgram === '당일형' ? 'text-white' : 'text-neutral-700'
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
