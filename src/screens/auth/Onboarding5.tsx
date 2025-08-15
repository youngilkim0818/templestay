import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';



const ImportantFactor2Screen = ({ navigation }: any) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  const handleStart = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedSurvey', 'true');
      
      // 사용자 정보 저장
      if (userName.trim() !== '') {
        await AsyncStorage.setItem('userName', userName.trim());
      }
      if (profileImage) {
        await AsyncStorage.setItem('userProfileImage', profileImage);
      }
      
      navigation.navigate('Main');
    } catch (error) {
      console.error('Failed to save survey completion:', error);
      navigation.navigate('Main');
    }
  };

  const pickImage = async () => {
    try {
      // 갤러리 접근 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
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
         <View className="py-8">
           <Text className="text-4xl font-bold text-neutral-900 text-left leading-10 mb-3">
             Welcome to TempleBuk
           </Text>
           <Text className="text-2xl font-bold text-neutral-900 text-left leading-10">
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
                   console.log('Text changed:', text);
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
             source={require('../../../assets/온보딩.png')}
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
