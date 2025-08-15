import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ACTIVITY_OPTIONS = [
  { id: 1, text: 'Meditation / Zen practice' },
  { id: 2, text: 'Temple food experience' },
  { id: 3, text: 'Tea ceremony' },
  { id: 4, text: 'Temple tour and historical guide' },
  { id: 5, text: 'Other' },
];

const PreferredActivityScreen = ({ navigation }: any) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionSelect = (id: number) => {
    if (selectedOption === id) {
      // 이미 선택된 항목을 다시 클릭하면 해제
      setSelectedOption(null);
    } else {
      // 새로운 항목 선택
      setSelectedOption(id);
    }
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      navigation.navigate('Onboarding4');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <View className="flex-1 px-5 bg-stone-100">
        {/* 게이지바 */}
        <View className="py-6">
          <View className="w-full h-2 bg-stone-200 rounded-full">
            <View className="w-3/4 h-full bg-sage-600 rounded-full" />
          </View>
        </View>

        {/* 타이틀 섹션 */}
        <View className="py-8">
          <Text className="text-3xl font-bold text-neutral-900 text-center leading-10 mb-4">
            What type of activities do you prefer? (3/4)
          </Text>
        </View>

        {/* 선택지 */}
        <View className="flex-1">
          {ACTIVITY_OPTIONS.map((option) => {
            const isSelected = selectedOption === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                className={`bg-white rounded-4xl p-6 border-2 mb-5 ${
                  isSelected 
                    ? 'border-sage-600 bg-sage-100' 
                    : 'border-stone-200'
                }`}
                onPress={() => handleOptionSelect(option.id)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-start">
                  <Text className={`text-lg ${
                    isSelected ? 'font-bold text-sage-600' : 'font-semibold text-neutral-700'
                  }`}>
                    {option.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View className="px-7 pt-7 pb-8 bg-stone-100" style={{ height: 135, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <TouchableOpacity
          className={`flex-row items-center justify-center rounded-4xl py-6 px-6 border-2 ${
            selectedOption !== null
              ? 'bg-sage-600 active:bg-sage-700 border-sage-600'
              : 'bg-neutral-300 border-neutral-300'
          }`}
          onPress={handleNext}
          disabled={selectedOption === null}
        >
          <Text className={`text-lg font-semibold mr-2 ${
            selectedOption !== null ? 'text-white' : 'text-neutral-500'
          }`}>
            Next
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={selectedOption !== null ? '#FFFFFF' : '#9AA0A6'} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PreferredActivityScreen;
