import React, { useEffect } from 'react';
import { View, Dimensions, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';

type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const screen = Dimensions.get('window');
  const LOGO_ASPECT = 1142 / 262;
  const logoWidth = Math.min(screen.width * 0.70, 480); // 화면의 35%, 최대 480
  const logoHeight = logoWidth / LOGO_ASPECT;
  const logoSource = require('../../assets/templebuk-logo.png');
  const verticalOffset = -Math.round(screen.height * 0.09); // 가운데에서 위로 6%

  useEffect(() => {
    let isMounted = true;

    const goNext = () => {
      setTimeout(() => {
        if (!isMounted) return;
        navigation.replace('Main');
      }, 3000);
    };

    goNext();
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


