import React, { useEffect } from 'react';
import { View, Dimensions, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '../store/userStore';
import { COLORS } from '../constants/colors';

type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
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

  useEffect(() => {
    let isMounted = true;

    const checkOnboardingAndNavigate = async () => {
      try {
        // 사용자 이름이나 이메일에 'test'가 포함된 계정인지 확인
        const isTestAccount = currentUser && (
          (currentUser.name && currentUser.name.toLowerCase().includes('test')) ||
          (currentUser.email && currentUser.email.toLowerCase().includes('test'))
        );
        
        console.log('🧪 테스트 계정 확인:', {
          currentUser: currentUser ? { name: currentUser.name, email: currentUser.email } : null,
          isTestAccount
        });
        
        // 온보딩 완료 여부 확인 (Onboarding5에서 저장하는 키와 맞춤)
        const hasSeenOnboarding = await AsyncStorage.getItem('hasCompletedSurvey');
        
        setTimeout(() => {
          if (!isMounted) return;
          
          if (isTestAccount) {
            // 테스트 계정은 항상 온보딩으로
            console.log('🧪 테스트 계정 감지 → 온보딩 화면으로 이동');
            navigation.replace('Onboarding1');
          } else if (hasSeenOnboarding === 'true') {
            // 일반 사용자가 온보딩을 이미 본 경우 -> 메인으로
            console.log('✅ 온보딩 완료된 일반 사용자 → 메인으로 이동');
            navigation.replace('Main');
          } else {
            // 일반 사용자가 온보딩을 아직 안 본 경우 -> 온보딩1으로
            console.log('🆕 온보딩 미완료 일반 사용자 → 온보딩 화면으로 이동');
            navigation.replace('Onboarding1');
          }
        }, 3000);
      } catch (error) {
        console.error('온보딩 상태 확인 실패:', error);
        // 에러 발생시 온보딩으로 이동
        setTimeout(() => {
          if (!isMounted) return;
          navigation.replace('Onboarding1');
        }, 3000);
      }
    };

    checkOnboardingAndNavigate();
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ transform: [{ translateY: verticalOffset }] }}>
        <Image source={logoSource} resizeMode="contain" style={{ width: logoWidth, height: logoHeight }} />
      </View>
    </View>
  );
};

export default SplashScreen;


