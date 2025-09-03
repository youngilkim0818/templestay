import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuth } from './src/hooks/useAuth';
import i18n from './src/services/i18n';
import './global.css';

export default function App() {
  // 인증 상태 자동 확인
  useAuth();

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </I18nextProvider>
  );
}
