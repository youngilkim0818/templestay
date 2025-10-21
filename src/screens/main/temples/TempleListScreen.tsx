import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

import { TEMPLES_DATA, getTemplesWithOneDayPrograms, getTemplesWithOneDayProgramsByRegion } from '../../../data/temple-data';
import Card from '../../../components/common/Card';
import { Temple } from '../../../types';
import { COLORS } from '../../../constants/colors';
import useTempleStore from '../../../store/templeStore';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isLargeScreen = height > 800;

// Responsive sizes
const headerFontSize = isSmallScreen ? 15.75 : (isLargeScreen ? 21 : 17.5);
const subHeaderFontSize = isSmallScreen ? 10.5 : (isLargeScreen ? 14 : 12.25);
const cardPadding = isSmallScreen ? 8.75 : (isLargeScreen ? 14 : 10.5);
const cardMargin = isSmallScreen ? 3.5 : (isLargeScreen ? 7 : 5.25);
const templeImageHeight = isSmallScreen ? 105 : (isLargeScreen ? 157.5 : 131.25);
const templeTitleSize = isSmallScreen ? 12.25 : (isLargeScreen ? 15.75 : 14);
const templeDescSize = isSmallScreen ? 9.625 : (isLargeScreen ? 13.125 : 11.375);
const sectionPadding = isSmallScreen ? 8.75 : (isLargeScreen ? 14 : 10.5);
const iconSize = isSmallScreen ? 14 : (isLargeScreen ? 19.25 : 17.5);
const buttonPadding = isSmallScreen ? 7 : (isLargeScreen ? 10.5 : 8.75);
const buttonFontSize = isSmallScreen ? 9.625 : (isLargeScreen ? 13.125 : 11.375);

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
      <Card variant="elevated" className="border border-stone-200" style={{ marginHorizontal: cardMargin, marginBottom: cardMargin }}>
        <Image 
          source={temple.imageUrl} 
          className="w-full rounded-xl"
          style={{ height: templeImageHeight, marginBottom: cardPadding }}
          resizeMode="cover"
        />
        <View style={{ padding: cardPadding }}>
          <Text 
            className="font-semibold text-neutral-900 mb-2"
            style={{ fontSize: templeTitleSize }}
          >
            {temple.name}
          </Text>
          <Text 
            className="text-neutral-600"
            style={{ fontSize: templeDescSize }}
          >
            {temple.region}
          </Text>
        </View>
        <TouchableOpacity 
          className="absolute right-2 top-2 p-1" 
          onPress={() => onToggleFavorite(temple)}
        >
          <Text style={{ fontSize: iconSize }}>
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
      className={`mx-2 rounded-2xl ${
        isSelected 
          ? 'bg-sage-600 active:bg-sage-700' 
          : 'bg-white border border-stone-200 active:bg-stone-50'
      }`}
      style={{ paddingHorizontal: buttonPadding * 2, paddingVertical: buttonPadding }}
      onPress={handlePress}
    >
      <Text 
        className={`text-center font-semibold ${
          isSelected ? 'text-white' : 'text-sage-600'
        }`}
        style={{ fontSize: buttonFontSize }}
      >
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
            const oneDayTemples = getTemplesWithOneDayPrograms();
            const uniqueRegions = [...new Set(oneDayTemples.map(temple => temple.region))];
            return ['전체', ...uniqueRegions];
        }
        return REGIONS;
    }, [isOneDayMode]);

    const filteredTemples = useMemo(() => {
        if (isOneDayMode) {
            // 당일형 모드일 때는 당일형 프로그램을 가진 사찰들만 필터링
            if (selectedRegion === '전체') {
                return getTemplesWithOneDayPrograms();
            } else {
                // 선택된 지역의 당일형 프로그램을 가진 사찰들만 필터링
                return getTemplesWithOneDayProgramsByRegion(selectedRegion);
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
                        <Text className="text-lg font-medium text-neutral-600 text-center mb-2">
                            서비스 준비 중
                        </Text>
                        <Text className="text-sm text-neutral-500 text-center">
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
                        <Text 
                          className="font-light text-neutral-900 text-center my-6 mt-8"
                          style={{ fontSize: headerFontSize }}
                        >
                            {screenTitle}
                        </Text>
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