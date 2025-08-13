import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';

import { TEMPLES_DATA } from '../../../data/temple-data';
import Card from '../../../components/common/Card';
import { Temple } from '../../../types';
import { COLORS } from '../../../constants/colors';
import useTempleStore from '../../../store/templeStore';

// Styled components for NativeWind

const REGIONS = ['전체', '문경', '포항', '경산', '성주'];

// 템플 아이템 컴포넌트 분리 및 메모이제이션 - ZEN-TECH Style
const TempleItem = memo<{
  temple: Temple;
  onPress: (templeId: string) => void;
  onToggleFavorite: (temple: Temple) => void;
  isFavorite: boolean;
}>(({ temple, onPress, onToggleFavorite, isFavorite }) => {
  const handlePress = useCallback(() => {
    onPress(temple.id);
  }, [temple.id, onPress]);

  return (
    <TouchableOpacity onPress={handlePress} className="active:opacity-80">
      <Card variant="elevated" className="mx-4 mb-4">
        <Image 
          source={temple.imageUrl} 
          className="w-full h-40 rounded-xl mb-4"
          resizeMode="cover"
        />
        <Text className="text-xl font-semibold text-neutral-900 mb-2">
          {temple.name}
        </Text>
        <Text className="text-base text-neutral-600">
          {temple.region}
        </Text>
        <TouchableOpacity className="absolute right-2 top-2 p-1" onPress={() => onToggleFavorite(temple)}>
          <Text>
            {isFavorite ? '💖' : '🤍'}
          </Text>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
});

// 지역 버튼 컴포넌트 분리 및 메모이제이션 - ZEN-TECH Style
const RegionButton = memo<{
  region: string;
  isSelected: boolean;
  onPress: (region: string) => void;
}>(({ region, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(region);
  }, [region, onPress]);

  return (
    <TouchableOpacity 
      className={`px-6 py-3 mx-2 rounded-2xl ${
        isSelected 
          ? 'bg-sage-600 active:bg-sage-700' 
          : 'bg-white border border-stone-200 active:bg-stone-50'
      }`}
      onPress={handlePress}
    >
      <Text className={`text-center font-semibold ${
        isSelected ? 'text-white' : 'text-sage-600'
      }`}>
        {region}
      </Text>
    </TouchableOpacity>
  );
});

const TempleListScreen = ({ navigation, route }: any) => {
    const [selectedRegion, setSelectedRegion] = useState('전체');
    const { toggleFavorite, isFavorite } = useTempleStore();
    
    // route 파라미터에서 oneDayMode 확인
    const isOneDayMode = route?.params?.oneDayMode || false;

    // One-Day 모드일 때는 당일형 프로그램을 가진 사찰들의 지역만 표시
    const availableRegions = useMemo(() => {
        if (isOneDayMode) {
            const oneDayTemples = TEMPLES_DATA.filter(temple => 
                temple.templestay?.some(program => program.type === '당일형')
            );
            const uniqueRegions = [...new Set(oneDayTemples.map(temple => temple.region))];
            return ['전체', ...uniqueRegions];
        }
        return REGIONS;
    }, [isOneDayMode]);

    const filteredTemples = useMemo(() => {
        if (isOneDayMode) {
            // 당일형 모드일 때는 당일형 프로그램을 가진 사찰들만 필터링
            if (selectedRegion === '전체') {
                return TEMPLES_DATA.filter(temple => 
                    temple.templestay?.some(program => program.type === '당일형')
                );
            } else {
                // 선택된 지역의 당일형 프로그램을 가진 사찰들만 필터링
                return TEMPLES_DATA.filter(temple => 
                    temple.region === selectedRegion && 
                    temple.templestay?.some(program => program.type === '당일형')
                );
            }
        } else {
            // 일반 모드일 때는 모든 사찰 표시
            if (selectedRegion === '전체') {
                return TEMPLES_DATA;
            } else {
                return TEMPLES_DATA.filter(temple => temple.region === selectedRegion);
            }
        }
    }, [selectedRegion, isOneDayMode]);

    const handleTemplePress = useCallback((templeId: string) => {
        navigation.navigate('ReservationDetail', { templeId });
    }, [navigation]);

    const handleRegionPress = useCallback((region: string) => {
        setSelectedRegion(region);
    }, []);

    const renderItem = useCallback(({ item }: { item: Temple }) => (
        <TempleItem 
          temple={item} 
          onPress={handleTemplePress} 
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite(item.id)}
        />
    ), [handleTemplePress, toggleFavorite, isFavorite]);

    const regionButtons = useMemo(() => 
        availableRegions.map(region => (
            <RegionButton
                key={region}
                region={region}
                isSelected={selectedRegion === region}
                onPress={handleRegionPress}
            />
        )), [availableRegions, selectedRegion, handleRegionPress]
    );

    // One-Day 모드일 때 제목 변경
    const screenTitle = isOneDayMode ? '당일형 사찰' : '사찰 목록';

    return (
        <View className="flex-1 bg-stone-100">
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

            {/* One-Day 모드일 때는 지역별 필터링을 위해 서비스 준비 중 조건을 적용하지 않음 */}
            {!isOneDayMode && selectedRegion !== '전체' && selectedRegion !== '경북' ? (
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 items-center">
                        <Text className="text-xl font-medium text-neutral-600 text-center mb-2">
                            서비스 준비 중
                        </Text>
                        <Text className="text-base text-neutral-500 text-center">
                            '{selectedRegion}' 지역은 현재 서비스 준비 중입니다.
                        </Text>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={filteredTemples}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    className="flex-1"
                    ListHeaderComponent={
                        <Text className="text-3xl font-light text-neutral-900 text-center my-6 mt-8">
                            {screenTitle}
                        </Text>
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center px-6 mt-20">
                            <View className="bg-white rounded-2xl p-8 items-center">
                                <Text className="text-xl font-medium text-neutral-600 text-center mb-2">
                                    등록된 사찰이 없습니다
                                </Text>
                                <Text className="text-base text-neutral-500 text-center">
                                    {isOneDayMode 
                                        ? '해당 지역에 당일형 프로그램을 가진 사찰이 없습니다.'
                                        : '해당 지역에 등록된 사찰이 없습니다.'
                                    }
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
            )}
        </View>
    );
};

// StyleSheet removed - now using NativeWind classes

export default TempleListScreen; 