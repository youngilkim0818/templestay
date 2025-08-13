import React, { useState } from 'react';
import { View, Text, Alert, Switch, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import useUserStore from '../../store/userStore';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { validateEmail, validatePassword } from '../../utils/validators';
import { User } from '../../types';
import { AuthService } from '../../services/authService';
import { COLORS } from '../../constants/colors';

// Styled components for NativeWind


const SignUpScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useUserStore((state) => state.login);

  const handleSignUp = async () => {
    if (!name || !phone || !email || !password) {
        Alert.alert(t('common.error'), t('auth.fillAllFields'));
        return;
    }
    if (!validateEmail(email)) {
        Alert.alert(t('common.error'), t('auth.invalidEmail'));
        return;
    }
    if (!validatePassword(password)) {
        Alert.alert(t('common.error'), t('auth.passwordMinLength'));
        return;
    }
    if (!agreedToTerms) {
        Alert.alert(t('common.error'), t('auth.agreeToTerms'));
        return;
    }

    setLoading(true);
    try {
      const { user } = await AuthService.signUp(email, password, {
        name,
        phoneNumber: phone,
      });
      
      if (user) {
        Alert.alert(t('common.success'), t('auth.signUpComplete'), [
          { text: t('common.confirm'), onPress: () => navigation.navigate('LanguagePreset') }
        ]);
      }
    } catch (error: any) {
      Alert.alert(t('auth.signUpFailed'), error.message || t('auth.signUpError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-stone-100" edges={['top', 'left', 'right']}>
      <View 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo/Brand Section */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 bg-sage-600 rounded-3xl justify-center items-center mb-6">
                <Ionicons name="person-add-outline" size={40} color="white" />
              </View>
              <Text className="text-3xl font-light text-neutral-900 mb-2">
                {t('auth.signUp')}
              </Text>
              <Text className="text-base text-neutral-600 text-center font-medium">
                Start your first templestay journey
              </Text>
            </View>

            {/* Form Section */}
            <View className="mb-6">
              <View className="mb-4">
                <CustomInput 
                  placeholder={t('auth.name')} 
                  value={name} 
                  onChangeText={setName}
                  className="bg-white border-stone-200 rounded-2xl"
                />
              </View>
              
              <View className="mb-4">
                <CustomInput 
                  placeholder={t('auth.phoneNumber')} 
                  value={phone} 
                  onChangeText={setPhone} 
                  keyboardType="phone-pad"
                  className="bg-white border-stone-200 rounded-2xl"
                />
              </View>
              
              <View className="mb-4">
                <CustomInput 
                  placeholder={t('auth.email')} 
                  value={email} 
                  onChangeText={setEmail} 
                  keyboardType="email-address" 
                  autoCapitalize="none"
                  className="bg-white border-stone-200 rounded-2xl"
                />
              </View>
              
              <View className="mb-6">
                <CustomInput 
                  placeholder={t('auth.password')} 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry
                  className="bg-white border-stone-200 rounded-2xl"
                />
              </View>
              
              {/* Terms Agreement */}
              <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 mb-6 border border-stone-200">
                <Text className="text-sm text-neutral-700 font-medium flex-1 mr-3">
                  {t('auth.agreeToTermsText')}
                </Text>
                <Switch 
                  value={agreedToTerms} 
                  onValueChange={setAgreedToTerms}
                  trackColor={{ false: '#E8EAED', true: '#4A5D23' }}
                  thumbColor={agreedToTerms ? '#ffffff' : '#ffffff'}
                />
              </View>
              
              {/* Sign Up Button */}
              <CustomButton 
                title={loading ? t('auth.signingUp') : t('auth.signUpButton')} 
                onPress={handleSignUp} 
                disabled={loading || !agreedToTerms}
                className={`rounded-2xl py-4 ${
                  loading || !agreedToTerms ? 'bg-neutral-300' : 'bg-sage-600'
                }`}
              />
            </View>

            {/* Back to Login */}
            <View className="items-center">
              <Text className="text-base text-neutral-600 font-medium mb-2">
                Already have an account?
              </Text>
              <CustomButton 
                title={t('auth.backToLogin')} 
                onPress={() => navigation.goBack()}
                variant="secondary"
                className="bg-white border border-sage-600 rounded-2xl py-3 px-8"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};



export default SignUpScreen; 