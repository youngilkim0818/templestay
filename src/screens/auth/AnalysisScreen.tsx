import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const AnalysisScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const ANALYSIS_STEPS = [
    {
      title: t('analysis.collectingPreferences'),
      subtitle: t('analysis.analyzingInputData'),
      icon: 'analytics-outline',
    },
    {
      title: t('analysis.matchingTemples'),
      subtitle: t('analysis.matchingWithTemples'),
      icon: 'library-outline',
    },
    {
      title: t('analysis.generatingRecommendations'),
      subtitle: t('analysis.preparingPersonalized'),
      icon: 'sparkles-outline',
    },
  ];

  useEffect(() => {
    // 진행 애니메이션
    Animated.timing(progress, {
      toValue: (step + 1) * 33.33,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // 펄스 애니메이션
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    if (step < 2) {
      const timer = setTimeout(() => setStep(step + 1), 2000);
      return () => {
        clearTimeout(timer);
        pulseAnimation.stop();
      };
    } else {
      const timer = setTimeout(() => navigation.replace('AnalysisResult'), 1500);
      return () => {
        clearTimeout(timer);
        pulseAnimation.stop();
      };
    }
  }, [step, navigation, progress, pulseAnim]);

  const currentStep = ANALYSIS_STEPS[step];

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* 타이틀 섹션 */}
      <View className="pt-8 pb-12 px-5 items-center">
        <Text className="text-3xl font-bold text-sage-600 text-center mb-4">{t('analysis.aiCustomAnalysis')}</Text>
        <Text className="text-base font-medium text-neutral-600 text-center leading-6">
          {t('analysis.findingPerfectTemplestay')}
        </Text>
      </View>

      {/* 메인 분석 영역 */}
      <View className="flex-1 items-center justify-center px-5">
        {/* 중앙 아이콘 */}
        <Animated.View 
          style={{ transform: [{ scale: pulseAnim }] }}
          className="items-center justify-center mb-12"
        >
          <View className="relative items-center justify-center">
            <View className="w-24 h-24 rounded-full bg-sage-600 items-center justify-center">
              <Ionicons name={currentStep.icon as any} size={40} color="#FFFFFF" />
            </View>
            <View className="absolute w-32 h-32 rounded-full border-2 border-sage-300 opacity-30" />
            <View className="absolute w-40 h-40 rounded-full border border-sage-200 opacity-20" />
          </View>
        </Animated.View>

        {/* 진행률 표시 */}
        <View className="w-full mb-8">
          <View className="w-full h-2 bg-stone-200 rounded-full mb-3">
            <Animated.View 
              className="h-2 bg-sage-600 rounded-full"
              style={{ 
                width: progress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })
              }} 
            />
          </View>
          <Text className="text-lg font-bold text-sage-600 text-center">
            {Math.round((step + 1) * 33.33)}%
          </Text>
        </View>

        {/* 현재 단계 정보 */}
        <View className="items-center mb-12">
          <Text className="text-xl font-bold text-neutral-900 text-center mb-2">{currentStep.title}</Text>
          <Text className="text-base font-medium text-neutral-600 text-center leading-6">{currentStep.subtitle}</Text>
        </View>
      </View>

      {/* 하단 진행 도트 */}
      <View className="flex-row justify-center items-center mb-8 space-x-3">
        {ANALYSIS_STEPS.map((_, index) => (
          <View 
            key={index}
            className={`w-3 h-3 rounded-full ${
              index <= step ? 'bg-sage-600' : 'bg-stone-300'
            }`}
          />
        ))}
      </View>

      {/* 힌트 메시지 */}
      <View className="px-5 pb-8">
        <View className="bg-white rounded-2xl p-5 border border-stone-200">
          <Text className="text-sm font-semibold text-sage-600 mb-2">
            {t('analysis.didYouKnow')}
          </Text>
          <Text className="text-sm font-medium text-neutral-600 leading-5">
            {t('analysis.templestayHistory')}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// StyleSheet removed - using NativeWind classes

export default AnalysisScreen;