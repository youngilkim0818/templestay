import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { COLORS } from '../../constants/colors';

// Styled components for NativeWind


const { width } = Dimensions.get('window');

const LANGUAGES = [
  { key: 'en', label: 'English', flag: 'language-outline', description: 'English' },
  { key: 'ja', label: '日本語', flag: 'language-outline', description: 'Japanese' },
  { key: 'zh', label: '中文', flag: 'language-outline', description: 'Chinese' },
];

const LanguagePresetScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState<string>('en');

  const handleLanguageSelect = async (languageCode: string) => {
    setSelected(languageCode);
    try {
      await i18n.changeLanguage(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <View className="flex-1 bg-stone-100">
      {/* 상단 진행바 */}
      <View className="px-5 pt-3 pb-5">
        <View className="items-center">
          <View className="w-full h-1 bg-stone-200 rounded-sm mb-2">
            <View className="h-full bg-sage-600 rounded-sm" style={{ width: '25%' }} />
          </View>
          <View className="text-xs font-semibold text-neutral-600">1 / 4</View>
        </View>
      </View>

      {/* 타이틀 섹션 */}
      <View className="px-5 mb-10 items-center">
        <Text className="text-3xl font-bold text-sage-600 text-center mb-3">
          {t('language.selectLanguage')}
        </Text>
        <Text className="text-base font-medium text-neutral-600 text-center leading-6">
          {t('language.selectLanguageDescription')}
        </Text>
      </View>

      {/* 언어 선택 리스트 */}
      <View className="flex-1 px-5">
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.key}
            className={`bg-white rounded-2xl mb-3 border-2 ${
              selected === lang.key ? 'border-sage-600' : 'border-stone-200'
            }`}
            onPress={() => handleLanguageSelect(lang.key)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center p-5">
              <View className="w-12 h-12 rounded-xl bg-stone-100 justify-center items-center mr-4">
                <Ionicons name={lang.flag as any} size={24} color="#4A5D23" />
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-bold mb-1 ${
                  selected === lang.key ? 'text-sage-600' : 'text-neutral-700'
                }`}>
                  {lang.label}
                </Text>
                <Text className="text-sm font-medium text-neutral-600">
                  {lang.description}
                </Text>
              </View>
              {selected === lang.key && (
                <Ionicons name="checkmark-circle" size={24} color="#4A5D23" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 하단 버튼 */}
      <View className="px-5 pb-5">
        <TouchableOpacity 
          className="flex-row items-center justify-center bg-sage-600 rounded-2xl py-4"
          onPress={() => navigation.navigate('ProfilePreset')}
        >
          <Text className="text-lg font-bold text-white mr-2">
            {t('common.next')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// StyleSheet removed - using NativeWind classes

export default LanguagePresetScreen; 