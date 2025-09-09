import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '../../store/userStore';

const FACTOR_OPTIONS = [
  { id: 1, text: 'Quiet environment' },
  { id: 2, text: 'Natural scenery' },
  { id: 3, text: 'Variety of activities' },
  { id: 4, text: 'Transportation accessibility' },
  { id: 5, text: 'Price' },
];

const ImportantFactorScreen = ({ navigation }: any) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dotIndex, setDotIndex] = useState<number>(0);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  // 게스트 모드 확인
  useEffect(() => {
    const checkGuestMode = async () => {
      try {
        const guestMode = await AsyncStorage.getItem('isGuestMode');
        if (guestMode === 'true') {
          setIsGuestMode(true);
        }
      } catch (error) {
        console.error('게스트 모드 확인 실패:', error);
      }
    };
    checkGuestMode();
  }, []);

  const handleOptionSelect = (id: number) => {
    if (selectedOption === id) {
      // 이미 선택된 항목을 다시 클릭하면 해제
      setSelectedOption(null);
    } else {
      // 새로운 항목 선택
      setSelectedOption(id);
    }
  };

      const handleNext = async () => {
      if (selectedOption !== null) {
        setIsLoading(true);
        setDotIndex(0);
        
        // 4초 대기
        setTimeout(() => {
          setIsLoading(false);
          
          if (isGuestMode) {
            // 게스트 모드일 때는 온보딩 완료 처리하고 메인으로 이동
            AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            navigation.replace('Main');
          } else {
            // 일반 사용자는 온보딩5로 이동
            navigation.navigate('Onboarding5');
          }
        }, 4000);
      }
    };

  // 점들 애니메이션
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setDotIndex((prev) => (prev + 1) % 3);
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <View className="flex-1 px-5 bg-stone-100">
        {/* 게이지바 */}
        <View className="py-6">
          <View className="w-full h-2 bg-stone-200 rounded-full">
            <View className="w-full h-full bg-sage-600 rounded-full" />
          </View>
        </View>

        {/* 타이틀 섹션 */}
        <View className="py-8">
          <Text className="text-3xl font-bold text-neutral-900 text-center leading-10 mb-4">
          Most important factor {'\n'}when joining a program (4/4)
          </Text>
        </View>

        {/* 선택지 */}
        <View className="flex-1">
          {FACTOR_OPTIONS.map((option) => {
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

      {/* 로딩 화면 */}
      {isLoading && (
        <View className="absolute inset-0 bg-stone-100 items-center justify-center z-50">
          <View className="items-center">
            <View className="w-24 h-24 bg-sage-600 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark" size={48} color="white" />
            </View>
            <Text className="text-4xl font-bold text-sage-600 mb-3">
              Survey Complete!
            </Text>
            <Text className="text-xl text-stone-600 text-center">
              Thank you for your responses
            </Text>
            <View className="mt-8 flex-row items-center">
              <Text className="text-lg text-stone-500 mr-3">Moving to next step</Text>
              <View className="flex-row space-x-2">
                <View className={`w-3 h-3 rounded-full ${dotIndex === 0 ? 'bg-sage-600' : 'bg-sage-300'}`}></View>
                <View className={`w-3 h-3 rounded-full ${dotIndex === 1 ? 'bg-sage-600' : 'bg-sage-300'}`}></View>
                <View className={`w-3 h-3 rounded-full ${dotIndex === 2 ? 'bg-sage-600' : 'bg-sage-300'}`}></View>
              </View>
            </View>
          </View>
        </View>
      )}

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

export default ImportantFactorScreen;
