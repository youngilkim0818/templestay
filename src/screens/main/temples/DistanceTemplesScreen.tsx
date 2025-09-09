import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../../components/common/Card';
import { TEMPLES_DATA } from '../../../data/temple-data';
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
const iconSize = isSmallScreen ? 16 : (isLargeScreen ? 22 : 20);
const buttonPadding = isSmallScreen ? 8 : (isLargeScreen ? 12 : 10);
const buttonFontSize = isSmallScreen ? 11 : (isLargeScreen ? 15 : 13);

const DistanceTemplesScreen = ({ navigation }: any) => {
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const { toggleFavorite, isFavorite } = useTempleStore();
  
  // 위치 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setUserLocation(location);
        } else {
          setLocationPermission(false);
          // Apple 가이드라인 5.1.1 준수: 재허용 유도 Alert 제거
          console.log('DistanceTemplesScreen: 위치 권한이 거부되어 기본 템플 목록을 거리순이 아닌 일반 순서로 표시합니다');
        }
      } catch (error) {
        console.error('위치 가져오기 실패:', error);
        setLocationPermission(false);
      }
    })();
  }, []);

  // 두 지점 간의 거리 계산 (Haversine 공식)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구의 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // 모든 사찰에 실제 거리 정보 추가 및 거리순 정렬
  const nearbyTemples = useMemo(() => {
    if (!userLocation) {
      return TEMPLES_DATA.map((temple, index) => ({
        ...temple,
        distance: null,
        distanceText: '위치 확인 중...',
        location: temple.region
      }));
    }

    return TEMPLES_DATA.map((temple) => {
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        temple.latitude,
        temple.longitude
      );
      
      return {
        ...temple,
        distance,
        distanceText: distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`,
        location: temple.region
      };
    }).sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }, [userLocation, calculateDistance]);

  // 선택된 지역에 따른 사찰 필터링
  const filteredTemples = useMemo(() => {
    if (selectedRegion === '전체') return nearbyTemples;
    return nearbyTemples.filter(temple => temple.location === selectedRegion);
  }, [selectedRegion, nearbyTemples]);

  const handleTemplePress = useCallback((templeId: string) => {
    try { 
      navigation?.navigate('ReservationDetail', { templeId }); 
    } catch {}
  }, [navigation]);

  const handleHeartToggle = useCallback((temple: any, e: any) => {
    e.stopPropagation();
    toggleFavorite(temple);
  }, [toggleFavorite]);

  const handleRegionPress = useCallback((region: string) => {
    setSelectedRegion(region);
  }, []);

  const renderTemple = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity 
      className="active:opacity-80"
      onPress={() => handleTemplePress(item.id)}
    >
      <Card variant="elevated" className="border border-stone-200" style={{ marginHorizontal: cardMargin, marginBottom: cardMargin }}>
        <View className="relative">
          <Image 
            source={item.imageUrl} 
            className="w-full rounded-xl"
            style={{ height: templeImageHeight, marginBottom: cardPadding }}
            resizeMode="cover"
          />
          {/* 하트 버튼 - 오른쪽 상단 */}
          <TouchableOpacity
            className="absolute top-2 right-2 bg-white/90 rounded-full items-center justify-center shadow-sm"
            style={{ width: iconSize + 8, height: iconSize + 8 }}
            onPress={(e) => handleHeartToggle(item, e)}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={iconSize} 
              color={isFavorite(item.id) ? "#EF4444" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
        <View style={{ padding: cardPadding }}>
          <View className="flex-row justify-between items-start mb-2">
            <Text 
              className="font-semibold text-neutral-900 flex-1"
              style={{ fontSize: templeTitleSize }}
            >
              {item.name}
            </Text>
            {item.distance !== null && (
              <View 
                className="bg-sage-100 rounded-full"
                style={{ paddingHorizontal: buttonPadding, paddingVertical: buttonPadding - 2 }}
              >
              <Text 
                className="font-medium text-sage-700"
                style={{ fontSize: templeDistanceSize }}
              >
                {item.distanceText}
              </Text>
            </View>
          )}
        </View>
        <Text 
          className="text-neutral-600"
          style={{ fontSize: templeDescSize }}
        >
          {item.region}
        </Text>
        {item.distance === null && (
          <Text 
            className="text-neutral-400 mt-1"
            style={{ fontSize: templeDistanceSize - 1 }}
          >
            위치 확인 중...
          </Text>
        )}
        </View>
      </Card>
    </TouchableOpacity>
  ), [handleTemplePress, handleHeartToggle, isFavorite]);

  const renderRegionButton = useCallback((region: string) => (
    <TouchableOpacity 
      key={region}
      className={`mx-2 rounded-2xl ${
        selectedRegion === region 
          ? 'bg-sage-600 active:bg-sage-700' 
          : 'bg-white border border-stone-200 active:bg-stone-50'
      }`}
      style={{ paddingHorizontal: buttonPadding * 2, paddingVertical: buttonPadding }}
      onPress={() => handleRegionPress(region)}
    >
      <Text 
        className={`text-center font-semibold ${
          selectedRegion === region ? 'text-white' : 'text-sage-600'
        }`}
        style={{ fontSize: buttonFontSize }}
      >
        {region}
      </Text>
    </TouchableOpacity>
  ), [selectedRegion, handleRegionPress]);

  const regionButtons = useMemo(() => 
    ['전체', ...Array.from(new Set(nearbyTemples.map(temple => temple.location)))].map(region => renderRegionButton(region)), 
    [nearbyTemples, renderRegionButton]
  );

  return (
    <View className="flex-1 bg-stone-100">
      {/* 위치 상태 표시 */}
      {!locationPermission && (
        <View className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <Text className="text-amber-800 text-center">
            📍 위치 권한이 필요합니다. 가까운 사찰을 찾기 위해 위치를 허용해주세요.
          </Text>
        </View>
      )}
      
      {locationPermission && !userLocation && (
        <View className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <Text className="text-blue-800 text-center">
            🔍 현재 위치를 확인하고 있습니다...
          </Text>
        </View>
      )}

      {/* Region Filter - ZEN-TECH Style */}
      <View className="bg-white">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="py-4 px-2"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {regionButtons}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTemples}
        renderItem={renderTemple}
        keyExtractor={(item) => item.id}
        className="flex-1"
        ListHeaderComponent={
          <View className="items-center my-6 mt-8">
            <Text 
              className="font-light text-neutral-900 text-center mb-2"
              style={{ fontSize: headerFontSize }}
            >
              가까운 사찰
            </Text>
            {userLocation && (
              <Text 
                className="text-neutral-600 text-center"
                style={{ fontSize: templeDescSize }}
              >
                📍 현재 위치 기준으로 정렬되었습니다
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center px-6 mt-20">
            <View className="bg-white rounded-2xl p-8 items-center">
              <Text 
                className="font-medium text-neutral-600 text-center mb-2"
                style={{ fontSize: templeTitleSize }}
              >
                등록된 사찰이 없습니다
              </Text>
              <Text 
                className="text-neutral-500 text-center"
                style={{ fontSize: templeDescSize }}
              >
                해당 지역에 등록된 사찰이 없습니다.
              </Text>
            </View>
          </View>
        }
        // 성능 최적화 옵션들
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 280, // 예상 아이템 높이 (카드 높이 증가로 조정)
          offset: 280 * index,
          index,
        })}
      />
    </View>
  );
};

export default DistanceTemplesScreen;


