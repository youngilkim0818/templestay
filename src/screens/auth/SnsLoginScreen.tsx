import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AuthService } from '../../services/authService';
import useUserStore from '../../store/userStore';
import { COLORS } from '../../constants/colors';

// Styled components for NativeWind


const { width } = Dimensions.get('window');

const SnsLoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { login } = useUserStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await AuthService.signInWithGoogle();
      Alert.alert(
        t('auth.googleLogin'), 
        t('auth.googleLoginInstructions'),
        [
          { 
            text: t('common.confirm'), 
            onPress: () => {
              // 로그인 완료 후 세션 확인
              checkAuthSession();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert(t('auth.loginFailed'), error.message || t('auth.googleLoginError'));
    } finally {
      setLoading(false);
    }
  };

  const checkAuthSession = async () => {
    try {
      const result = await AuthService.handleAuthCallback();
      if (result?.user) {
        const userProfile = await AuthService.getCurrentUser();
        if (userProfile) {
          login(userProfile);
          navigation.navigate('Main');
        }
      }
    } catch (error: any) {
      console.error('Session check error:', error);
    }
  };

  return (
    <View className="flex-1 bg-stone-100 items-center justify-center px-5">
      {/* 타이틀 */}
      <Text className="text-3xl font-bold text-sage-600 text-center mb-12 leading-9">
        {t('auth.welcomeToApp')}
      </Text>
      
      {/* 그래픽 원 */}
      <View className="w-50 h-50 rounded-full bg-white justify-center items-center mb-12 border-2 border-stone-200">
        <Text className="text-5xl mb-2">🏯</Text>
        <Text className="text-sm font-semibold text-neutral-600 text-center">
          {t('auth.findPeaceOfMind')}
        </Text>
      </View>
      
      {/* 이메일 로그인 버튼 (빠른 테스트용) */}
      <TouchableOpacity 
        className="w-full h-14 bg-sage-600 rounded-2xl justify-center items-center mb-6 active:bg-sage-700"
        onPress={() => navigation.navigate('Auth')}
        activeOpacity={0.8}
      >
        <Text className="text-lg font-semibold text-white">
          {t('auth.emailLogin')}
        </Text>
      </TouchableOpacity>
      
      {/* 구분선 */}
      <View className="flex-row items-center my-6 w-full">
        <View className="flex-1 h-px bg-stone-300" />
        <Text className="text-sm font-medium text-neutral-600 mx-4">
          {t('common.or')}
        </Text>
        <View className="flex-1 h-px bg-stone-300" />
      </View>
      
      {/* 구글 로그인 버튼 */}
      <TouchableOpacity 
        className={`w-full h-14 bg-white rounded-2xl justify-center items-center mb-4 border border-stone-200 active:bg-stone-50 ${loading ? 'opacity-60' : ''}`}
        onPress={handleGoogleLogin}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text className="text-base font-semibold text-neutral-700">
          {loading ? t('auth.googleLoggingIn') : t('auth.continueWithGoogle')}
        </Text>
      </TouchableOpacity>
      
      {/* 건너뛰기 */}
      <TouchableOpacity 
        className="mt-8 py-3 px-6"
        onPress={() => navigation.navigate('LanguagePreset')}
        activeOpacity={0.8}
      >
        <Text className="text-base font-medium text-neutral-600">
          {t('common.skip')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};



export default SnsLoginScreen; 