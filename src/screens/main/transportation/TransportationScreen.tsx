import React, { useState, useCallback, memo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../../constants/colors';

const TAXI_DATA = [
  {
    id: '1',
    region: 'Gyeongbuk',
    city: 'Andong',
    title: 'Andong Tourist Taxi',
    desc: 'Andong Tour Taxi – A convenient ride for travelers on foot',
    price: '₩20,000 ~ ₩50,000',
    website: 'http://andongtourtaxi.com',
    phone: null,
    distance: 15,
    imageUrl: require('../../../../assets/안동.png'),
  },
  {
    id: '2',
    region: 'Gyeongbuk',
    city: 'Yeongcheon',
    title: 'Yeongcheon City TouristTaxi',
    desc: 'Conveniently travel around Andong\'s spread-out attractions',
    price: '₩60,000 ~ ₩150,000',
    website: 'https://www.yc.go.kr/tour/contents.do?mId=0607000000',
    phone: null,
    distance: 25,
    imageUrl: require('../../../../assets/영천.png'),
  },
  {
    id: '3',
    region: 'Gyeongbuk',
    city: 'Cheongdo',
    title: 'Cheongdo County Tourist Taxi',
    desc: 'Talk Talk Tour Taxi – Discover Cheongdo\'s history and stories while exploring its attractions',
    price: '₩50,000 ~ ₩75,000',
    website: 'https://www.cheongdo.go.kr/tour/contents.do?mid=0603000000',
    phone: '054-370-6000',
    distance: 35,
    imageUrl: require('../../../../assets/청도.png'),
  },
  {
    id: '4',
    region: 'Gyeongbuk',
    city: 'Yeongju',
    title: 'Yeongju City Tourist Taxi',
    desc: 'Discover Yeongju\'s timeless temples and scenic beauty',
    price: 'Contact',
    website: 'https://www.yeongju.go.kr/open_content/yeyak/page.do?mnu_uid=11434&app_type=3',
    phone: '054-639-6603',
    distance: 45,
    imageUrl: require('../../../../assets/영주.png'),
  },
  {
    id: '5',
    region: 'Gyeongbuk',
    city: 'Yeongdeok',
    title: 'Yeongdeok County Tourist Taxi',
    desc: 'Hop on, Have fun, Experience Yeongdeok\'s charm!',
    price: 'Contact',
    website: 'https://ydtaxi.imweb.me/TourTaxiOverview',
    phone: '054-730-6000',
    distance: 85,
    imageUrl: require('../../../../assets/영덕.png'),
  },
];

// Simple Taxi Card - Box Style
const TaxiCard = memo<{
  item: typeof TAXI_DATA[0];
}>(({ item }) => {
  const handlePress = useCallback(() => {
    if (item.website) {
      Linking.openURL(item.website);
    }
  }, [item.website]);

  return (
    <TouchableOpacity
      className="mx-2 mb-4"
      onPress={handlePress}
    >
      <View className="bg-white rounded-xl border border-stone-200 p-4">
        <View className="flex-row">
          {/* 왼쪽: 사진 */}
          <View className="w-24 h-24 rounded-lg overflow-hidden mr-4 flex-shrink-0">
            {item.imageUrl ? (
              typeof item.imageUrl === 'string' ? (
                <Image 
                  source={{ uri: item.imageUrl }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Image 
                  source={item.imageUrl} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )
            ) : (
              <View className="w-full h-full bg-stone-200 justify-center items-center">
                <Ionicons name="car-outline" size={32} color="#9CA3AF" />
              </View>
            )}
          </View>
          
          {/* 오른쪽: 설명 */}
          <View className="flex-1 justify-between">
            <View>
              <Text className="text-lg font-bold text-neutral-900 mb-2" numberOfLines={1}>
                {item.title}
              </Text>
              
              <Text className="text-sm text-neutral-600 mb-2" numberOfLines={2}>
                {item.desc}
              </Text>
            </View>
            
            {/* 가격 */}
            <Text className="text-base font-bold text-sage-600">
              {item.price}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const TransportationScreen = () => {
  const [sortBy, setSortBy] = useState<'distance'>('distance');
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_H = 120; // 헤더 높이
  
  // Sort data only (no filtering)
  const sortedData = TAXI_DATA.sort((a, b) => a.distance - b.distance);
  
  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* 1) 헤더: 먼저 렌더 → 기본 쌓임순서에서 아래 레이어 */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
        }}
        pointerEvents="box-none"
        collapsable={false}
      >
        <View className="px-5 pt-24 pb-2">
          <Text className="text-4xl font-bold text-neutral-800 ml-1">
            Tourist Taxi
          </Text>
          <Text className="text-2xl font-bold text-neutral-800 mt-2 ml-2">
            Hop in and explore more with a tourist taxi
          </Text>
        </View>
      </View>

      {/* 2) 오버레이: 헤더 다음에 렌더 → 기본 쌓임순서에서 위 레이어(=헤더를 덮음) */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        renderToHardwareTextureAndroid
        collapsable={false}
      >
        <Animated.ScrollView
          contentContainerStyle={{ paddingTop: HEADER_H + 36, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* 베이지 섹션 */}
          <View className="bg-[#F5F1EB] rounded-t-[30px] px-5 pt-6">
            {sortedData.map(item => (
              <TaxiCard key={item.id} item={item} />
            ))}
            
            {sortedData.length === 0 && (
              <View className="items-center justify-center py-10">
                <Text className="text-neutral-500">No taxis available</Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TransportationScreen;