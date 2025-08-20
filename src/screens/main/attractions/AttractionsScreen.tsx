import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, FlatList, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { TempleService } from '../../../services/templeService';
import { Temple } from '../../../types';
import { COLORS } from '../../../constants/colors';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

// Styled components for NativeWind

const { width } = Dimensions.get('window');

// 관광지 키워드 데이터
const ATTRACTION_KEYWORDS = [
  { id: 'temple', label: '사찰', icon: 'business-outline' },
  { id: 'nature', label: '자연', icon: 'leaf-outline' },
  { id: 'culture', label: '문화재', icon: 'library-outline' },
  { id: 'food', label: '맛집', icon: 'restaurant-outline' },
  { id: 'experience', label: '체험', icon: 'hand-left-outline' },
];

// 근처 추천 관광지 데이터
const NEARBY_ATTRACTIONS = [
  {
    id: '1',
    name: '불국사',
    type: '사찰',
    distance: '1.2km',
    rating: 4.8,
    reviewCount: 1240,
    image: 'https://via.placeholder.com/200x150/4A5D23/FFFFFF?text=🏯',
    description: 'UNESCO 세계문화유산으로 지정된 신라 시대의 대표적인 불교 사찰',
    tags: ['UNESCO', '문화재', '전통건축']
  },
  {
    id: '2',
    name: '석굴암',
    type: '문화재',
    distance: '2.5km',
    rating: 4.9,
    reviewCount: 892,
    image: 'https://via.placeholder.com/200x150/4A5D23/FFFFFF?text=🗿',
    description: '신라 불교 예술의 걸작으로 평가받는 석굴 사원',
    tags: ['UNESCO', '석굴', '불교예술']
  },
  {
    id: '3',
    name: '첨성대',
    type: '문화재',
    distance: '3.1km',
    rating: 4.5,
    reviewCount: 654,
    image: 'https://via.placeholder.com/200x150/4A5D23/FFFFFF?text=🌟',
    description: '동양에서 가장 오래된 천문대로 신라의 과학 기술력을 보여주는 유적',
    tags: ['천문대', '신라', '과학유산']
  },
  {
    id: '4',
    name: '안압지',
    type: '자연',
    distance: '2.8km',
    rating: 4.7,
    reviewCount: 1089,
    image: 'https://via.placeholder.com/200x150/4A5D23/FFFFFF?text=🌊',
    description: '신라 궁궐의 인공 연못으로 야경이 아름다운 명소',
    tags: ['연못', '야경', '궁궐유적']
  },
];

// 키워드 버튼 컴포넌트
const KeywordButton = memo<{
  keyword: typeof ATTRACTION_KEYWORDS[0];
  isSelected: boolean;
  onPress: (id: string) => void;
}>(({ keyword, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(keyword.id);
  }, [keyword.id, onPress]);

  return (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-2 mr-3 rounded-2xl border ${
        isSelected 
          ? 'bg-sage-600 border-sage-600' 
          : 'bg-white border-stone-200 active:bg-stone-50'
      }`}
      onPress={handlePress}
    >
      <Ionicons 
        name={keyword.icon as any} 
        size={16} 
        color={isSelected ? 'white' : COLORS.neutral[600]} 
      />
      <Text className={`ml-2 text-sm font-medium ${
        isSelected ? 'text-white font-semibold' : 'text-neutral-600'
      }`}>
        {keyword.label}
      </Text>
    </TouchableOpacity>
  );
});

// 관광지 카드 컴포넌트
const AttractionCard = memo<{
  attraction: typeof NEARBY_ATTRACTIONS[0];
  onPress: (id: string) => void;
}>(({ attraction, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(attraction.id);
  }, [attraction.id, onPress]);

  return (
    <TouchableOpacity 
      className="w-64 bg-white rounded-2xl mr-4 border border-stone-200 active:bg-stone-50"
      onPress={handlePress}
    >
      <View className="relative">
        {/* 이미지를 대신한 아이콘 영역 */}
        <View className="h-32 bg-stone-100 rounded-t-2xl justify-center items-center">
          <Text className="text-4xl">
            {attraction.type === '사찰' ? '🏯' : 
             attraction.type === '문화재' ? '🗿' : 
             attraction.type === '자연' ? '🌊' : '🌟'}
          </Text>
        </View>
        
        {/* 거리 배지 */}
        <View className="absolute top-3 right-3 bg-sage-600 px-2 py-1 rounded-lg">
          <Text className="text-xs text-white font-semibold">
            {attraction.distance}
          </Text>
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-neutral-900" numberOfLines={1}>
            {attraction.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FF6B6B" />
            <Text className="text-sm text-neutral-700 ml-1 font-medium">
              {attraction.rating}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-neutral-600 mb-3 line-height-5" numberOfLines={2}>
          {attraction.description}
        </Text>

        {/* 태그들 */}
        <View className="flex-row flex-wrap">
          {attraction.tags.slice(0, 2).map((tag, index) => (
            <View key={index} className="bg-stone-100 px-2 py-1 rounded-lg mr-2 mb-1">
              <Text className="text-xs text-neutral-600 font-medium">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const AttractionsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  // 사찰 데이터 로드
  const loadTemples = useCallback(async () => {
    try {
      setLoading(true);
      const templeData = await TempleService.getAllTemples();
      setTemples(templeData.slice(0, 3)); // 최대 3개만 표시
    } catch (error) {
      console.error('Failed to load temples:', error);
      Alert.alert('오류', '사찰 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemples();
  }, [loadTemples]);

  // 키워드 선택 핸들러
  const handleKeywordPress = useCallback((keywordId: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keywordId) 
        ? prev.filter(id => id !== keywordId)
        : [...prev, keywordId]
    );
  }, []);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    if (!searchText.trim()) return;
    console.log('Searching for:', searchText);
    // 실제 검색 로직 구현
  }, [searchText]);

  // 관광지 카드 클릭 핸들러
  const handleAttractionPress = useCallback((attractionId: string) => {
    console.log('Attraction pressed:', attractionId);
    // 관광지 상세 페이지로 이동
  }, []);

  // 내 위치 핸들러
  const handleMyLocation = useCallback(() => {
    console.log('My location pressed');
    // 위치 기반 추천 로직
  }, []);

  // 필터링된 관광지
  const filteredAttractions = useMemo(() => {
    if (selectedKeywords.length === 0) return NEARBY_ATTRACTIONS;
    
    return NEARBY_ATTRACTIONS.filter(attraction => 
      selectedKeywords.some(keyword => {
        if (keyword === 'temple') return attraction.type === '사찰';
        if (keyword === 'culture') return attraction.type === '문화재';
        if (keyword === 'nature') return attraction.type === '자연';
        return false;
      })
    );
  }, [selectedKeywords]);

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top', 'left', 'right']}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View className="px-5 pt-4 pb-2">
          {/* Search Bar */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 flex-row items-center bg-white rounded-2xl px-4 py-3 mr-3 border border-stone-200">
              <Ionicons name="search-outline" size={20} color={COLORS.neutral[500]} />
              <TextInput
                className="flex-1 ml-3 text-base text-neutral-900"
                placeholder="사찰, 지역, 관광지 검색"
                placeholderTextColor={COLORS.neutral[500]}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            
            {/* My Location Button */}
            <TouchableOpacity 
              className="w-12 h-12 bg-sage-600 rounded-2xl justify-center items-center active:bg-sage-700"
              onPress={handleMyLocation}
            >
              <Ionicons name="location-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Keyword Selection */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {ATTRACTION_KEYWORDS.map(keyword => (
              <KeywordButton
                key={keyword.id}
                keyword={keyword}
                isSelected={selectedKeywords.includes(keyword.id)}
                onPress={handleKeywordPress}
              />
            ))}
          </ScrollView>
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row px-5 mb-6">
          {/* Favorites Button */}
          <TouchableOpacity 
            className={`flex-1 flex-row items-center justify-center py-3 mr-2 rounded-2xl border ${
              showFavorites 
                ? 'bg-sage-600 border-sage-600' 
                : 'bg-white border-stone-200 active:bg-stone-50'
            }`}
            onPress={() => setShowFavorites(!showFavorites)}
          >
            <Ionicons 
              name={showFavorites ? "heart" : "heart-outline"} 
              size={18} 
              color={showFavorites ? "white" : COLORS.neutral[600]} 
            />
            <Text className={`ml-2 text-sm font-semibold ${
              showFavorites ? 'text-white' : 'text-neutral-600'
            }`}>
              즐겨찾기
            </Text>
          </TouchableOpacity>

          {/* Transportation Button */}
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center bg-white border border-stone-200 py-3 ml-2 rounded-2xl active:bg-stone-50"
            onPress={() => navigation.navigate('Transportation')}
          >
            <Ionicons name="car-outline" size={18} color={COLORS.neutral[600]} />
            <Text className="ml-2 text-sm font-semibold text-neutral-600">
              교통편
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Recommendations Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between px-5 mb-4">
            <View>
              <Text className="text-xl font-bold text-neutral-900 mb-1">
                근처 사찰 추천
              </Text>
              <Text className="text-sm text-neutral-600 font-medium">
                현재 위치 기준 가까운 사찰들
              </Text>
            </View>
            <TouchableOpacity 
              className="px-3 py-1"
              onPress={() => navigation.navigate('TempleStack', { screen: 'TempleList' })}
            >
              <Text className="text-sm text-sage-600 font-semibold">
                전체보기 {'→'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Temple Cards */}
          {loading ? (
            <View className="py-10">
              <LoadingSpinner />
            </View>
          ) : (
            <FlatList
              data={temples}
              renderItem={({ item: temple }) => (
                <TouchableOpacity 
                  className="bg-white rounded-2xl mx-2 p-4 border border-stone-200 w-56 active:bg-stone-50"
                  onPress={() => navigation.navigate('TempleStack', { 
                    screen: 'ReservationDetail', 
                    params: { templeId: temple.id } 
                  })}
                >
                  <View className="h-24 bg-stone-100 rounded-xl justify-center items-center mb-3">
                    <Text className="text-3xl">🏯</Text>
                  </View>
                  <Text className="text-lg font-bold text-neutral-900 mb-1" numberOfLines={1}>
                    {temple.name}
                  </Text>
                  <Text className="text-sm text-neutral-600 mb-2">
                    {temple.region}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={12} color="#FF6B6B" />
                    <Text className="text-xs text-neutral-700 ml-1 font-medium">
                      {temple.rating || '4.8'}
                    </Text>
                    <Text className="text-xs text-neutral-500 ml-2">
                      2.3km
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            />
          )}
        </View>

        {/* Popular Attractions Section */}
        <View>
          <View className="flex-row items-center justify-between px-5 mb-4">
            <View>
              <Text className="text-xl font-bold text-neutral-900 mb-1">
                인기 관광지
              </Text>
              <Text className="text-sm text-neutral-600 font-medium">
                {selectedKeywords.length > 0 
                  ? `${selectedKeywords.length}개 키워드로 필터링됨` 
                  : '경북 지역의 인기 관광지'}
              </Text>
            </View>
          </View>

          {/* Attraction Cards */}
          <FlatList
            data={filteredAttractions}
            renderItem={({ item }) => (
              <AttractionCard 
                attraction={item} 
                onPress={handleAttractionPress} 
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AttractionsScreen;