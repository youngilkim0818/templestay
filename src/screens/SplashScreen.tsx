import React, { useEffect, useState, useRef } from 'react';
import { View, Dimensions, Image, Text, TouchableOpacity, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '../store/userStore';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';

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

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { user: currentUser } = useUserStore();
  const screen = Dimensions.get('window');
  const LOGO_ASPECT = 1142 / 262;
  const logoWidth = Math.min(screen.width * 0.85, 600); // 화면의 85%, 최대 600
  const logoHeight = logoWidth / LOGO_ASPECT;
  const logoSource = require('../../assets/templebuk-logo.png');
  const verticalOffset = -Math.round(screen.height * 0.09); // 가운데에서 위로 6%
  
  const [showStartButton, setShowStartButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (__DEV__) {
      console.log('🎬 SplashScreen 마운트됨');
    }
    
    const checkUserStatus = async () => {
      try {
        // 게스트 모드 확인
        const isGuestMode = await AsyncStorage.getItem('isGuestMode');
        if (isGuestMode === 'true') {
          if (__DEV__) console.log('👤 게스트 모드 사용자 → 메인으로 이동');
          navigation.replace('Main');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const isLoggedIn = !!session;
        
        if (isLoggedIn && session?.user?.id) {
          let hasCompletedOnboarding = false;
          
          try {
            // Supabase에서 온보딩 완료 여부 확인
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('has_completed_onboarding')
              .eq('id', session.user.id)
              .single();
            
            if (!error && profile) {
              hasCompletedOnboarding = profile.has_completed_onboarding;
              if (__DEV__) console.log('🔍 Supabase에서 온보딩 상태 확인:', hasCompletedOnboarding);
            } else {
              // Supabase 실패시 로컬 저장소 확인 (fallback)
              const localOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
              hasCompletedOnboarding = localOnboarding === 'true';
              if (__DEV__) console.log('🔍 로컬 저장소에서 온보딩 상태 확인:', hasCompletedOnboarding);
            }
          } catch (error) {
            // 에러 발생시 로컬 저장소 사용
            const localOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
            hasCompletedOnboarding = localOnboarding === 'true';
            if (__DEV__) console.log('🔍 에러 발생, 로컬 저장소 사용:', hasCompletedOnboarding);
          }
          
          if (hasCompletedOnboarding) {
            if (__DEV__) console.log('✅ 온보딩 완료 사용자 → 홈으로 이동');
            navigation.replace('Main');
          } else {
            if (__DEV__) console.log('⚠️ 온보딩 미완료 사용자 → 온보딩으로 이동');
            navigation.replace('Onboarding1');
          }
        } else {
          if (__DEV__) console.log('🆕 비로그인 사용자 → 시작 버튼 표시');
          setTimeout(() => {
            setShowStartButton(true);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 550,
              useNativeDriver: true,
            }).start();
          }, 1000);
        }
      } catch (error) {
        console.error('사용자 상태 확인 실패:', error);
        setShowStartButton(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }).start();
      }
    };

    checkUserStatus();

    return () => {
      if (__DEV__) {
        console.log('🧹 SplashScreen 언마운트');
      }
    };
  }, []);

  const handleStartPress = async () => {
    if (__DEV__) {
      console.log('🖱️ Sign in to TempleBuk 버튼 클릭됨');
    }
    try {
      // 로그인 화면으로 이동
      if (__DEV__) {
        console.log('🔐 로그인 화면으로 이동');
      }
      navigation.replace('Login');
    } catch (error) {
      console.error('네비게이션 실패:', error);
      // 에러 발생시 로그인으로 이동
      navigation.replace('Login');
    }
  };

  const handleGuestPress = async () => {
    if (__DEV__) {
      console.log('🖱️ 게스트로 입장하기 버튼 클릭됨');
    }
    try {
      // 게스트 모드 플래그 설정
      await AsyncStorage.setItem('isGuestMode', 'true');
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true'); // 온보딩 완료로 표시
      
      // userStore에도 게스트 모드 설정
      const { setGuestMode } = useUserStore.getState();
      setGuestMode(true);
      
      if (__DEV__) {
        console.log('👤 게스트 모드 설정 완료, 메인 화면으로 이동');
      }
      navigation.replace('Main');
    } catch (error) {
      console.error('네비게이션 실패:', error);
      // 에러 발생시 메인으로 이동
      navigation.replace('Main');
    }
  };

  if (__DEV__) {
    console.log('🔄 SplashScreen 렌더링, showStartButton:', showStartButton);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* 로고를 절대 위치로 고정 */}
      <View 
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: [
            { translateX: -logoWidth / 2 },
            { translateY: -logoHeight / 2 + verticalOffset }
          ]
        }}
      >
        <Image source={logoSource} resizeMode="contain" style={{ width: logoWidth, height: logoHeight }} />
      </View>
      
      {showStartButton && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            position: 'absolute',
            bottom: '15%',
            left: 0,
            right: 0,
            alignItems: 'center',
            transform: [
              { translateY: 20 }
            ],
          }}
        >
          {/* Sign in to TempleBuk 버튼 */}
          <TouchableOpacity
            onPress={handleStartPress}
            style={{
              backgroundColor: '#5A4636',
              paddingHorizontal: 80,
              paddingVertical: 20,
              borderRadius: 30,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              marginBottom: 15,
              minWidth: 280, // 게스트 버튼과 동일한 최소 너비
              minHeight: 60, // 게스트 버튼과 동일한 최소 높이
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Sign in to TempleBuk
            </Text>
          </TouchableOpacity>

          {/* 게스트로 입장하기 버튼 */}
          <TouchableOpacity
            onPress={handleGuestPress}
            style={{
              backgroundColor: 'transparent',
              paddingHorizontal: 80,
              paddingVertical: 20,
              borderRadius: 30,
              borderWidth: 2,
              borderColor: '#5A4636',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              minWidth: 280, // Sign in 버튼과 동일한 최소 너비
              minHeight: 60, // Sign in 버튼과 동일한 최소 높이
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#5A4636',
                fontSize: 16,
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default SplashScreen;


