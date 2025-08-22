import React, { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, TextInput, TouchableOpacity, Keyboard, Animated, PanResponder, FlatList, Text, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Temple } from '../../types';
import { COLORS } from '../../constants/colors';
import { TEMPLES_DATA, getAllTemplesWithImages } from '../../data/temple-data';
import { TourApiService, calculateDistanceFromApi, formatApiDistance, TourAttraction } from '../../services/tourApiService';
import { enrichAttractionWithImage } from '../../services/attractionImageService';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 48, 360);
const CARD_GAP = 16; // mx-2 좌우(8px+8px)

// 허브(LocgoHubTarService1) 지역 코드 매핑 (도/광역시 코드)
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

const normalizeAdministrativeArea = (name?: string): string => {
  if (!name) return '';
  // 예: '경상북도' -> '경북', '강원특별자치도' -> '강원'
  return name
    .replace('특별자치도', '')
    .replace('광역시', '')
    .replace('특별시', '')
    .replace('자치시', '')
    .replace('도', '')
    .slice(0, 2); // '경북', '경남', '강원' 등 2~2자
};

const getHubAreaCdFromGeo = (adminArea?: string): number | undefined => {
  const key = normalizeAdministrativeArea(adminArea);
  return REGION_TO_HUB_AREA[key];
};

// Haversine formula for distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  if (distanceKm < 10) return `${Math.round(distanceKm * 10) / 10}km`;
  return `${Math.round(distanceKm)}km`;
};

// Get nearby temples sorted by distance
const getNearbyTemples = (userLocation: Location.LocationObjectCoords | null, templesData: Temple[]) => {
  if (!userLocation) {
    return templesData.slice(0, 5).map(temple => ({
      id: temple.id,
      title: temple.name,
      desc: temple.description.substring(0, 40) + '...',
      distance: 'Unknown',
      distanceKm: 999,
      imageUrl: temple.imageUrl,
      programs: temple.programs ? [...new Set(temple.programs.map(p => p.type))].slice(0, 3) : ['Templestay'],
      rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
    }));
  }

  return templesData
    .filter(temple => temple.latitude && temple.longitude)
    .map(temple => ({
      id: temple.id,
      title: temple.name,
      desc: temple.description.substring(0, 40) + '...',
      distance: formatDistance(calculateDistance(userLocation.latitude, userLocation.longitude, temple.latitude!, temple.longitude!)),
      distanceKm: calculateDistance(userLocation.latitude, userLocation.longitude, temple.latitude!, temple.longitude!),
      imageUrl: temple.imageUrl,
      programs: temple.programs ? [...new Set(temple.programs.map(p => p.type))].slice(0, 3) : ['Templestay'],
      rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);
};

export default function MapScreen({ navigation, route }: any) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchMarker, setSearchMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [nearbyTemples, setNearbyTemples] = useState<any[]>([]);
  const [showAttractions, setShowAttractions] = useState(false);
  const [nearbyAttractions, setNearbyAttractions] = useState<any[]>([]);
  const [loadingAttractions, setLoadingAttractions] = useState(false);
  const mapRef = useRef<MapView>(null);
  const imageCacheRef = useRef<Record<string, string>>({});
  const templeListRef = useRef<FlatList<any>>(null);
  const attractionsListRef = useRef<FlatList<any>>(null);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      if (__DEV__) {
        console.log('📍 Requesting location permissions...');
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (__DEV__) {
          console.log('⚠️ Location permission denied');
        }
        setLoading(false);
        return;
      }

      try {
        if (__DEV__) {
          console.log('📍 Getting current location...');
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (__DEV__) {
          console.log('✅ Location obtained:', loc.coords);
        }
        setLocation(loc.coords);
      } catch (error) {
        if (__DEV__) {
          console.log('⚠️ Could not get location', error);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Top Places에서 전달받은 주소로 맵에 마커 표시
  useEffect(() => {
    if (route.params?.address) {
      if (__DEV__) {
        console.log('📍 Setting marker from Top Places address:', route.params.address);
      }
      
      // 주소를 좌표로 변환
      (async () => {
        try {
          const geocodeResult = await Location.geocodeAsync(route.params.address);
          if (geocodeResult && geocodeResult.length > 0) {
            const coords = geocodeResult[0];
            if (__DEV__) {
              console.log('✅ Geocoded coordinates:', coords);
            }
            
            // 검색 마커 설정
            setSearchMarker({
              latitude: coords.latitude,
              longitude: coords.longitude
            });
            
            // 맵을 해당 위치로 이동
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              });
            }
          }
        } catch (error) {
          if (__DEV__) {
            console.log('⚠️ Failed to geocode address:', error);
          }
        }
      })();
    }
  }, [route.params?.address]);

  useEffect(() => {
    (async () => {
      try {
        if (__DEV__) {
          console.log('🏯 Loading temple data with images...');
        }
        const templesWithImages = await getAllTemplesWithImages();
        setTemples(templesWithImages.length > 0 ? templesWithImages : TEMPLES_DATA);
      } catch (error) {
        console.error('❌ Failed to load temple data:', error);
        setTemples(TEMPLES_DATA);
      }
    })();
  }, []);

  // 기준 좌표(검색 마커가 있으면 우선, 없으면 현재 위치)
  const getAnchorCoords = useCallback(() => {
    if (searchMarker) return { latitude: searchMarker.latitude, longitude: searchMarker.longitude } as any;
    if (location) return { latitude: location.latitude, longitude: location.longitude } as any;
    return null;
  }, [searchMarker, location]);

  // Update nearby temples when anchor or temple data changes
  useEffect(() => {
    if (temples.length === 0) return;
    const anchor = getAnchorCoords();
    const updatedNearbyTemples = getNearbyTemples(anchor, temples);
    setNearbyTemples(updatedNearbyTemples);
    if (__DEV__) {
      console.log('📍 Updated nearby temples (anchor):', updatedNearbyTemples.map(t => `${t.title}: ${t.distance}`));
    }
  }, [getAnchorCoords, temples]);

  // 관광지 로딩 함수 (검색 기준 좌표가 있으면 그것으로)
  const loadNearbyAttractions = useCallback(async (coords?: { latitude: number; longitude: number }) => {
    const base = coords || getAnchorCoords();
    if (!base) return;
    try {
      setLoadingAttractions(true);
      // 1) 기준 좌표의 행정구역명 조회
      const rev = await Location.reverseGeocodeAsync({ latitude: base.latitude, longitude: base.longitude });
      const adminArea = (rev?.[0]?.region || rev?.[0]?.subregion || rev?.[0]?.city || undefined) as string | undefined;
      const hubAreaCd = getHubAreaCdFromGeo(adminArea) || 47; // 기본 경북
      // PSB 패턴: 가까운 권역 우선(고정 baseYm) → 필요 시 월 롤백
      let results: TourAttraction[] = await TourApiService.searchHubNearbyByCoordsStrict(base.latitude, base.longitude, 3, 20);

      // 3) 이미지 자동 보강: firstimage 없으면 detailImage1 → galleryDetailList1 순으로 시도 (간단 캐시 포함)
      const mapped = await Promise.all((results || []).slice(0, 10).map(async (item) => {
        const distanceKm = calculateDistanceFromApi(base.latitude, base.longitude, item.mapy, item.mapx);
        const id = item.contentid;
        let img = item.firstimage || item.firstimage2 || imageCacheRef.current[id];
        if (!img && id) {
          try {
            const imgs = await TourApiService.getAttractionImages(id);
            if (Array.isArray(imgs) && imgs.length > 0) img = imgs[0];
          } catch {}
          if (!img) {
            try {
              const photos = await TourApiService.getGalleryDetailByTitle(item.title, 1, 1);
              if (Array.isArray(photos) && photos.length > 0 && photos[0].galWebImageUrl) {
                img = photos[0].galWebImageUrl.startsWith('http://')
                  ? photos[0].galWebImageUrl.replace('http://', 'https://')
                  : photos[0].galWebImageUrl;
              }
            } catch {}
          }
          if (img) imageCacheRef.current[id] = img;
        }
        // 이미지가 없는 경우 로컬 이미지 매핑 시도
        const enriched = enrichAttractionWithImage({
          title: item.title,
          firstimage: img || undefined
        });
        
        return {
          id,
          title: item.title,
          desc: (item.addr1 || '').toString(),
          distance: formatApiDistance(distanceKm),
          imageUrl: enriched.imageUrl || img,
          latitude: parseFloat(item.mapy || '0'),
          longitude: parseFloat(item.mapx || '0'),
        };
      }));
      setNearbyAttractions(mapped);
    } catch (e) {
      console.error('Failed to load nearby attractions (hub)', e);
    } finally {
      setLoadingAttractions(false);
    }
  }, [getAnchorCoords]);

  const moveToMyLocation = useCallback(async () => {
    if (!location) return;
    // 지도 이동
    mapRef.current?.animateToRegion({ ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    // 검색 마커 제거하여 기준을 내 위치로
    setSearchMarker(null);
    // 사찰 추천 재계산
    const updatedNearbyTemples = getNearbyTemples(location as any, temples);
    setNearbyTemples(updatedNearbyTemples);
    // 관광지 재로딩 (내 위치 기준)
    await loadNearbyAttractions({ latitude: location.latitude, longitude: location.longitude });
    // 리스트 스크롤 리셋
    requestAnimationFrame(() => {
      templeListRef.current?.scrollToOffset({ offset: 0, animated: false });
      attractionsListRef.current?.scrollToOffset({ offset: 0, animated: false });
    });
  }, [location, temples, loadNearbyAttractions]);

  const handleSearchLocation = useCallback(async () => {
    if (!searchText.trim()) return;
    try {
      Keyboard.dismiss();

      // 1) 사찰 데이터에서 이름 매칭 (양방향 포함)
      const templeMatch = TEMPLES_DATA.find(temple => 
        temple.name.toLowerCase().includes(searchText.toLowerCase()) ||
        temple.name.includes(searchText) ||
        searchText.toLowerCase().includes(temple.name.toLowerCase())
      );

      if (templeMatch && templeMatch.latitude && templeMatch.longitude) {
        const target = { latitude: templeMatch.latitude, longitude: templeMatch.longitude };
        setSearchMarker(target);
        mapRef.current?.animateToRegion({ ...target, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
        // 검색 기준으로 추천 새로 계산 + 스크롤 리셋
        const updatedNearbyTemples = getNearbyTemples(target as any, temples);
        setNearbyTemples(updatedNearbyTemples);
        await loadNearbyAttractions(target);
        requestAnimationFrame(() => {
          templeListRef.current?.scrollToOffset({ offset: 0, animated: false });
          attractionsListRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
        return;
      }

      // 2) 지오코딩 시도 (대한민국 범위 힌트)
      const results = await Location.geocodeAsync(`${searchText}, 대한민국`);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        const target = { latitude, longitude };
        setSearchMarker(target);
        mapRef.current?.animateToRegion({ ...target, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
        // 검색 기준으로 추천 새로 계산
        const updatedNearbyTemples = getNearbyTemples({ latitude, longitude } as any, temples);
        setNearbyTemples(updatedNearbyTemples);
        await loadNearbyAttractions({ latitude, longitude });
        requestAnimationFrame(() => {
          templeListRef.current?.scrollToOffset({ offset: 0, animated: false });
          attractionsListRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
        return;
      }

      // 3) 키워드 기반 fallback 좌표 (사찰/지역 주요 키워드)
      const fallback: { [key: string]: { latitude: number; longitude: number } } = {
        '불국사': { latitude: 35.7898, longitude: 129.3320 },
        '석굴암': { latitude: 35.7956, longitude: 129.3487 },
        '해인사': { latitude: 35.8014, longitude: 128.0992 },
        '통도사': { latitude: 35.4856, longitude: 129.0642 },
        '범어사': { latitude: 35.2369, longitude: 129.0325 },
        '경주': { latitude: 35.8561, longitude: 129.2249 },
        '안동': { latitude: 36.5684, longitude: 128.7294 },
        '부산': { latitude: 35.1796, longitude: 129.0756 },
      };
      const key = Object.keys(fallback).find(k =>
        searchText.includes(k) || k.includes(searchText)
      );
      if (key) {
        const target = fallback[key];
        setSearchMarker(target);
        mapRef.current?.animateToRegion({ ...target, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
        const updatedNearbyTemples = getNearbyTemples(target as any, temples);
        setNearbyTemples(updatedNearbyTemples);
        await loadNearbyAttractions(target as any);
        requestAnimationFrame(() => {
          templeListRef.current?.scrollToOffset({ offset: 0, animated: false });
          attractionsListRef.current?.scrollToOffset({ offset: 0, animated: false });
        });
        return;
      }

      // 알림
      if (__DEV__) {
        console.log(`검색 결과 없음: ${searchText}`);
      }
    } catch (e) {
      console.error('검색 오류:', e);
    }
  }, [searchText]);

  const handleTempleMarkerPress = useCallback((temple: Temple) => {
    navigation.navigate('TempleStack', { screen: 'ReservationDetail', params: { templeId: temple.id } });
  }, [navigation]);

  const templeMarkers = useMemo(() => 
    temples.map((temple) => (
      <Marker
        key={temple.id}
        coordinate={{ latitude: temple.latitude || 0, longitude: temple.longitude || 0 }}
        title={temple.name}
        onPress={() => handleTempleMarkerPress(temple)}
      />
    )), [temples, handleTempleMarkerPress]
  );

  const renderTempleCard = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity 
      className="bg-white p-3 mx-2 border border-stone-200 shadow-md"
      style={{ width: CARD_WIDTH }}
      onPress={() => navigation.navigate('TempleStack', { screen: 'ReservationDetail', params: { templeId: item.id } })}
    >
      <View className="flex-row">
        {/* 왼쪽 썸네일: 정사각 형태로, 카드 대비 좁은 폭 */}
        {item.imageUrl ? (
          <View className="w-32 h-48 bg-stone-100 overflow-hidden mr-3">
            <Image 
              source={typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http') 
                ? { uri: item.imageUrl } 
                : item.imageUrl
              } 
              className="w-full h-full" 
              resizeMode="cover" 
            />
          </View>
        ) : (
          <View className="w-24 h-48 bg-stone-100 overflow-hidden mr-3 items-center justify-center">
            <Ionicons name="image-outline" size={22} color={COLORS.neutral[500]} />
          </View>
        )}

        {/* 우측 정보 */}
        <View className="flex-1">
          {/* 제목/평점 */}
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-lg font-bold text-sage-600 flex-1" numberOfLines={1}>{item.title}</Text>
            <View className="flex-row items-center ml-2">
              <Ionicons name="star" size={14} color={COLORS.brand.coral} />
              <Text className="text-base font-semibold text-neutral-700 ml-1">{item.rating}</Text>
            </View>
          </View>

          {/* 설명 */}
          {item.desc && (
            <Text className="text-sm text-neutral-600 mb-1.5 leading-5" numberOfLines={4}>
              {item.desc}
            </Text>
          )}

          {/* 거리 */}
          <View className="flex-row items-center mb-1.5">
            <Ionicons name="location-outline" size={16} color={COLORS.brand.sage} />
            <Text className="text-base text-sage-600 ml-1 font-medium">{item.distance || 'Unknown'}</Text>
          </View>

          {/* 프로그램 태그 */}
          {Array.isArray(item.programs) && item.programs.length > 0 && (
            <View className="flex-row flex-wrap gap-1">
              {item.programs.slice(0, 2).map((program: string, index: number) => (
                <View key={index} className="bg-sage-50 px-1.5 py-0.5 rounded-lg border border-sage-200">
                <Text className="text-sm font-medium text-sage-700">{program}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  if (loading) {
    return <ActivityIndicator className="flex-1" size="large" color={COLORS.brand.sage} />;
  }

  return (
    <View className="flex-1 bg-white">
      {/* 상단 흰 배경: 높이만 늘려서 아래로 내려오게 (검색창 위치 고정) */}
      <Pressable
        className="absolute left-0 right-0 z-40"
        style={{
          top: 0,
          height: (insets.top || 0) + 70,
          backgroundColor: '#F5F1EB',
          // 하단 섀도우
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: 'rgba(0,0,0,0.06)'
        }}
        onPress={Keyboard.dismiss}
        accessibilityRole="button"
        accessibilityLabel="헤더 배경"
      />

      {/* 검색창: 위치 고정 */}
      <View className="absolute left-4 right-4 z-50" style={{ top: (insets.top || 0) + 8 }}>
        <View
          className="flex-row items-center rounded-xl px-4 py-3 border border-stone-200"
          style={{ backgroundColor: '#FFFDF8' }}
        >
          <Ionicons name="search" size={20} color={COLORS.neutral[500]} />
          <TextInput
            ref={searchInputRef}
            className="flex-1 ml-3 text-base text-neutral-900"
            placeholder={t('map.search')}
            placeholderTextColor={COLORS.neutral[500]}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setSearchText('')}
            onSubmitEditing={handleSearchLocation}
            returnKeyType="search"
            style={{ fontSize: 18 }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              className="ml-2"
              onPress={() => {
                setSearchText('');
                requestAnimationFrame(() => searchInputRef.current?.focus());
              }}
              accessibilityLabel="검색어 지우기"
            >
              <Ionicons name="close-circle" size={18} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 지도 */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        className="flex-1"
        initialRegion={{
          latitude: location?.latitude ?? 35.8561,
          longitude: location?.longitude ?? 129.2249,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        style={{ flex: 1 }}
        onPress={() => Keyboard.dismiss()}
        onMapReady={() => {
          // iOS에서 해외 좌표로 튀는 경우 초기 줌을 좁게
          if (!location) {
            mapRef.current?.animateToRegion({
              latitude: 35.8561,
              longitude: 129.2249,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }, 300);
          }
        }}
      >
        {/* 내 위치 마커 표시 제거 (요청 반영) */}

        {/* 검색 위치 마커 */}
        {searchMarker && (
          <Marker
            coordinate={searchMarker}
            title={t('map.searchLocation')}
            pinColor={COLORS.brand.sage}
          />)
        }

        {/* 사찰 마커들 */}
        {templeMarkers}
      </MapView>

      {/* 중앙 하단 플로팅 토글바: Attractions / Temple */}
      <View
        className="absolute left-0 right-0 items-center"
        style={{ bottom: Math.max(insets.bottom, 8) + 270, zIndex: 999, elevation: 6 }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          className="px-4 py-2 rounded-full border flex-row items-center bg-white border-neutral-200"
          style={{ minWidth: 140, justifyContent: 'center' }}
          onPress={async () => {
            const next = !showAttractions;
            setShowAttractions(next);
            if (next && nearbyAttractions.length === 0) {
              await loadNearbyAttractions();
            }
            requestAnimationFrame(() => {
              templeListRef.current?.scrollToOffset({ offset: 0, animated: false });
              attractionsListRef.current?.scrollToOffset({ offset: 0, animated: false });
            });
          }}
          accessibilityLabel="Attractions Toggle"
        >
          <Ionicons name={'swap-horizontal-outline'} size={18} color={COLORS.neutral[700]} />
          <Text className="ml-1.5 text-base font-semibold text-neutral-800">{showAttractions ? 'Temple' : 'Attractions'}</Text>
        </TouchableOpacity>
      </View>

      {/* 내 위치로 이동 버튼 - 우측 상단 검색창 아래 (복구) */}
      <View className="absolute right-4 z-50" style={{ top: (insets.top || 0) + 90 }}>
        <TouchableOpacity
          className="bg-white w-12 h-12 rounded-full items-center justify-center border border-neutral-200"
          onPress={moveToMyLocation}
          accessibilityLabel="내 위치로 이동"
        >
          <Ionicons name="locate" size={22} color={COLORS.brand.sage} />
        </TouchableOpacity>
      </View>

      {/* 하단 추천 오버레이 (사찰/관광지 전환) */}
      <View
        className="absolute left-0 right-0"
        style={{ bottom: Math.max(insets.bottom, 8) + 64 }}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => Keyboard.dismiss()}
      >
        {showAttractions ? (
          <FlatList
            ref={attractionsListRef}
            horizontal
            data={nearbyAttractions}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-white p-3 mx-2 border border-stone-200 shadow-md"
                style={{ width: CARD_WIDTH }}
                onPress={() => {
                  if (item.latitude && item.longitude) {
                    mapRef.current?.animateToRegion({
                      latitude: item.latitude,
                      longitude: item.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }, 400);
                  }
                }}
              >
                <View className="flex-row">
                  {item.imageUrl ? (
                    <View className="w-32 h-48 bg-stone-100 overflow-hidden mr-3">
                      <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
                    </View>
                  ) : (
                    <View className="w-32 h-48 bg-stone-100 overflow-hidden mr-3 items-center justify-center">
                      <Ionicons name="image-outline" size={22} color={COLORS.neutral[500]} />
                    </View>
                  )}
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-lg font-bold text-sage-600 flex-1" numberOfLines={1}>{item.title}</Text>
                    </View>
                    {item.desc ? (
                      <Text className="text-sm text-neutral-600 mb-1.5 leading-5" numberOfLines={3}>{item.desc}</Text>
                    ) : null}
                    <View className="flex-row items-center">
                      <Ionicons name="location-outline" size={16} color={COLORS.brand.sage} />
                      <Text className="text-base text-sage-600 ml-1 font-medium">{item.distance || ''}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item: any) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            ListEmptyComponent={
              <View className="mx-4 p-3 bg-white border border-stone-200">
                <Text className="text-sm text-neutral-700">{loadingAttractions ? 'Loading attractions...' : '주변 관광지를 찾지 못했습니다'}</Text>
                {!loadingAttractions && (
                  <Text className="text-xs text-neutral-500 mt-1">로그를 확인하세요 (Hub STRICT 요청/응답)</Text>
                )}
              </View>
            }
          />
        ) : (
          <FlatList
            ref={templeListRef}
            horizontal
            data={nearbyTemples}
            renderItem={renderTempleCard}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
          />
        )}
      </View>
    </View>
  );
}