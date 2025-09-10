import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegistrationScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);
  const [showInvalidEmail, setShowInvalidEmail] = useState(false);
  const [showPasswordTooShort, setShowPasswordTooShort] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailSent, setEmailSent] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 패스워드 강도 체크
  const checkPasswordStrength = (password: string) => {
    const hasLength = password.length >= 6;
    const hasNumberAndLetter = /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // 만족하는 조건의 개수 계산
    const satisfiedCount = [hasLength, hasNumberAndLetter, hasSpecialChar].filter(Boolean).length;
    
    return {
      hasLength,
      hasNumberAndLetter,
      hasSpecialChar,
      satisfiedCount,
      isComplete: hasLength && hasNumberAndLetter && hasSpecialChar
    };
  };

  const passwordStrength = checkPasswordStrength(password);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 이메일 재전송
  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      await AuthService.resendConfirmationEmail(email);
      setModalMessage('Verification email has been resent.\nPlease check your email.');
      setShowSuccessModal(true);
    } catch (error: any) {
      setModalMessage(error.message || 'Failed to resend verification email. Please try again.');
      setShowErrorModal(true);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSignup = async () => {
    // 에러 상태 초기화
    setEmailError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);
    setShowPasswordMismatch(false);
    setShowInvalidEmail(false);
    setShowPasswordTooShort(false);
    
    // 입력값 검증
    let hasError = false;
    
    if (!email.trim()) {
      setEmailError(true);
      hasError = true;
    } else if (!validateEmail(email.trim())) {
      setShowInvalidEmail(true);
      hasError = true;
    }
    
    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
    }
    
    if (!confirmPassword.trim()) {
      setConfirmPasswordError(true);
      hasError = true;
    }
    
    // 비밀번호 불일치 검사 (빈 필드가 아닐 때만)
    if (password.trim() && confirmPassword.trim() && password !== confirmPassword) {
      setShowPasswordMismatch(true);
      hasError = true;
    }
    
    // 비밀번호 길이 검사 (빈 필드가 아닐 때만)
    if (password.trim() && !passwordStrength.isComplete) {
      setShowPasswordTooShort(true);
      hasError = true;
    }
    
    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      // 재가입일 수 있으므로, 이전 온보딩 완료 플래그와 진행 상태를 제거
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      await AsyncStorage.removeItem('isOnboardingInProgress');

      // Supabase Auth로 회원가입
      const result = await AuthService.signUp(email, password, {
        name: email.trim().split('@')[0], // 이메일 아이디를 이름으로 사용
        email: email.trim()
      });

      if (result.user) {
        // 이메일 인증이 필요 없는 경우, 바로 온보딩으로 이동
        if (result.user.email_confirmed_at) {
          navigation.replace('Onboarding1');
        } else {
          // 이메일 인증이 필요한 경우, 인증 안내 화면 표시
          setEmailSent(true);
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Error', error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 성공 모달
  if (showSuccessModal) {
    return (
      <SafeAreaView className="flex-1 bg-stone-100">
        <View className="flex-1 items-center justify-center px-7">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm">
            {/* 성공 아이콘 */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-sage-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={40} color="#059669" />
              </View>
              <Text className="text-2xl font-bold text-neutral-800 mb-2">
                Success
              </Text>
            </View>
            
            {/* 메시지 */}
            <Text className="text-neutral-600 text-center leading-6 mb-8">
              {modalMessage}
            </Text>
            
            {/* 확인 버튼 */}
            <TouchableOpacity
              onPress={() => setShowSuccessModal(false)}
              className="bg-sage-600 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-lg">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 에러 모달
  if (showErrorModal) {
    return (
      <SafeAreaView className="flex-1 bg-stone-100">
        <View className="flex-1 items-center justify-center px-7">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm">
            {/* 에러 아이콘 */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="alert-circle" size={40} color="#DC2626" />
              </View>
              <Text className="text-2xl font-bold text-neutral-800 mb-2">
                Error
              </Text>
            </View>
            
            {/* 메시지 */}
            <Text className="text-neutral-600 text-center leading-6 mb-8">
              {modalMessage}
            </Text>
            
            {/* 확인 버튼 */}
            <TouchableOpacity
              onPress={() => setShowErrorModal(false)}
              className="bg-sage-600 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-lg">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 이메일 인증 화면
  if (emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-stone-100">
        <View className="flex-1 px-7 pt-20 pb-8">
          {/* 상단 헤더 */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="mail" size={40} color="#10B981" />
            </View>
            <Text className="text-3xl font-bold text-neutral-700 mb-3 text-center">
              Check Your Email
            </Text>
            <Text className="text-lg text-neutral-600 text-center leading-6">
              We sent a verification email to <Text className="font-semibold">{email}</Text>
              {'\n'}Click the link in the email to activate your account.
            </Text>
          </View>

          {/* 안내 메시지 */}
          <View className="bg-stone-200 border border-stone-300 rounded-2xl p-6 mb-8">
            <View className="flex-row items-start mb-3">
              <Ionicons name="information-circle" size={24} color="#44403C" />
              <Text className="text-stone-800 font-semibold text-lg ml-2">
                After Verification
              </Text>
            </View>
            <Text className="text-stone-700 leading-6">
              • You need to verify your email to log in{'\n'}
              • Check your spam folder as well{'\n'}
              • Try resending if you don't receive the verification email
            </Text>
          </View>

          {/* 버튼들 */}
          <View className="space-y-4 items-center">
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="rounded-full py-4 px-8 items-center"
              style={{ width: 280, backgroundColor: '#5A4636' }}
            >
              <Text className="text-white font-semibold text-lg">
                Back to Login
              </Text>
            </TouchableOpacity>
            
            <View className="h-2" />
            
            <TouchableOpacity
              onPress={handleResendEmail}
              disabled={resendingEmail}
              className="rounded-full py-4 px-8 items-center"
              style={{ width: 280, backgroundColor: '#5A4636' }}
            >
              <Text className="text-white font-semibold text-lg">
                {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-stone-100">
          {/* 상단 헤더 */}
          <View className="px-7 pt-18 pb-6">
            <Text className="text-3xl font-bold text-neutral-900 mb-2">
              Create Account
            </Text>
          </View>

          {/* 메인 콘텐츠 */}
          <View className="flex-1 px-7 pt-10">
            {/* 이메일 입력 */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-neutral-700 mb-2">
                Email
              </Text>
              <View className={`bg-white rounded-4xl p-4 border-2 ${emailError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: 60 }}>
                <TextInput
                  className="text-lg pt-0"
                  placeholder="Please enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError(false);
                    if (showInvalidEmail) setShowInvalidEmail(false);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  multiline={false}
                  textAlignVertical="center"
                  style={{ backgroundColor: 'transparent', height: 25 }}
                  onFocus={() => {
                    setEmailError(false);
                    setPasswordError(false);
                    setConfirmPasswordError(false);
                    setShowInvalidEmail(false);
                    setShowPasswordTooShort(false);
                  }}
                />
              </View>
              
              {/* 이메일 형식 경고문 */}
              {showInvalidEmail && (
                <View className="mt-2">
                  <Text className="text-red-500 text-sm">
                    Invalid email format
                  </Text>
                </View>
              )}
            </View>

            {/* 비밀번호 입력 */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-neutral-700 mb-2">
                Password
              </Text>
              <View className={`bg-white rounded-4xl p-4 border-2 ${passwordError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: 60 }}>
                <TextInput
                  className="flex-1 text-lg pr-12 pt-0"
                  placeholder="Please enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError(false);
                    if (showPasswordTooShort) setShowPasswordTooShort(false);
                  }}
                  multiline={false}
                  textAlignVertical="center"
                  secureTextEntry={!showPassword}
                  style={{ backgroundColor: 'transparent', height: 25 }}
                  onFocus={() => {
                    setEmailError(false);
                    setPasswordError(false);
                    setConfirmPasswordError(false);
                    setShowInvalidEmail(false);
                    setShowPasswordTooShort(false);
                    setIsPasswordFocused(true);
                  }}
                  onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              
              {/* 패스워드 강도 게이지 */}
              {isPasswordFocused && (
                <View className="mt-3 ml-4">
                  <View className="flex-row mb-2">
                    <View className={`w-28 h-2 rounded-l-full ${
                      passwordStrength.satisfiedCount >= 1
                        ? (passwordStrength.isComplete ? 'bg-green-500' : 'bg-red-500')
                        : 'bg-gray-400'
                    }`} />
                    <View className={`w-28 h-2 ${
                      passwordStrength.satisfiedCount >= 2
                        ? (passwordStrength.isComplete ? 'bg-green-500' : 'bg-red-500')
                        : 'bg-gray-400'
                    }`} />
                    <View className={`w-28 h-2 rounded-r-full ${
                      passwordStrength.satisfiedCount >= 3
                        ? (passwordStrength.isComplete ? 'bg-green-500' : 'bg-red-500')
                        : 'bg-gray-400'
                    }`} />
                  </View>
                  <View className="flex-row space-x-4">
                    <Text className="text-xs text-gray-500">
                      Password must be 6+ characters,
                    </Text>
                    <Text className="text-xs text-gray-500">
                      with numbers
                    </Text>
                    <Text className="text-xs text-gray-500">
                      and special symbols
                    </Text>
                  </View>
                </View>
              )}
              
              {/* 비밀번호 길이 경고문 */}
              {showPasswordTooShort && (
                <View className="mt-2">
                  <Text className="text-red-500 text-sm">
                    Please check the password requirements
                  </Text>
                </View>
              )}
            </View>

            {/* 비밀번호 확인 입력 */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-neutral-700 mb-2">
                Confirm Password
              </Text>
              <View className={`bg-white rounded-4xl p-4 border-2 ${confirmPasswordError ? 'border-red-500' : 'border-stone-200'} ${!passwordStrength.isComplete ? 'opacity-50' : ''}`} style={{ height: 60 }}>
                <TextInput
                  className="flex-1 text-lg pr-12 pt-0"
                  placeholder={passwordStrength.isComplete ? "Please confirm your password" : "Complete password requirements first"}
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) setConfirmPasswordError(false);
                  }}
                  multiline={false}
                  textAlignVertical="center"
                  secureTextEntry={!showConfirmPassword}
                  style={{ backgroundColor: 'transparent', height: 25 }}
                  editable={passwordStrength.isComplete}
                  onFocus={() => {
                    setEmailError(false);
                    setPasswordError(false);
                    setConfirmPasswordError(false);
                    setShowPasswordMismatch(false);
                    setShowPasswordTooShort(false);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                  disabled={!passwordStrength.isComplete}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={24}
                    color={passwordStrength.isComplete ? "#6B7280" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              </View>
              
              {/* 비밀번호 불일치 경고문 */}
              {showPasswordMismatch && (
                <View className="mt-2">
                  <Text className="text-red-500 text-sm">
                    Password mismatch
                  </Text>
                </View>
              )}
            </View>

            {/* 로그인 페이지로 이동 */}
            <View className="flex-row justify-center items-center" style={{ position: 'absolute', bottom: 120, left: 0, right: 0 }}>
              <Text className="text-stone-500 text-lg">
                Already have an account?{' '}
              </Text>
                              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-stone-500 font-semibold text-lg">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 하단 버튼 */}
          <View className="px-7 pt-8 pb-0 bg-stone-100" style={{ height: 105, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-4xl py-6 px-6"
              style={{ backgroundColor: '#5A4636' }}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <Text className="text-xl font-semibold text-white">
                    Creating Account...
                  </Text>
                </View>
              ) : (
                <Text className="text-xl font-semibold text-white">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>


        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default RegistrationScreen;
