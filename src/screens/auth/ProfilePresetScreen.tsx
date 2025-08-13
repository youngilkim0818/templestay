import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const ProfilePresetScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);

  const handleDone = () => {
    if (name.trim()) {
      navigation.navigate('LocationPreset');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* 상단 진행바 */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
        <View className="flex-1 items-center mx-6">
          <View className="w-full h-2 bg-stone-200 rounded-full">
            <View className="w-1/2 h-full bg-sage-600 rounded-full" />
          </View>
          <Text className="text-xs font-semibold text-sage-600 mt-2">{t('onboarding.progress.step2of4')}</Text>
        </View>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-5">
        {/* 타이틀 섹션 */}
        <View className="py-8">
          <Text className="text-3xl font-light text-sage-600 leading-10 mb-4">
            {t('onboarding.profile.title')}
          </Text>
          <Text className="text-base text-neutral-600 leading-6">
            {t('onboarding.profile.subtitle')}
          </Text>
        </View>

        {/* 프로필 사진 섹션 */}
        <View className="items-center mb-8">
          <View className="relative mb-6">
            <View className="w-24 h-24 rounded-full bg-white border-4 border-stone-200 justify-center items-center">
              <Ionicons name="person" size={48} color="#9AA0A6" />
            </View>
            <TouchableOpacity className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-sage-600 justify-center items-center border-2 border-white">
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="items-center">
            <Text className="text-base font-semibold text-sage-600 mb-1">{t('onboarding.profile.addPhoto')}</Text>
            <Text className="text-sm text-neutral-500">{t('onboarding.profile.addPhotoLater')}</Text>
          </TouchableOpacity>
        </View>

        {/* 이름 입력 섹션 */}
        <View className="flex-1">
          <Text className="text-lg font-semibold text-sage-600 mb-4">{t('onboarding.profile.name')}</Text>
          <View className="flex-row items-center bg-white rounded-xl p-4 border border-stone-200 mb-3">
            <TextInput
              className="flex-1 text-base text-neutral-900"
              value={name}
              onChangeText={setName}
              placeholder={t('onboarding.profile.namePlaceholder')}
              placeholderTextColor="#9AA0A6"
              autoFocus={false}
              returnKeyType="done"
              onSubmitEditing={handleDone}
            />
            {name.length > 0 && (
              <TouchableOpacity onPress={() => setName('')}>
                <Ionicons name="close-circle" size={20} color="#9AA0A6" />
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-sm text-neutral-500 leading-5">
            {t('onboarding.profile.nameHint')}
          </Text>
        </View>
      </View>

      {/* 하단 버튼 */}
      <View className="p-5 border-t border-stone-200 bg-white">
        <TouchableOpacity 
          className={`flex-row items-center justify-center rounded-2xl py-4 px-6 ${
            name.trim() 
              ? 'bg-sage-600 active:bg-sage-700' 
              : 'bg-neutral-300'
          }`}
          onPress={handleDone}
          disabled={!name.trim()}
        >
          <Text className={`text-lg font-semibold mr-2 ${
            name.trim() ? 'text-white' : 'text-neutral-500'
          }`}>
            {t('common.next')}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={name.trim() ? '#FFFFFF' : '#9AA0A6'} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// StyleSheet removed - using NativeWind classes

export default ProfilePresetScreen; 