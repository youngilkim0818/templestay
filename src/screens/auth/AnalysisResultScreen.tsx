import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../../constants/colors';

// Styled components for NativeWind


const { width } = Dimensions.get('window');

const getAnalysisResults = (t: any) => ({
  type: t('analysis.result.peaceSeekerType'),
  icon: '🧘‍♂️',
  description: t('analysis.result.peaceSeekerDescription'),
  characteristics: [
    t('analysis.result.characteristics.meditation'),
    t('analysis.result.characteristics.quietTime'),
    t('analysis.result.characteristics.deepConversation'),
  ],
  recommendedTemples: [
    { name: t('analysis.result.temples.bulguksa.name'), location: t('analysis.result.temples.bulguksa.location'), reason: t('analysis.result.temples.bulguksa.reason') },
    { name: t('analysis.result.temples.haeinsa.name'), location: t('analysis.result.temples.haeinsa.location'), reason: t('analysis.result.temples.haeinsa.reason') },
    { name: t('analysis.result.temples.songgwangsa.name'), location: t('analysis.result.temples.songgwangsa.location'), reason: t('analysis.result.temples.songgwangsa.reason') },
  ],
});

const AnalysisResultScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // 페이드인 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, slideAnim]);

  const handleStartJourney = () => {
    navigation.replace('Main');
  };

  return (
    <View className="flex-1 bg-stone-100">
      <Animated.View 
        className="flex-1 px-5"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* 성공 헤더 */}
        <View className="items-center pt-10 mb-8">
          <View className="mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
          </View>
          <Text className="text-3xl font-bold text-sage-600 mb-2">
            {t('analysis.result.analysisComplete')}
          </Text>
          <Text className="text-base font-medium text-neutral-600 text-center">
            {t('analysis.result.profileCompleted')}
          </Text>
        </View>

        {/* 분석 결과 카드 */}
        <View className="bg-white rounded-2xl p-6 mb-8 border border-stone-200">
          <View className="flex-row items-center mb-6">
            <Text className="text-5xl mr-4">{getAnalysisResults(t).icon}</Text>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-sage-600 mb-1">
                {getAnalysisResults(t).type}
              </Text>
              <Text className="text-base font-medium text-neutral-600 leading-6">
                {getAnalysisResults(t).description}
              </Text>
            </View>
          </View>

          {/* 특성 */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-sage-600 mb-3">
              {t('analysis.result.yourCharacteristics')}
            </Text>
            {getAnalysisResults(t).characteristics.map((characteristic, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Ionicons name="leaf" size={16} color="#FF6B6B" />
                <Text className="text-sm font-medium text-neutral-700 ml-2 leading-5">
                  {characteristic}
                </Text>
              </View>
            ))}
          </View>

          {/* 추천 사찰 */}
          <View>
            <Text className="text-lg font-bold text-sage-600 mb-3">
              {t('analysis.result.recommendedTemples')}
            </Text>
            {getAnalysisResults(t).recommendedTemples.map((temple, index) => (
              <View key={index} className="bg-stone-50 rounded-xl p-4 mb-3 border-l-4 border-coral-400">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-base font-bold text-neutral-700">
                    {temple.name}
                  </Text>
                  <Text className="text-xs font-medium text-neutral-600">
                    📍 {temple.location}
                  </Text>
                </View>
                <Text className="text-sm font-medium text-neutral-600 italic">
                  {temple.reason}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 하단 액션 */}
        <View className="flex-1 justify-end pb-10">
          <TouchableOpacity 
            className="flex-row items-center justify-center bg-sage-600 rounded-2xl py-5 mb-4 active:bg-sage-700"
            onPress={handleStartJourney}
          >
            <Text className="text-lg font-bold text-white mr-2">
              {t('analysis.result.startJourney')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
          
          <Text className="text-sm font-medium text-neutral-600 text-center">
            {t('analysis.result.autoRedirect')}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};



export default AnalysisResultScreen; 