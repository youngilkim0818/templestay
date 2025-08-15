import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

 const LoginSignupScreen = ({ navigation }: any) => {
   const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

     const handleSubmit = () => {
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

                // 로그인 로직 - 임시로 잘못된 계정 체크
       if (email === 'test@test.com' && password === 'password') {
         setErrorMessage('');
         setEmailError(false);
         setPasswordError(false);
         navigation.navigate('Onboarding1');
        } else {
         setErrorMessage('Please check your Email or Password');
       }
     } else {
       // 회원가입 로직
       setErrorMessage('');
       setEmailError(false);
       setPasswordError(false);
       navigation.navigate('Onboarding1');
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
    <SafeAreaView className="flex-1 bg-stone-100">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-5 bg-stone-100">
          {/* 로고 및 타이틀 */}
          <View className="py-16 items-center">
            <Image
              source={require('../../../assets/templebuk-logo.png')}
              style={{ width: 120, height: 28 }}
              resizeMode="contain"
            />
                         <Text className="text-3xl font-bold text-neutral-900 mt-8 text-center">
               {isLogin ? 'Welcome to TempleBuk' : 'Create Account'}
                </Text>
             <Text className="text-xl text-neutral-600 mt-2 text-center">
               {isLogin ? 'Find your next moment of peace.' : 'Join us for a peaceful experience'}
                </Text>
              
            {/* 스킵 버튼 */}
              <TouchableOpacity
              onPress={() => navigation.navigate('Onboarding1')}
              className="mt-6 bg-transparent border border-stone-300 rounded-full px-6 py-3"
              >
              <Text className="text-stone-600 font-medium">
                로그인 스킵하고 온보딩 시작하기
                </Text>
              </TouchableOpacity>
          </View>

          {/* 폼 */}
          <View className="flex-1">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-neutral-700 mb-2 ml-2">
                Email
              </Text>
              <View className={`bg-white rounded-4xl p-4 border-2 ${emailError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: 60 }}>
                <TextInput
                         className="text-lg text-neutral-700"
                  placeholder="Please enter your email"
                  value={email}
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
                  multiline={false}
                  textAlignVertical="center"
                  style={{ backgroundColor: 'transparent', height: 25 }}
                />
              </View>
            </View>

                         <View className="mb-4">
               <Text className="text-lg font-semibold text-neutral-700 mb-2 ml-2">
                Password
              </Text>
              <View className={`bg-white rounded-4xl p-4 border-2 ${passwordError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: 60 }}>
                   <View className="flex-row items-center justify-between">
                <TextInput
                         className="text-lg text-neutral-700 flex-1"
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
                  style={{ backgroundColor: 'transparent', height: 25 }}
                />
                   <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                       size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
                 </View>
              </View>
            </View>

                                                                                                                                                                                                                                                                                                                                                                                                                                       {/* 에러 메시지 */}
                 {errorMessage ? (
                   <View className="mb-1">
                     <Text className="text-red-500 text-sm ml-2">
                       {errorMessage}
              </Text>
                   </View>
                 ) : null}

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          {/* Sign up | Forgot Password? 텍스트 */}
            <View className="flex-row justify-end items-center mb-4" style={{ position: 'absolute', top: 200, left: 0, right: 0, paddingRight: 10 }}>
              <TouchableOpacity onPress={goToSignup} className="mr-2">
                <Text className="text-stone-500 font-semibold">
                  Sign up
                </Text>
                </TouchableOpacity>
              <Text className="text-stone-500 mr-2">|</Text>
              <TouchableOpacity>
                <Text className="text-stone-500 font-semibold">
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
                <View className="px-7 pt-7 pb-8 bg-stone-100" style={{ height: 135, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                  <TouchableOpacity
                    className="flex-row items-center justify-center rounded-4xl py-6 px-6"
                    style={{ backgroundColor: '#5A4636' }}
                    onPress={handleSubmit}
                  >
                    <Text className="text-xl font-semibold text-white">
                      {isLogin ? 'Sign In' : 'Sign Up'}
                    </Text>
                  </TouchableOpacity>
                </View>
    </SafeAreaView>
  );
};

export default LoginSignupScreen;
