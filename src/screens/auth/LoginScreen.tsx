import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { validateEmail } from '../../utils/validators';
import { AuthService } from '../../services/authService';
import useUserStore from '../../store/userStore';
import { ZEN_TECH_THEME } from '../../constants/colors';

const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useUserStore((state) => state.login);

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return;
    }
    if (!password) {
      Alert.alert(t('common.error'), t('auth.enterPassword'));
      return;
    }

    setLoading(true);
    try {
      const { user } = await AuthService.signIn(email, password);
      if (user) {
        const userProfile = await AuthService.getCurrentUser();
        if (userProfile) {
          login(userProfile);
          navigation.navigate('Main');
        }
      }
    } catch (error: any) {
      Alert.alert(t('auth.loginFailed'), error.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="pt-12 pb-8 px-6">
            <Text className="text-4xl font-bold text-sage-600 mb-2">
              {t('auth.welcome')}
            </Text>
            <Text className="text-lg text-neutral-600">
              {t('auth.loginSubtitle')}
            </Text>
          </View>

          {/* Login Form */}
          <View className="flex-1 px-6">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-sage-700 mb-3">
                {t('auth.email')}
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-4 bg-white border-2 border-stone-200 rounded-2xl text-base text-neutral-800 focus:border-sage-500"
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor={ZEN_TECH_THEME.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <Text className="text-base font-semibold text-sage-700 mb-3">
                {t('auth.password')}
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full h-14 px-4 pr-12 bg-white border-2 border-stone-200 rounded-2xl text-base text-neutral-800 focus:border-sage-500"
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor={ZEN_TECH_THEME.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={22} 
                    color={ZEN_TECH_THEME.text.secondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="w-full h-14 bg-sage-600 rounded-2xl justify-center items-center mb-6"
              onPress={handleLogin}
              disabled={loading}
              style={{
                shadowColor: ZEN_TECH_THEME.brand.sage,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-white text-lg font-bold">
                {loading ? t('common.loading') : t('auth.login')}
              </Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View className="mb-8">
              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-stone-300" />
                <Text className="mx-4 text-sm text-neutral-500">
                  {t('auth.orLoginWith')}
                </Text>
                <View className="flex-1 h-px bg-stone-300" />
              </View>

              {/* Social Buttons */}
              <View className="flex-row justify-center space-x-4">
                <TouchableOpacity 
                  className="w-14 h-14 bg-white rounded-2xl justify-center items-center border border-stone-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="logo-google" size={24} color="#DB4437" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="w-14 h-14 bg-white rounded-2xl justify-center items-center border border-stone-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons name="logo-apple" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center pb-8">
              <Text className="text-neutral-600 text-base">
                {t('auth.noAccount')} 
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('SignUp')}
                className="ml-1"
              >
                <Text className="text-sage-600 text-base font-semibold">
                  {t('auth.signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;