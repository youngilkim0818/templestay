import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

import MainTabNavigator from './MainTabNavigator';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ChangePasswordScreen from '../screens/main/mypage/ChangePasswordScreen';

import Onboarding1Screen from '../screens/auth/Onboarding1';
import Onboarding2Screen from '../screens/auth/Onboarding2';
import Onboarding3Screen from '../screens/auth/Onboarding3';
import Onboarding4Screen from '../screens/auth/Onboarding4';
import Onboarding5Screen from '../screens/auth/Onboarding5';
import TempleStackNavigator from './TempleStackNavigator';
import useUserStore from '../store/userStore';
import { COLORS } from '../constants/colors';
import SplashScreen from '../screens/SplashScreen';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ChangePassword: undefined;
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Onboarding4: undefined;
  Onboarding5: undefined;
  Main: undefined;
  TempleStack: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  // Deep link 처리 for email confirmation
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (__DEV__) {
        console.log('Deep link received:', url);
      }
      
      if (url.includes('/auth/callback') || url.includes('/auth/email-confirmed')) {
        const urlParams = new URL(url);
        const accessToken = urlParams.searchParams.get('access_token');
        const refreshToken = urlParams.searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Deep link auth error:', error);
            } else {
              if (__DEV__) {
                console.log('Deep link auth success:', data.user?.email);
              }
            }
          } catch (error) {
            console.error('Deep link session error:', error);
          }
        }
      }
    };

    // 딥링크 리스너
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // 앱이 딥링크로 열린 경우 처리
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={'Splash'}
    >
      {/* Splash - 앱 시작 시 3초 표시 후 다음 화면으로 */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      

      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

      <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
      <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
      <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />
      <Stack.Screen name="Onboarding4" component={Onboarding4Screen} />
      <Stack.Screen name="Onboarding5" component={Onboarding5Screen} />
      
      {/* Main App */}
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="TempleStack" component={TempleStackNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator; 