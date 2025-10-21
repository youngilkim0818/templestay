import React, { useEffect, useState, useRef } from 'react';
import { View, Image, Text, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
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
  
  // React 19 호환 반응형 레이아웃
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const logoSource = require('../../assets/templebuk-logo.png');
  
  // 반응형 로고 크기 계산
  const LOGO_ASPECT = 1142 / 262;
  const logoWidth = Math.min(screenWidth * 0.8, 400); // 화면 너비의 80%, 최대 400px
  const logoHeight = logoWidth / LOGO_ASPECT;
  
  // 반응형 버튼 위치 계산
  const buttonBottomPosition = Math.max(screenHeight * 0.05, 40); // 화면 높이의 5%, 최소 40px
  
  const [showStartButton, setShowStartButton] = useState(true); // 항상 보이도록 변경
  const fadeAnim = useRef(new Animated.Value(1)).current; // 항상 보이도록 변경

  useEffect(() => {
    if (__DEV__) {
      console.log('🎬 SplashScreen 마운트됨 (고정 레이아웃 모드)');
    }
    
    // React 19에서 더 안정적인 비동기 처리
    const checkUserStatus = async () => {
      try {
        // 온보딩 진행 상태 확인 (온보딩 중간에 나갔는지 체크)
        const isOnboardingInProgress = await AsyncStorage.getItem('isOnboardingInProgress');
        
        // 게스트 모드 확인
        const isGuestMode = await AsyncStorage.getItem('isGuestMode');
        if (isGuestMode === 'true') {
          // 온보딩이 진행 중이었다면 웰컴 페이지로 이동
          if (isOnboardingInProgress === 'true') {
            if (__DEV__) console.log('👤 게스트 모드 - 온보딩 진행 중이었음 → 버튼 표시');
            // 온보딩 진행 상태 초기화
            await AsyncStorage.removeItem('isOnboardingInProgress');
            // 버튼은 이미 항상 보이도록 설정됨
            return;
          }
          
          // 온보딩 완료 여부 확인
          const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
          if (hasCompletedOnboarding === 'true') {
            console.log('👤 게스트 모드 - 온보딩 완료 → 메인으로 이동');
            navigation.replace('Main');
            return;
          } else {
            console.log('👤 게스트 모드 - 온보딩 미완료 → 버튼 표시');
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        const isLoggedIn = !!session;
        
        if (isLoggedIn && session?.user?.id) {
          // 온보딩이 진행 중이었다면 웰컴 페이지로 이동
          if (isOnboardingInProgress === 'true') {
            if (__DEV__) console.log('👤 회원 모드 - 온보딩 진행 중이었음 → 버튼 표시');
            // 온보딩 진행 상태 초기화
            await AsyncStorage.removeItem('isOnboardingInProgress');
            // 버튼은 이미 항상 보이도록 설정됨
            return;
          }
          
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
            console.log('✅ 온보딩 완료 사용자 → 홈으로 이동');
            navigation.replace('Main');
          } else {
            console.log('⚠️ 온보딩 미완료 사용자 → 버튼 표시');
          }
        } else {
          console.log('🆕 비로그인 사용자 → 버튼 표시');
        }
      } catch (error) {
        console.error('사용자 상태 확인 실패:', error);
      }
    };

    checkUserStatus();

    return () => {
      if (__DEV__) {
        console.log('🧹 SplashScreen 언마운트');
      }
    };
  }, []); // 고정 레이아웃이므로 의존성 없음

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
      // 온보딩 완료 플래그는 제거 - 온보딩을 거치도록 함
      
      // userStore에도 게스트 모드 설정
      const { setGuestMode } = useUserStore.getState();
      setGuestMode(true);
      
      if (__DEV__) {
        console.log('👤 게스트 모드 설정 완료, 온보딩으로 이동');
      }
      navigation.replace('Onboarding1');
    } catch (error) {
      console.error('네비게이션 실패:', error);
      // 에러 발생시 온보딩으로 이동
      navigation.replace('Onboarding1');
    }
  };


  if (__DEV__) {
    console.log('🔄 SplashScreen 렌더링, 반응형 모드, 화면 크기:', { width: screenWidth, height: screenHeight });
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
      {/* 로고를 반응형 위치로 배치 */}
      <View 
        style={{ 
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: [{ translateX: -logoWidth / 2 }, { translateY: -logoHeight / 2 }]
        }}
      >
        <Image 
          source={logoSource} 
          resizeMode="contain" 
          style={{ 
            width: logoWidth, 
            height: logoHeight 
          }} 
        />
      </View>
      
      {/* 버튼 영역 - 반응형 표시 */}
      <View
        style={{
          position: 'absolute',
          bottom: buttonBottomPosition,
          left: 0,
          right: 0,
          alignItems: 'center',
          paddingHorizontal: Math.max(screenWidth * 0.05, 20), // 화면 너비의 5%, 최소 20px
          height: Math.max(screenHeight * 0.25, 180), // 화면 높이의 25%, 최소 180px
          justifyContent: 'center',
        }}
      >

          {/* Sign in to TempleBuk 버튼 - 반응형 */}
          <TouchableOpacity
            onPress={handleStartPress}
            style={{
              backgroundColor: '#5A4636',
              paddingHorizontal: Math.max(screenWidth * 0.15, 60), // 화면 너비의 15%, 최소 60px
              paddingVertical: Math.max(screenHeight * 0.025, 15), // 화면 높이의 2.5%, 최소 15px
              borderRadius: 30,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              marginBottom: Math.max(screenHeight * 0.02, 12), // 화면 높이의 2%, 최소 12px
              width: Math.min(screenWidth * 0.8, 320), // 화면 너비의 80%, 최대 320px
              height: Math.max(screenHeight * 0.07, 50), // 화면 높이의 7%, 최소 50px
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: Math.max(screenWidth * 0.035, 13), // 화면 너비의 3.5%, 최소 13px
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Sign in to TempleBuk
            </Text>
          </TouchableOpacity>


          {/* 게스트로 입장하기 버튼 - 반응형 */}
          <TouchableOpacity
            onPress={handleGuestPress}
            style={{
              backgroundColor: 'transparent',
              paddingHorizontal: Math.max(screenWidth * 0.15, 60), // 화면 너비의 15%, 최소 60px
              paddingVertical: Math.max(screenHeight * 0.025, 15), // 화면 높이의 2.5%, 최소 15px
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
              width: Math.min(screenWidth * 0.8, 320), // 화면 너비의 80%, 최대 320px
              height: Math.max(screenHeight * 0.07, 50), // 화면 높이의 7%, 최소 50px
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#5A4636',
                fontSize: Math.max(screenWidth * 0.035, 13), // 화면 너비의 3.5%, 최소 13px
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Continue as Guest
            </Text>
          </TouchableOpacity>

      </View>
    </View>
  );
};

export default SplashScreen;


