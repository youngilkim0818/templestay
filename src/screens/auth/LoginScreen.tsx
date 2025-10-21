import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback, Keyboard, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/colors';

 const LoginSignupScreen = ({ navigation }: any) => {
   const screen = Dimensions.get('window');
   const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);

     const handleSubmit = async () => {
     if (isLogin) {
       // 입력값 검증
    let hasError = false;
    
    if (!email.trim()) {
      setEmailError(true);
      hasError = true;
       } else {
         setEmailError(false);
    }
    
    if (!password.trim()) {
      setPasswordError(true);
      hasError = true;
       } else {
         setPasswordError(false);
    }
    
    if (hasError) {
      return;
    }

    // 실제 Supabase 로그인 로직
    setLoading(true);
    try {
      const result = await AuthService.signIn(email, password);
      
      if (result.user) {
        setErrorMessage('');
        // 로그인 성공 - 온보딩 완료 여부 확인
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        const isOnboardingInProgress = await AsyncStorage.getItem('isOnboardingInProgress');
        
        // 온보딩이 진행 중이었다면 웰컴 페이지로 이동
        if (isOnboardingInProgress === 'true') {
          await AsyncStorage.removeItem('isOnboardingInProgress');
          navigation.replace('Splash');
        } else if (hasCompletedOnboarding === 'true') {
          navigation.replace('Main');
        } else {
          navigation.replace('Onboarding1');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        setErrorMessage('Invalid email or password.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMessage('Email verification required. Please check your email.');
      } else {
        setErrorMessage('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
     } else {
       // 회원가입 화면으로 이동
       navigation.navigate('Signup');
     }
   };

     const toggleMode = () => {
     setIsLogin(!isLogin);
     setEmail('');
     setPassword('');
     setConfirmPassword('');
     setErrorMessage('');
     setEmailError(false);
     setPasswordError(false);
   };

  const goToSignup = () => {
    navigation.navigate('Signup');
  };



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, paddingHorizontal: screen.width * 0.05, backgroundColor: COLORS.background.secondary }}>
          {/* 뒤로 가기 버튼 */}
          <View style={{ paddingTop: screen.height * 0.02, paddingLeft: 0 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Splash')}
              style={{ 
                width: screen.width * 0.1, 
                height: screen.width * 0.1, 
                borderRadius: screen.width * 0.08, 
                backgroundColor: COLORS.brand.stone, 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Ionicons name="arrow-back" size={screen.width * 0.05} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* 로고 및 타이틀 */}
          <View style={{ paddingVertical: screen.height * 0.08, alignItems: 'center' }}>
            <Text style={{ fontSize: screen.width * 0.07, fontWeight: 'bold', color: COLORS.text.primary, marginTop: screen.height * 0.01, marginLeft: -screen.width * 0.55 }}>
              Welcome!
            </Text>
            <Text style={{ fontSize: screen.width * 0.056875, fontWeight: 'bold', color: COLORS.text.primary, marginTop: screen.height * 0.005, marginLeft: -screen.width * 0.5 }}>
              Please Sign In
            </Text>
          </View>

          {/* 폼 */}
          <View style={{ flex: 1, marginTop: -screen.height * 0.02 }}>
            <View style={{ marginBottom: screen.height * 0.015 }}>
              <Text style={{ fontSize: screen.width * 0.039375, fontWeight: '600', color: COLORS.text.secondary, marginBottom: screen.height * 0.01, marginLeft: screen.width * 0.02 }}>
                Email
              </Text>
              <View className={`bg-white p-4 border-2 ${emailError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: screen.height * 0.065, borderRadius: 30 }}>
                <TextInput
                  style={{ fontSize: screen.width * 0.035, color: COLORS.text.primary }}
                  placeholder="Please enter your email"
                  value={email}
                  multiline={false}
                  textAlignVertical="center"
                                                  onChangeText={(text) => {
                            setEmail(text);
                            // 에러 상태 초기화
                            if (emailError || passwordError || errorMessage) {
                              setEmailError(false);
                              setPasswordError(false);
                              setErrorMessage('');
                            }
                          }}
                         onFocus={() => {
                           // 에러 상태 초기화
                           setErrorMessage('');
                           setEmailError(false);
                           setPasswordError(false);
                           // 이미 텍스트가 있으면 지우기
                           if (email.trim()) {
                             setEmail('');
                           }
                         }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

                         <View style={{ marginBottom: screen.height * 0.015 }}>
               <Text style={{ fontSize: screen.width * 0.039375, fontWeight: '600', color: COLORS.text.secondary, marginBottom: screen.height * 0.01, marginLeft: screen.width * 0.02 }}>
                Password
              </Text>
              <View className={`bg-white p-4 border-2 ${passwordError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: screen.height * 0.065, borderRadius: 30 }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextInput
                  style={{ fontSize: screen.width * 0.035, color: COLORS.text.primary, flex: 1 }}
                  placeholder="Please enter your password"
                  value={password}
                                                  onChangeText={(text) => {
                            setPassword(text);
                            // 에러 상태 초기화
                            if (emailError || passwordError || errorMessage) {
                              setEmailError(false);
                              setPasswordError(false);
                              setErrorMessage('');
                            }
                          }}
                         onFocus={() => {
                           // 에러 상태 초기화
                           setErrorMessage('');
                           setEmailError(false);
                           setPasswordError(false);
                           // 이미 텍스트가 있으면 지우기
                           if (password.trim()) {
                             setPassword('');
                           }
                         }}
                         secureTextEntry={!showPassword}
                  multiline={false}
                  textAlignVertical="center"
                />
                   <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginLeft: screen.width * 0.02 }}>
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                       size={screen.width * 0.055}
                    color={COLORS.text.tertiary}
                  />
                </TouchableOpacity>
                 </View>
              </View>
            </View>

                                                                                                                                                                                                                                                                                                                                                                                                                              {/* 에러 메시지 */}
                 {errorMessage ? (
                   <View style={{ marginBottom: screen.height * 0.02 }}>
                     <Text style={{ fontSize: screen.width * 0.035, color: COLORS.status.error, marginLeft: screen.width * 0.02 }}>
                       {errorMessage}
              </Text>
                   </View>
                 ) : null}

                        {/* Sign up | Reset Password 텍스트 */}
            <View className="flex-row justify-center items-center" style={{ position: 'absolute', bottom: 120, left: 0, right: 0 }}>
              <TouchableOpacity onPress={goToSignup} className="mr-2">
                <Text style={{ color: COLORS.text.secondary, fontWeight: '600' }}>
                  Sign up
                </Text>
              </TouchableOpacity>
              <Text style={{ color: COLORS.text.secondary, marginRight: 8 }}>|</Text>
              <TouchableOpacity onPress={() => {}}>
                <Text style={{ color: COLORS.text.secondary, fontWeight: '600' }}>
                  Reset Password
                </Text>
              </TouchableOpacity>
            </View>

                         {!isLogin && (
               <View className="mb-4">
                 <Text className="text-lg font-semibold text-neutral-700 mb-2 ml-2">
                   Confirm Password
                 </Text>
                                  <View className="bg-white rounded-4xl p-4 border-2 border-stone-200" style={{ height: 50 }}>
                   <View className="flex-row items-center justify-between">
                                            <TextInput
                         className="text-lg text-neutral-700 flex-1"
                         placeholder="Confirm Password"
                         value={confirmPassword}
                         onChangeText={setConfirmPassword}
                         secureTextEntry={!showConfirmPassword}
                         multiline={false}
                         textAlignVertical="center"
                         style={{ backgroundColor: 'transparent', height: 42 }}
                     />
                   <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2">
                     <Ionicons
                       name={showConfirmPassword ? "eye" : "eye-off"}
                       size={22}
                       color="#6B7280"
                     />
                   </TouchableOpacity>
                 </View>
               </View>
               </View>
             )}
          </View>
        </View>
      </TouchableWithoutFeedback>


                {/* 하단 버튼 */}
                <View style={{ 
                  paddingHorizontal: screen.width * 0.07, 
                  paddingTop: screen.height * 0.03, 
                  paddingBottom: screen.height * 0.04, 
                  backgroundColor: COLORS.background.secondary, 
                  height: screen.height * 0.2, 
                  position: 'absolute', 
                  bottom: -screen.height * 0.04, 
                  left: 0, 
                  right: 0 
                }}>
                  <TouchableOpacity
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: 30, 
                      paddingVertical: screen.height * 0.025, 
                      paddingHorizontal: screen.width * 0.06, 
                      backgroundColor: '#5A4636',
                      shadowColor: '#000',
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                    onPress={handleSubmit}
                  >
                    <Text style={{ fontSize: screen.width * 0.04375, fontWeight: '600', color: 'white' }}>
                      {loading ? 'Signing in...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </Text>
                  </TouchableOpacity>
                </View>
    </SafeAreaView>
  );
};

export default LoginSignupScreen;
