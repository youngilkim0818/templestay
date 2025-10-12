import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '../../store/userStore';
import { COLORS } from '../../constants/colors';

const FACTOR_OPTIONS = [
  { id: 1, text: 'Quiet environment' },
  { id: 2, text: 'Natural scenery' },
  { id: 3, text: 'Variety of activities' },
  { id: 4, text: 'Transportation accessibility' },
  { id: 5, text: 'Price' },
];

const ImportantFactorScreen = ({ navigation }: any) => {
  const screen = Dimensions.get('window');
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
        setTimeout(async () => {
          setIsLoading(false);
          
          if (isGuestMode) {
            // 게스트 모드일 때는 온보딩 완료 처리하고 메인으로 이동
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            // 온보딩 진행 상태 제거
            await AsyncStorage.removeItem('isOnboardingInProgress');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      <View style={{ flex: 1, paddingHorizontal: screen.width * 0.05, backgroundColor: COLORS.background.secondary }}>
        {/* 게이지바 */}
        <View style={{ paddingVertical: screen.height * 0.03 }}>
          <View style={{ width: '100%', height: screen.height * 0.008, backgroundColor: '#E7E5E4', borderRadius: screen.height * 0.004 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: COLORS.brand.sage, borderRadius: screen.height * 0.004 }} />
          </View>
        </View>

        {/* 타이틀 섹션 */}
        <View style={{ paddingVertical: screen.height * 0.04 }}>
          <Text style={{ 
            fontSize: screen.width * 0.07, 
            fontWeight: 'bold', 
            color: COLORS.text.primary, 
            textAlign: 'center', 
            lineHeight: screen.width * 0.085, 
            marginBottom: screen.height * 0.02 
          }}>
            Most important factor {'\n'}when joining a program (4/4)
          </Text>
        </View>

        {/* 선택지 */}
        <View style={{ flex: 1 }}>
          {FACTOR_OPTIONS.map((option) => {
            const isSelected = selectedOption === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: screen.width * 0.1,
                  padding: screen.width * 0.06,
                  borderWidth: 2,
                  marginBottom: screen.height * 0.025,
                  borderColor: isSelected ? COLORS.brand.sage : '#E7E5E4',
                }}
                onPress={() => handleOptionSelect(option.id)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Text style={{
                    fontSize: screen.width * 0.04,
                    fontWeight: isSelected ? 'bold' : '600',
                    color: isSelected ? COLORS.brand.sage : COLORS.text.secondary,
                  }}>
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
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.background.secondary, alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: screen.width * 0.24, height: screen.width * 0.24, backgroundColor: COLORS.brand.sage, borderRadius: screen.width * 0.12, alignItems: 'center', justifyContent: 'center', marginBottom: screen.height * 0.03 }}>
              <Ionicons name="checkmark" size={screen.width * 0.12} color="white" />
            </View>
            <Text style={{ fontSize: screen.width * 0.1, fontWeight: 'bold', color: COLORS.brand.sage, marginBottom: screen.height * 0.015 }}>
              Survey Complete!
            </Text>
            <Text style={{ fontSize: screen.width * 0.05, color: COLORS.text.secondary, textAlign: 'center' }}>
              Thank you for your responses
            </Text>
            <View style={{ marginTop: screen.height * 0.04, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: screen.width * 0.045, color: COLORS.text.tertiary, marginRight: screen.width * 0.03 }}>Moving to next step</Text>
              <View style={{ flexDirection: 'row', gap: screen.width * 0.02 }}>
                <View style={{ width: screen.width * 0.03, height: screen.width * 0.03, borderRadius: screen.width * 0.015, backgroundColor: dotIndex === 0 ? COLORS.brand.sage : COLORS.brand.sageLighter }}></View>
                <View style={{ width: screen.width * 0.03, height: screen.width * 0.03, borderRadius: screen.width * 0.015, backgroundColor: dotIndex === 1 ? COLORS.brand.sage : COLORS.brand.sageLighter }}></View>
                <View style={{ width: screen.width * 0.03, height: screen.width * 0.03, borderRadius: screen.width * 0.015, backgroundColor: dotIndex === 2 ? COLORS.brand.sage : COLORS.brand.sageLighter }}></View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 하단 버튼 */}
      <View style={{ 
        paddingHorizontal: screen.width * 0.07, 
        paddingTop: screen.height * 0.04, 
        paddingBottom: screen.height * 0.04, 
        backgroundColor: COLORS.background.secondary, 
        height: screen.height * 0.17, 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0 
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: screen.width * 0.1,
            paddingVertical: screen.width * 0.05,
            paddingHorizontal: screen.width * 0.06,
            borderWidth: 2,
            backgroundColor: selectedOption !== null ? COLORS.brand.sage : '#D1D5DB',
            borderColor: selectedOption !== null ? COLORS.brand.sage : '#D1D5DB',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={handleNext}
          disabled={selectedOption === null}
        >
          <Text style={{
            fontSize: screen.width * 0.04,
            fontWeight: '600',
            marginRight: screen.width * 0.02,
            color: selectedOption !== null ? '#FFFFFF' : '#9CA3AF',
          }}>
            Next
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={screen.width * 0.05} 
            color={selectedOption !== null ? '#FFFFFF' : '#9CA3AF'} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ImportantFactorScreen;
