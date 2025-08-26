import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import useUserStore from '../../store/userStore';
import { supabase } from '../../lib/supabase';



const ImportantFactor2Screen = ({ navigation }: any) => {
  const { user: currentUser, updateUser } = useUserStore();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  const handleStart = async () => {
    try {
      // 온보딩 완료 상태를 저장
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      if (__DEV__) {
        console.log('✅ 온보딩 완료, hasCompletedOnboarding 플래그 저장됨');
      }
      
      // 사용자 정보 저장 (AsyncStorage + Supabase + UserStore)
      if (userName.trim() !== '') {
        await AsyncStorage.setItem('userName', userName.trim());
        
        // Supabase 프로필 업데이트 시도 (테이블이 존재하는 경우)
        if (currentUser?.id) {
          try {
            // 먼저 사용자 테이블 구조 확인
            const { data: existingProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
              // 테이블이 존재하지 않거나 다른 오류 (정상적인 상황)
            } else {
              // 테이블이 존재하면 업데이트
              const { error } = await supabase
                .from('profiles')
                .upsert({
                  id: currentUser.id,
                  name: userName.trim(),
                  has_completed_onboarding: true,
                  updated_at: new Date().toISOString()
                });
              
              if (!error && __DEV__) {
                console.log('✅ Supabase 프로필 업데이트 성공:', userName.trim());
              }
            }
          } catch (error) {
            // Supabase 오류는 무시하고 로컬 저장소만 사용 (정상 동작)
          }
        }
        
        // UserStore 업데이트
        updateUser({ 
          name: userName.trim(),
          profileImage: profileImage || undefined
        });
      }
      
      if (profileImage) {
        await AsyncStorage.setItem('userProfileImage', profileImage);
      }
      
      navigation.replace('Main');
    } catch (error) {
      console.error('Failed to save onboarding completion state:', error);
      // 에러가 발생하더라도 사용자가 앱을 계속 사용할 수 있도록 메인 화면으로 이동
      navigation.replace('Main');
    }
  };

  const pickImage = async () => {
    try {
      if (__DEV__) console.log('🖼️ 이미지 선택 시작');
      
      // 갤러리 접근 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (__DEV__) console.log('📋 권한 상태:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      // 이미지 선택 - iPad 호환성을 위해 더 안전한 설정
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // iPad 메모리 절약을 위해 품질 낮춤
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (__DEV__) console.log('🖼️ 이미지 선택 결과:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        if (__DEV__) console.log('🖼️ 선택된 이미지 URI:', selectedImage.uri);
        
        // URI 유효성 검사
        if (selectedImage.uri && selectedImage.uri.length > 0) {
          setProfileImage(selectedImage.uri);
        } else {
          if (__DEV__) console.log('⚠️ 유효하지 않은 이미지 URI');
          Alert.alert('Error', 'Invalid image selected');
        }
      }
    } catch (error) {
      console.error('❌ 이미지 선택 에러:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const resetToDefaultImage = () => {
    setProfileImage(null);
  };

  const showImageOptions = () => {
    setShowImageModal(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-stone-100">
        <View className="flex-1 px-4 bg-stone-100">


         {/* 타이틀 섹션 */}
         <View className="py-10">
           <Text className="text-4xl font-bold text-neutral-900 ml-5 leading-10 mb-1">
             Welcome to TempleBuk
           </Text>
           <Text className="text-2xl font-bold text-neutral-900 ml-5 leading-10">
             Begin your joyful templestay experience!
           </Text>
         </View>

         {/* 프로필 입력 섹션 */}
         <View className="py-6 px-2 items-center">
           {/* 프로필 이미지 */}
           <View className="relative mb-6">
             <View className="w-32 h-32 bg-stone-100 rounded-full border-2 border-stone-300 items-center justify-center overflow-hidden">
               {profileImage ? (
                 <Image source={{ uri: profileImage }} className="w-full h-full" />
               ) : (
                 <Ionicons name="sunny" size={64} color="#F59E0B" />
               )}
             </View>
             
             {/* 카메라 아이콘 (옵션 선택) */}
             <TouchableOpacity 
               className="absolute bottom-0 right-0 w-8 h-8 bg-sage-600 rounded-full items-center justify-center border-2 border-white"
               onPress={showImageOptions}
             >
               <Ionicons name="camera" size={16} color="white" />
             </TouchableOpacity>
           </View>
           
                        {/* 이름 입력 박스 */}
             <View className="w-48">
               <TextInput
                 style={{
                   backgroundColor: '#F5F5F4',
                   borderRadius: 25,
                   borderWidth: 2,
                   borderColor: '#E7E5E4',
                   paddingHorizontal: 20,
                   paddingVertical: 15,
                   fontSize: 18,
                   color: '#292524',
                   minHeight: 50,
                   zIndex: 1000,
                   textAlign: 'center',
                 }}
                 placeholder="Enter your name"
                 placeholderTextColor="#78716C"
                 value={userName}
                 onChangeText={(text) => {
                   if (__DEV__) {
                     console.log('Text changed:', text);
                   }
                   setUserName(text);
                 }}
                 autoCapitalize="words"
                 autoCorrect={false}
                 editable={true}
                 keyboardType="default"
                 returnKeyType="done"
                 onFocus={() => console.log('TextInput focused')}
                 onBlur={() => console.log('TextInput blurred')}
               />
             </View>
         </View>

         {/* 온보딩 이미지 */}
         <View className="py-8 items-center -mt-28">
           <Image 
             source={require('../../../assets/onboarding.png')}
             style={{ width: 410, height: 410 }}
             resizeMode="contain"
           />
         </View>


        </View>

        {/* 이미지 선택 모달 */}
        {showImageModal && (
          <View className="absolute inset-0 items-center justify-center z-[9999] pt-4">
                      <View className="bg-stone-100 rounded-2xl p-6 mx-8 w-80 border-2 border-stone-300">
            {/* X 버튼 */}
            <TouchableOpacity 
              className="absolute top-4 right-4 w-8 h-8 bg-stone-200 rounded-full items-center justify-center"
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close" size={20} color="#78716C" />
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-stone-800 text-center mb-6">
              Profile Image
            </Text>
              
              <TouchableOpacity 
                className="bg-sage-600 rounded-2xl py-4 px-6 mb-4"
                onPress={() => {
                  pickImage();
                  setShowImageModal(false);
                }}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Open Gallery
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-sage-600 rounded-2xl py-4 px-6 mb-4"
                onPress={() => {
                  resetToDefaultImage();
                  setShowImageModal(false);
                }}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Set Default Image
              </Text>
              </TouchableOpacity>
              
            </View>
          </View>
        )}

        {/* 하단 버튼 */}
        <View className="px-7 pt-7 pb-8 bg-stone-100" style={{ height: 135, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <TouchableOpacity
            className={`flex-row items-center justify-center rounded-4xl py-6 px-6 border-2 ${
              userName.trim() !== '' 
                ? 'bg-sage-600 active:bg-sage-700 border-sage-600' 
                : 'bg-gray-300 border-gray-300'
            }`}
            onPress={handleStart}
            disabled={userName.trim() === ''}
          >
            <Text className={`text-2xl font-bold ${
              userName.trim() !== '' ? 'text-white' : 'text-gray-500'
            }`}>
              Start
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ImportantFactor2Screen;
