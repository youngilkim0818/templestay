import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../../components/common/Card';
import { TEMPLES_DATA } from '../../../data/temple-data';
import useTempleStore from '../../../store/templeStore';

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
          Alert.alert(
            '위치 권한 필요',
            '가까운 사찰을 찾기 위해 위치 권한이 필요합니다.',
            [{ text: '확인' }]
          );
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
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite(item.id) ? "#EF4444" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-xl font-semibold text-neutral-900 flex-1">
            {item.name}
          </Text>
          {item.distance !== null && (
            <View className="bg-sage-100 px-3 py-1 rounded-full">
              <Text className="text-sm font-medium text-sage-700">
                {item.distanceText}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-base text-neutral-600">
          {item.region}
        </Text>
        {item.distance === null && (
          <Text className="text-sm text-neutral-400 mt-1">
            위치 확인 중...
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  ), [handleTemplePress, handleHeartToggle, isFavorite]);

  const renderRegionButton = useCallback((region: string) => (
    <TouchableOpacity 
      key={region}
      className={`px-6 py-3 mx-2 rounded-2xl ${
        selectedRegion === region 
          ? 'bg-sage-600 active:bg-sage-700' 
          : 'bg-white border border-stone-200 active:bg-stone-50'
      }`}
      onPress={() => handleRegionPress(region)}
    >
      <Text className={`text-center font-semibold ${
        selectedRegion === region ? 'text-white' : 'text-sage-600'
      }`}>
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
            <Text className="text-3xl font-light text-neutral-900 text-center mb-2">
              가까운 사찰
            </Text>
            {userLocation && (
              <Text className="text-base text-neutral-600 text-center">
                📍 현재 위치 기준으로 정렬되었습니다
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center px-6 mt-20">
            <View className="bg-white rounded-2xl p-8 items-center">
              <Text className="text-xl font-medium text-neutral-600 text-center mb-2">
                등록된 사찰이 없습니다
              </Text>
              <Text className="text-base text-neutral-500 text-center">
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


