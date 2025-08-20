import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../../../store/userStore';

// 임시 데이터 - 추후 실제 API 연동
const FAVORITE_TEMPLES = [
  {
    id: '1',
    name: '불국사',
    location: '경주시 진현동',
    image: 'https://example.com/bulguksa.jpg',
    rating: 4.8,
    reviewCount: 124,
    tags: ['문화재', '야경명소', '체험프로그램'],
    price: '50,000원~',
    isFavorite: true,
  },
  {
    id: '2',
    name: '석굴암',
    location: '경주시 진현동',
    image: 'https://example.com/seokguram.jpg',
    rating: 4.9,
    reviewCount: 89,
    tags: ['세계문화유산', '일출명소'],
    price: '60,000원~',
    isFavorite: true,
  },
];

const FavoriteTempleCard = ({ temple, onToggleFavorite, onPress }: any) => {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl mb-4 border border-stone-200 overflow-hidden"
      onPress={onPress}
    >
      {/* 이미지 섹션 */}
      <View className="relative h-48">
        <View className="w-full h-full bg-stone-200 justify-center items-center">
          <Ionicons name="image-outline" size={48} color="#6B7280" />
        </View>
        <TouchableOpacity 
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 justify-center items-center"
          onPress={() => onToggleFavorite(temple.id)}
        >
          <Ionicons 
            name={temple.isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color="#FF6B6B" 
          />
        </TouchableOpacity>
      </View>

      {/* 정보 섹션 */}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-bold text-neutral-900 flex-1">{temple.name}</Text>
          <Text className="text-base font-semibold text-sage-600 ml-2">{temple.price}</Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text className="text-sm text-neutral-600 ml-1 mr-4">{temple.location}</Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#FFA500" />
            <Text className="text-sm text-neutral-600 ml-1">{temple.rating} ({temple.reviewCount})</Text>
          </View>
        </View>

        {/* 태그 */}
        <View className="flex-row flex-wrap">
          {temple.tags.map((tag: string, index: number) => (
            <View key={index} className="bg-sage-50 rounded-lg px-2 py-1 mr-2 mb-1 border border-sage-200">
              <Text className="text-xs text-sage-600 font-medium">{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FavoriteTemplesScreen = ({ navigation }: any) => {
  const { user } = useUserStore();
  const [favoriteTemples, setFavoriteTemples] = useState(FAVORITE_TEMPLES);

  const handleToggleFavorite = useCallback((templeId: string) => {
    setFavoriteTemples(prev => 
      prev.map(temple => 
        temple.id === templeId 
          ? { ...temple, isFavorite: !temple.isFavorite }
          : temple
      ).filter(temple => temple.isFavorite) // 찜 해제시 목록에서 제거
    );
  }, []);

  const handleTemplePress = useCallback((temple: any) => {
    // 사찰 상세 화면으로 이동
    Alert.alert('준비 중', '사찰 상세 화면은 곧 제공될 예정입니다.');
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-stone-200">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full justify-center items-center mr-3"
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={24} color="#4A5D23" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-sage-600 flex-1">Favorite Temples</Text>
        <View className="flex-row items-center">
          <Ionicons name="heart" size={20} color="#FF6B6B" />
          <Text className="text-base font-semibold text-neutral-600 ml-1">{favoriteTemples.length}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5 py-4">
        {favoriteTemples.length > 0 ? (
          favoriteTemples.map((temple) => (
            <FavoriteTempleCard
              key={temple.id}
              temple={temple}
              onToggleFavorite={handleToggleFavorite}
              onPress={() => handleTemplePress(temple)}
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="heart-outline" size={64} color="#6B7280" />
            <Text className="text-lg font-semibold text-neutral-900 mt-4 mb-2">No favorite temples yet</Text>
            <Text className="text-sm text-neutral-600 text-center">마음에 드는 사찰을 찜해보세요!</Text>
            
            <TouchableOpacity 
              className="mt-6 px-6 py-3 bg-sage-600 rounded-xl"
              onPress={() => navigation.navigate('TempleStack')}
            >
              <Text className="text-white font-semibold">사찰 둘러보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FavoriteTemplesScreen;