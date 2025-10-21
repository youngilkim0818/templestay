import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const ACTIVITY_OPTIONS = [
  { id: 1, text: 'Meditation' },
  { id: 2, text: 'Temple food experience' },
  { id: 3, text: 'Tea ceremony' },
  { id: 4, text: 'Temple tour' },
  { id: 5, text: 'Other' },
];

const PreferredActivityScreen = ({ navigation }: any) => {
  const screen = Dimensions.get('window');
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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      <View style={{ flex: 1, paddingHorizontal: screen.width * 0.05, backgroundColor: COLORS.background.secondary }}>
        {/* 게이지바 */}
        <View style={{ paddingVertical: screen.height * 0.03 }}>
          <View style={{ width: '100%', height: screen.height * 0.008, backgroundColor: '#E7E5E4', borderRadius: screen.height * 0.004 }}>
            <View style={{ width: '75%', height: '100%', backgroundColor: COLORS.brand.sage, borderRadius: screen.height * 0.004 }} />
          </View>
        </View>

        {/* 타이틀 섹션 - 반응형 크기 */}
        <View style={{ paddingVertical: screen.height * 0.01 }}>
          <Text style={{ 
            fontSize: Math.max(screen.width * 0.06, 18), 
            fontWeight: 'bold', 
            color: COLORS.text.primary, 
            textAlign: 'center', 
            lineHeight: Math.max(screen.width * 0.07, 22), 
            marginBottom: 0 
          }}>
            What type of activities {'\n'}do you prefer? (3/4)
          </Text>
        </View>

        {/* 선택지 - 반응형 크기로 조정 */}
        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: screen.height * 0.02, marginTop: -screen.height * 0.08 }}>
          {ACTIVITY_OPTIONS.map((option) => {
            const isSelected = selectedOption === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: screen.width * 0.08,
                  paddingVertical: screen.height * 0.02,
                  paddingHorizontal: screen.width * 0.05,
                  borderWidth: 2,
                  marginVertical: screen.height * 0.012,
                  borderColor: isSelected ? COLORS.brand.sage : '#E7E5E4',
                  minHeight: screen.height * 0.08,
                  justifyContent: 'center',
                }}
                onPress={() => handleOptionSelect(option.id)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Text style={{
                    fontSize: Math.max(screen.width * 0.035, 14),
                    fontWeight: isSelected ? 'bold' : '600',
                    color: isSelected ? COLORS.brand.sage : COLORS.text.secondary,
                    textAlign: 'left',
                  }}>
                    {option.text}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 하단 버튼 - 동적 높이 조정 */}
      <View style={{ 
        paddingHorizontal: screen.width * 0.07, 
        paddingTop: screen.height * 0.03, 
        paddingBottom: Math.max(screen.height * 0.04, 20), 
        backgroundColor: COLORS.background.secondary, 
        minHeight: Math.max(screen.height * 0.12, 80), 
        position: 'absolute', 
        bottom: screen.height * 0.02, 
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

export default PreferredActivityScreen;
