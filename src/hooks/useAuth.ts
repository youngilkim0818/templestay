import { useEffect, useState } from 'react';
import { AuthService } from '../services/authService';
import useUserStore from '../store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const { login, logout, isLoggedIn, user, setLoading } = useUserStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        setLoading('auth', true);
        
        // Check if we have a stored session
        const storedSession = await AsyncStorage.getItem('auth_session');
        if (storedSession) {
          if (__DEV__) {
            console.log('🔐 Found stored session, attempting auto-login...');
          }
        }

        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          if (__DEV__) {
            console.log('✅ Auto-login successful:', currentUser.email);
          }
          login(currentUser);
          
          // Update last login timestamp
          await AsyncStorage.setItem('last_login', new Date().toISOString());
        } else {
          if (__DEV__) {
            console.log('❌ No valid session found, logging out...');
          }
          logout();
          await AsyncStorage.removeItem('auth_session');
        }
      } catch (error) {
        console.error('❌ Error checking auth state:', error);
        logout();
        await AsyncStorage.removeItem('auth_session');
      } finally {
        setLoading('auth', false);
        setIsInitializing(false);
      }
    };

    checkAuthState();

    // 인증 상태 변경 리스너 설정
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        if (__DEV__) {
          console.log('🔄 Auth state change:', event);
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            if (__DEV__) {
              console.log('✅ User signed in, loading profile...');
            }
            
            // Store session info for auto-login
            await AsyncStorage.setItem('auth_session', JSON.stringify({
              timestamp: new Date().toISOString(),
              userId: session.user.id,
            }));

            const userProfile = await AuthService.getCurrentUser();
            if (userProfile) {
              login(userProfile);
              await AsyncStorage.setItem('last_login', new Date().toISOString());
              if (__DEV__) {
                console.log('✅ User profile loaded and stored');
              }
            }
          } catch (error) {
            console.error('❌ Error loading user profile:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          if (__DEV__) {
            console.log('👋 User signed out, clearing session...');
          }
          logout();
          await AsyncStorage.removeItem('auth_session');
          await AsyncStorage.removeItem('last_login');
        } else if (event === 'TOKEN_REFRESHED') {
          if (__DEV__) {
            console.log('🔄 Token refreshed, updating session...');
          }
          await AsyncStorage.setItem('auth_session', JSON.stringify({
            timestamp: new Date().toISOString(),
            userId: session?.user?.id,
          }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [login, logout, setLoading]);

  // Helper function to check if user should auto-login based on last activity
  const shouldAutoLogin = async (): Promise<boolean> => {
    try {
      const lastLogin = await AsyncStorage.getItem('last_login');
      if (!lastLogin) return false;

      const lastLoginDate = new Date(lastLogin);
      const now = new Date();
      const daysSinceLastLogin = (now.getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24);

      // Auto-login if last login was within 30 days
      return daysSinceLastLogin <= 30;
    } catch (error) {
      console.error('Error checking auto-login eligibility:', error);
      return false;
    }
  };

  // Helper function to enable/disable auto-login
  const toggleAutoLogin = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('auto_login_enabled', enabled.toString());
      if (__DEV__) {
        console.log(`Auto-login ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error toggling auto-login:', error);
    }
  };

  return {
    isLoggedIn,
    user,
    login,
    logout,
    isInitializing,
    shouldAutoLogin,
    toggleAutoLogin,
  };
};