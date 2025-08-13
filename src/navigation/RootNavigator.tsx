import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import OnboardingNextScreen from '../screens/onboarding/OnboardingNextScreen';
import SnsLoginScreen from '../screens/auth/SnsLoginScreen';
import LanguagePresetScreen from '../screens/auth/LanguagePresetScreen';
import ProfilePresetScreen from '../screens/auth/ProfilePresetScreen';
import LocationPresetScreen from '../screens/auth/LocationPresetScreen';
import TemplePreferenceScreen from '../screens/auth/TemplePreferenceScreen';
import AnalysisScreen from '../screens/auth/AnalysisScreen';
import AnalysisResultScreen from '../screens/auth/AnalysisResultScreen';
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
      {/* Auth - Start here for login/signup */}
      <Stack.Screen name="Auth" component={AuthNavigator} />
      
      {/* Onboarding Flow */}
      <Stack.Screen name="Onboarding">
        {(props) => <OnboardingScreen {...props} onComplete={async () => {
          await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
          props.navigation.replace('SnsLogin');
        }} />}
      </Stack.Screen>
      <Stack.Screen name="OnboardingNext" component={OnboardingNextScreen} />
      <Stack.Screen name="SnsLogin" component={SnsLoginScreen} />
      <Stack.Screen name="LanguagePreset" component={LanguagePresetScreen} />
      <Stack.Screen name="ProfilePreset" component={ProfilePresetScreen} />
      <Stack.Screen name="LocationPreset" component={LocationPresetScreen} />
      <Stack.Screen name="TemplePreference" component={TemplePreferenceScreen} />
      <Stack.Screen name="Analysis" component={AnalysisScreen} />
      <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
      
      {/* Main App */}
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="TempleStack" component={TempleStackNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator; 