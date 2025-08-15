import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MainTabNavigator from './MainTabNavigator';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

import Onboarding1Screen from '../screens/auth/Onboarding1';
import Onboarding2Screen from '../screens/auth/Onboarding2';
import Onboarding3Screen from '../screens/auth/Onboarding3';
import Onboarding4Screen from '../screens/auth/Onboarding4';
import Onboarding5Screen from '../screens/auth/Onboarding5';
import TempleStackNavigator from './TempleStackNavigator';
import useUserStore from '../store/userStore';
import { COLORS } from '../constants/colors';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  // 스플래시 화면에서 3초 대기 후 다음 화면으로 이동

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={'Splash'}
    >
      {/* Splash - 앱 시작 시 3초 표시 후 다음 화면으로 */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      

      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

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