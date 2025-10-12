import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';

const EXPERIENCE_OPTIONS = [
  { id: 0, text: 'Never' },
  { id: 1, text: 'Once' },
  { id: 2, text: '2 times' },
  { id: 3, text: '3 times' },
  { id: 4, text: 'More than 4 times' },
];

const TemplestayExperienceScreen = ({ navigation }: any) => {
  const screen = Dimensions.get('window');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // 온보딩 진행 상태 설정
  useEffect(() => {
    const setOnboardingInProgress = async () => {
      await AsyncStorage.setItem('isOnboardingInProgress', 'true');
    };
    setOnboardingInProgress();
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

  const handleNext = () => {
    if (selectedOption !== null) {
      navigation.navigate('Onboarding2');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      <View style={{ flex: 1, paddingHorizontal: screen.width * 0.05, backgroundColor: COLORS.background.secondary }}>
        {/* 게이지바 */}
        <View style={{ paddingVertical: screen.height * 0.03 }}>
          <View style={{ width: '100%', height: screen.height * 0.008, backgroundColor: '#E7E5E4', borderRadius: screen.height * 0.004 }}>
            <View style={{ width: '25%', height: '100%', backgroundColor: COLORS.brand.sage, borderRadius: screen.height * 0.004 }} />
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
            Have you experienced {'\n'} templestay before? (1/4)
          </Text>
        </View>

        {/* 선택지 */}
        <View style={{ flex: 1 }}>
          {EXPERIENCE_OPTIONS.map((option, index) => {
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

export default TemplestayExperienceScreen;
