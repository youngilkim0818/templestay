import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuth } from './src/hooks/useAuth';
import i18n from './src/services/i18n';
import './global.css';
import useLocationStore from './src/store/locationStore';

export default function App() {
  // 인증 상태 자동 확인
  useAuth();
  const initializeLocation = useLocationStore((s) => s.initialize);

  useEffect(() => {
    // 앱 시작 시 위치 권한과 좌표 초기화 (지도 최초 로딩 개선)
    initializeLocation();
  }, [initializeLocation]);

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </I18nextProvider>
  );
}
