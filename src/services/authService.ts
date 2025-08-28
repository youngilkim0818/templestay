import { supabase } from '../lib/supabase';
import { User } from '../types';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// WebBrowser 설정
WebBrowser.maybeCompleteAuthSession();

export class AuthService {
  // 회원가입
  static async signUp(email: string, password: string, userData: Partial<User>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: 'https://templestay-app.netlify.app/auth/confirm', // 웹 기반 리다이렉트 URL
      },
    });

    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }

    return data;
  }

  // 로그인
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    return data;
  }

  // 구글 소셜 로그인 (간단한 방식)
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'templestay://auth/callback',
        },
      });

      if (error) {
        console.error('Error with Google sign in:', error);
        throw error;
      }

      // 브라우저에서 OAuth URL 열기
      if (data.url) {
        await WebBrowser.openBrowserAsync(data.url);
      }

      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // 간단한 콜백 처리 (실제 프로덕션에서는 deep linking 설정 필요)
  static async handleAuthCallback() {
    try {
      // 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        throw error;
      }

      if (session?.user) {
        await this.createOrUpdateUserProfile(session.user);
        return { user: session.user, session };
      }

      return null;
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    }
  }

  // 소셜 로그인 후 사용자 프로필 생성/업데이트
  static async createOrUpdateUserProfile(authUser: any) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!existingUser) {
        // 새 사용자 생성
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '사용자',
            profile_image: authUser.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user profile:', error);
          throw error;
        }

        return data;
      } else {
        // 기존 사용자 업데이트 (프로필 이미지 등)
        const { data, error } = await supabase
          .from('users')
          .update({
            name: authUser.user_metadata?.full_name || existingUser.name,
            profile_image: authUser.user_metadata?.avatar_url || existingUser.profile_image,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authUser.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user profile:', error);
          throw error;
        }

        return data;
      }
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error);
      throw error;
    }
  }

  // 로그아웃
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // 현재 사용자 정보 조회
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }

    return data as User;
  }

  // 사용자 프로필 업데이트
  static async updateUserProfile(userData: Partial<User>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    return data as User;
  }

  // 인증 상태 변경 리스너
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // 이메일 인증 상태 확인
  static async checkEmailConfirmation() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error checking email confirmation:', error);
      throw error;
    }

    return {
      user,
      isEmailConfirmed: user?.email_confirmed_at ? true : false,
      emailConfirmedAt: user?.email_confirmed_at
    };
  }

  // 이메일 재전송
  static async resendConfirmationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: 'templestay://auth/callback',
      },
    });

    if (error) {
      console.error('Error resending confirmation email:', error);
      throw error;
    }

    return { success: true };
  }

  // 계정 삭제
  static async deleteAccount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // Supabase에서 사용자 계정 삭제
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
}