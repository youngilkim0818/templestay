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
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  Onboarding4: undefined;
  Onboarding5: undefined;
  Main: undefined;
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
        // 사용자가 이미 로그인했는지 확인
        const { data: { session } } = await supabase.auth.getSession();
        const isLoggedIn = !!session;
        
        if (__DEV__) {
          console.log('🔍 사용자 로그인 상태 확인:', { isLoggedIn, user: session?.user?.email });
        }
        
        if (isLoggedIn) {
          // 이미 로그인한 사용자: 2초 후 자동으로 홈으로 이동
          if (__DEV__) {
            console.log('✅ 로그인된 사용자 → 홈으로 자동 이동');
          }
          setTimeout(() => {
            navigation.replace('Main');
          }, 2000);
        } else {
          // 처음 사용자: 1초 후 로그인 버튼 표시
          if (__DEV__) {
            console.log('🆕 처음 사용자 → 로그인 버튼 표시');
          }
          setTimeout(() => {
            setShowStartButton(true);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 550,
              useNativeDriver: true,
            }).start(() => {
              if (__DEV__) {
                console.log('✨ 애니메이션 완료');
              }
            });
          }, 1000);
        }
      } catch (error) {
        console.error('사용자 상태 확인 실패:', error);
        // 에러 발생시 로그인 버튼 표시
        setTimeout(() => {
          setShowStartButton(true);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true,
          }).start();
        }, 1000);
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
        </Animated.View>
      )}
    </View>
  );
};

export default SplashScreen;


