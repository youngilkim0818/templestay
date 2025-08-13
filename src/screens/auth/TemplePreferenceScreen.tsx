import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TEMPLE_PREFERENCES = [
  { id: 1, title: '명상과 참선', icon: 'body-outline', description: '마음의 평화를 찾는 시간' },
  { id: 2, title: '사찰음식 체험', icon: 'restaurant-outline', description: '건강한 사찰 요리 배우기' },
  { id: 3, title: '108배 수행', icon: 'hand-left-outline', description: '전통적인 참회 수행법' },
  { id: 4, title: '차담 시간', icon: 'cafe-outline', description: '스님과의 대화와 차 마시기' },
  { id: 5, title: '새벽 예불', icon: 'sunny-outline', description: '이른 아침 기도와 명상' },
  { id: 6, title: '숲길 산책', icon: 'trail-sign-outline', description: '자연 속에서 걷기 명상' },
  { id: 7, title: '경전 필사', icon: 'create-outline', description: '집중력과 마음 수양' },
  { id: 8, title: '연꽃등 만들기', icon: 'flower-outline', description: '전통 공예 체험' },
  { id: 9, title: '울력(공동작업)', icon: 'people-outline', description: '함께하는 일의 즐거움' },
  { id: 10, title: '석탑 쌓기', icon: 'library-outline', description: '소원을 담은 돌탑 만들기' },
  { id: 11, title: '범종 타종', icon: 'notifications-outline', description: '신성한 종소리 체험' },
  { id: 12, title: '일출 감상', icon: 'partly-sunny-outline', description: '산사에서 맞는 새벽' },
];

const TemplePreferenceScreen = ({ navigation }: any) => {
  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([]);

  const togglePreference = (id: number) => {
    setSelectedPreferences(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    navigation.navigate('Analysis');
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* 상단 진행바 */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-5">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
        <View className="items-center flex-1 mx-5">
          <View className="w-full h-1 bg-stone-200 rounded-sm mb-2">
            <View className="h-full bg-sage-600 rounded-sm" style={{ width: '100%' }} />
          </View>
          <Text className="text-xs font-semibold text-neutral-600">4 / 4</Text>
        </View>
        <View className="w-6" />
      </View>

      {/* 타이틀 섹션 */}
      <View className="px-5 mb-5 items-center">
        <Text className="text-3xl font-bold text-sage-600 text-center mb-3">선호하는 체험을 선택해주세요</Text>
        <Text className="text-base font-medium text-neutral-600 text-center leading-6 mb-4">
          관심있는 활동을 선택하시면{"\n"}맞춤형 템플스테이를 추천해드려요
        </Text>
        <View className="bg-stone-50 rounded-xl px-4 py-3 border border-stone-200">
          <Text className="text-sm font-semibold text-sage-600 text-center">
            {selectedPreferences.length}개 선택됨
          </Text>
          <Text className="text-xs font-medium text-neutral-500 text-center mt-1">
            (3개 이상 선택하시면 더 정확한 추천이 가능해요)
          </Text>
        </View>
      </View>

      {/* 체험 프로그램 리스트 */}
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 20 }} 
        showsVerticalScrollIndicator={false}
      >
        {TEMPLE_PREFERENCES.map((pref) => {
          const selected = selectedPreferences.includes(pref.id);
          return (
            <TouchableOpacity
              key={pref.id}
              className={`bg-white rounded-2xl mb-3 border-2 ${
                selected ? 'border-sage-600' : 'border-stone-200'
              }`}
              onPress={() => togglePreference(pref.id)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center p-5">
                <View className={`w-12 h-12 rounded-xl justify-center items-center mr-4 ${
                  selected ? 'bg-sage-100' : 'bg-stone-100'
                }`}>
                  <Ionicons name={pref.icon as any} size={24} color={selected ? '#4A5D23' : '#6B7280'} />
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-bold mb-1 ${
                    selected ? 'text-sage-600' : 'text-neutral-700'
                  }`}>
                    {pref.title}
                  </Text>
                  <Text className="text-sm font-medium text-neutral-600">
                    {pref.description}
                  </Text>
                </View>
                {selected && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color="#4A5D23"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="p-5 border-t border-stone-200 bg-white">
        <TouchableOpacity 
          className={`flex-row items-center justify-center rounded-2xl py-4 px-6 ${
            selectedPreferences.length > 0 
              ? 'bg-sage-600 active:bg-sage-700' 
              : 'bg-neutral-300'
          }`}
          onPress={handleNext}
        >
          <Text className={`text-lg font-semibold mr-2 ${
            selectedPreferences.length > 0 ? 'text-white' : 'text-neutral-500'
          }`}>
            {selectedPreferences.length >= 3 ? '맞춤 분석하기' : '다음으로'}
          </Text>
          <Ionicons 
            name={selectedPreferences.length >= 3 ? "analytics" : "arrow-forward"}
            size={20} 
            color={selectedPreferences.length > 0 ? '#FFFFFF' : '#9AA0A6'} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// StyleSheet removed - using NativeWind classes

export default TemplePreferenceScreen;