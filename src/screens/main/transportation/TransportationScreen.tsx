import React, { useState, useCallback, memo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Animated, Image, Dimensions } from 'react-native';
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
    website: 'https://andongtourtaxi.com',
    phone: null,
    distance: 15,
    imageUrl: require('../../../../assets/andong.png'),
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
    imageUrl: require('../../../../assets/yeongcheon.png'),
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
    imageUrl: require('../../../../assets/cheongdo.png'),
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
    imageUrl: require('../../../../assets/yeongju.png'),
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
    imageUrl: require('../../../../assets/yeongdeok.png'),
  },
];


const TransportationScreen = () => {
  const [sortBy, setSortBy] = useState<'distance'>('distance');
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Responsive design
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenHeight < 700;
  const isLargeScreen = screenHeight > 800;
  
  // Dynamic sizes
  const headerFontSize = isSmallScreen ? 17.5 : (isLargeScreen ? 22.75 : 19.25);
  const subHeaderFontSize = isSmallScreen ? 12.25 : (isLargeScreen ? 15.3125 : 13.78125);
  const cardPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
  const cardMargin = isSmallScreen ? 4 : (isLargeScreen ? 8 : 6);
  const titleFontSize = isSmallScreen ? 10.5 : (isLargeScreen ? 14 : 12.25);
  const descFontSize = isSmallScreen ? 8.75 : (isLargeScreen ? 11.5 : 9.5);
  const priceFontSize = isSmallScreen ? 9.5 : (isLargeScreen ? 12.25 : 10.5);
  const imageSize = isSmallScreen ? 70 : (isLargeScreen ? 85 : 75);
  const headerPadding = isSmallScreen ? 16 : (isLargeScreen ? 24 : 20);
  const sectionPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
  
  const HEADER_H = isSmallScreen ? 100 : (isLargeScreen ? 140 : 120); // 헤더 높이
  
  // Sort data only (no filtering)
  const sortedData = TAXI_DATA.sort((a, b) => a.distance - b.distance);
  
  // TaxiCard component with responsive design
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
        style={{ marginHorizontal: cardMargin, marginBottom: cardMargin * 2 }}
        onPress={handlePress}
      >
        <View 
          className="bg-white rounded-xl border border-stone-200"
          style={{ padding: cardPadding }}
        >
          <View className="flex-row">
            {/* 왼쪽: 사진 */}
            <View 
              className="rounded-lg overflow-hidden mr-4 flex-shrink-0"
              style={{ width: imageSize, height: imageSize }}
            >
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
                  <Ionicons name="car-outline" size={imageSize * 0.4} color="#9CA3AF" />
                </View>
              )}
            </View>
            
            {/* 오른쪽: 설명 */}
            <View className="flex-1 justify-between">
              <View>
                <Text 
                  className="font-bold text-neutral-900 mb-2" 
                  style={{ fontSize: titleFontSize }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                
                <Text 
                  className="text-neutral-600 mb-2" 
                  style={{ fontSize: descFontSize }}
                  numberOfLines={2}
                >
                  {item.desc}
                </Text>
              </View>
              
              {/* 가격 */}
              <Text 
                className="font-bold text-sage-600"
                style={{ fontSize: priceFontSize }}
              >
                {item.price}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  });
  
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
        <View style={{ paddingHorizontal: headerPadding, paddingTop: 75, paddingBottom: 8 }}>
          <Text 
            className="font-bold text-neutral-800 ml-1"
            style={{ fontSize: headerFontSize }}
          >
            Tourist Taxi
          </Text>
          <Text 
            className="font-bold text-neutral-800 mt-2 ml-2"
            style={{ fontSize: subHeaderFontSize }}
          >
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
          <View 
            className="bg-[#F5F1EB] rounded-t-[30px]"
            style={{ paddingHorizontal: sectionPadding, paddingTop: sectionPadding - 20 }}
          >
            {sortedData.map(item => (
              <TaxiCard key={item.id} item={item} />
            ))}
            
            {sortedData.length === 0 && (
              <View className="items-center justify-center py-10">
                <Text 
                  className="text-neutral-500"
                  style={{ fontSize: descFontSize }}
                >
                  No taxis available
                </Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TransportationScreen;