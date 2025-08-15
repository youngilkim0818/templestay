import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../../components/common/Card';
import { TEMPLES_DATA } from '../../../data/temple-data';

const RegionTemplesScreen = ({ navigation }: any) => {
  const [selectedRegion, setSelectedRegion] = useState('전체');
  
  // 사찰 데이터에서 지역별로 그룹화
  const templesByRegion = useMemo(() => {
    const grouped = TEMPLES_DATA.reduce((acc, temple) => {
      if (!acc[temple.region]) {
        acc[temple.region] = [];
      }
      acc[temple.region].push(temple);
      return acc;
    }, {} as { [key: string]: typeof TEMPLES_DATA });
    
    return grouped;
  }, []);

  // 지역 목록 (사찰이 있는 지역만)
  const regions = useMemo(() => {
    return Object.keys(templesByRegion);
  }, [templesByRegion]);

  // 선택된 지역에 따른 사찰 필터링
  const filteredTemples = useMemo(() => {
    if (selectedRegion === '전체') {
      return TEMPLES_DATA;
    }
    return templesByRegion[selectedRegion] || [];
  }, [selectedRegion, templesByRegion]);

  const handleTemplePress = useCallback((templeId: string) => {
    try { 
      navigation?.navigate('ReservationDetail', { templeId }); 
    } catch {}
  }, [navigation]);

  const handleRegionPress = useCallback((region: string) => {
    setSelectedRegion(region);
  }, []);

  const renderTemple = useCallback(({ item }: { item: any }) => (
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
        <Text className="text-base text-neutral-600">
          {item.region}
        </Text>
      </Card>
    </TouchableOpacity>
  ), [handleTemplePress]);

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
    ['전체', ...regions].map(region => renderRegionButton(region)), 
    [regions, renderRegionButton]
  );

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

      <FlatList
        data={filteredTemples}
        renderItem={renderTemple}
        keyExtractor={(item) => item.id}
        className="flex-1"
        ListHeaderComponent={
          <Text className="text-3xl font-light text-neutral-900 text-center my-6 mt-8">
            지역별 사찰
          </Text>
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

export default RegionTemplesScreen;


