import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface OnboardingNextScreenProps {
  navigation: any;
  route: any;
}

const OnboardingNextScreen = ({ navigation, route }: OnboardingNextScreenProps) => {
  const { t } = useTranslation();
  const index = route?.params?.index ?? 2;
  const total = 3;

  const handleNext = () => {
    if (index < total) {
      navigation.push('Onboarding', { index: index + 1 });
    } else {
      navigation.replace('SnsLogin');
    }
  };

  const handleSkip = () => {
    navigation.replace('SnsLogin');
  };

  // 페이지별 콘텐츠
  const getPageContent = () => {
    switch (index) {
      case 1:
        return {
          title: t('onboarding.page1.title'),
          emoji: '🏯',
          description: t('onboarding.page1.description')
        };
      case 2:
        return {
          title: t('onboarding.page2.title'),
          emoji: '🗺️',
          description: t('onboarding.page2.description')
        };
      case 3:
        return {
          title: t('onboarding.page3.title'),
          emoji: '📅',
          description: t('onboarding.page3.description')
        };
      default:
        return {
          title: t('onboarding.page2.title'),
          emoji: '🗺️',
          description: t('onboarding.page2.description')
        };
    }
  };

  const content = getPageContent();

  return (
    <View className="flex-1 bg-stone-100 items-center relative">
      {/* Progress Bar - ZEN-TECH Style */}
      <View 
        className="flex-row mt-15 mb-10 justify-between"
        style={{ width: width * 0.8 }}
      >
        {[...Array(total)].map((_, i) => (
          <View
            key={i}
            className={`w-29 h-1.5 rounded-full ${
              i === index - 1 ? 'bg-sage-600' : 'bg-stone-300'
            }`}
          />
        ))}
      </View>
      
      {/* Title - ZEN-TECH Style */}
      <Text className="text-3xl font-semibold text-center text-neutral-900 mb-10 leading-10 px-5">
        {content.title}
      </Text>
      
      {/* Main Circle - ZEN-TECH Style */}
      <View className="w-82 h-82 rounded-full bg-white items-center justify-center mb-10 border border-stone-200">
        <Text className="text-6xl mb-3">{content.emoji}</Text>
        <Text className="text-base font-medium text-neutral-600 text-center px-4 leading-6">
          {content.description}
        </Text>
      </View>
      
      {/* Main Action Button - ZEN-TECH Style */}
      <TouchableOpacity 
        className="absolute bottom-22 bg-sage-600 rounded-3xl active:bg-sage-700"
        style={{
          left: width / 2 - 190,
          width: 381,
          height: 74,
        }}
        onPress={handleNext}
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-semibold text-white">
            {index === total ? t('onboarding.getStarted') : t('common.next')}
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Skip Button - ZEN-TECH Style */}
      <TouchableOpacity 
        className="absolute left-0 right-0 bottom-7 items-center z-10"
        onPress={handleSkip}
      >
        <Text className="font-medium text-base text-center text-neutral-600">
          {t('onboarding.skip')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// StyleSheet removed - using NativeWind classes

export default OnboardingNextScreen;