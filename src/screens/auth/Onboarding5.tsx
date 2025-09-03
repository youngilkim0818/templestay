import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { InteractionManager } from 'react-native'; // ★ iPad 크래시 방지용
import useUserStore from '../../store/userStore';
import { supabase } from '../../lib/supabase';

const ImportantFactor2Screen = ({ navigation }: any) => {
  const { user: currentUser, updateUser } = useUserStore();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [isPicking, setIsPicking] = useState<boolean>(false); // ★ 중복 방지
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  // 게스트 모드 확인
  useEffect(() => {
    const checkGuestMode = async () => {
      try {
        const guestMode = await AsyncStorage.getItem('isGuestMode');
        if (guestMode === 'true') {
          setIsGuestMode(true);
          setUserName('Guest'); // 게스트 모드일 때 이름을 Guest로 고정
        }
      } catch (error) {
        console.error('게스트 모드 확인 실패:', error);
      }
    };
    checkGuestMode();
  }, []);

  // 온보딩 완료 처리
  const handleStart = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

      if (userName.trim() !== '') {
        await AsyncStorage.setItem('userName', userName.trim());

        if (currentUser?.id) {
          try {
            const { error } = await supabase.from('profiles').upsert({
              id: currentUser.id,
              name: userName.trim(),
              has_completed_onboarding: true,
              updated_at: new Date().toISOString(),
            });
            if (error) console.log('Supabase update error:', error);
          } catch (e) {
            console.log('Supabase skipped:', e);
          }
        }

        updateUser({
          name: userName.trim(),
          profileImage: profileImage || undefined,
        });
      }

      if (profileImage) {
        await AsyncStorage.setItem('userProfileImage', profileImage);
      }

      navigation.replace('Main');
    } catch (error) {
      console.error('Failed to save onboarding completion state:', error);
      navigation.replace('Main');
    }
  };

  // 권한 체크 & 요청 (영어 전용)
  const ensurePhotoPermission = async () => {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.granted || (current.status as string) === 'limited') return current.status;

    if (current.canAskAgain) {
      const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return req.status;
    }
    return current.status;
  };

  // 갤러리 열기
  const pickImage = async () => {
    if (isPicking) return;
    setIsPicking(true);

    try {
      const status = await ensurePhotoPermission();
      if ((status as string) !== 'granted' && (status as string) !== 'limited') {
        Alert.alert(
          'Permission Needed',
          'Please allow photo library access in Settings to select a profile image.'
        );
        return;
      }

      const isPad = Platform.OS === 'ios' && (Platform as any).isPad;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: isPad ? false : true, // ★ iPad는 false 권장
        aspect: [1, 1],
        quality: 0.85,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error('❌ Image pick error:', err);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    } finally {
      setIsPicking(false);
    }
  };

  // 모달에서 갤러리 버튼 눌렀을 때
  const handleOpenGalleryFromModal = () => {
    if (isPicking) return; // ★ 추가 안전장치
    
    setShowImageModal(false);
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        pickImage();
      }, 200); // ★ iPad 안전 지연을 200ms로 증가
    });
  };

  const resetToDefaultImage = () => {
    setProfileImage(null);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-stone-100">
                <ScrollView
          className="flex-1 px-4 bg-stone-100"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View className="py-10">
            <Text className="text-4xl font-bold text-neutral-900 ml-5 leading-10 mb-1">
              Welcome to TempleBuk!
            </Text>
            {!isGuestMode && (
              <Text className="text-2xl font-bold text-neutral-900 ml-5 leading-10">
                Set up your profile
              </Text>
            )}
          </View>

          {/* Profile section */}
          <View className={`px-2 items-center ${isGuestMode ? 'py-8' : 'py-6'}`}>
            <View className="relative mb-6">
              <View className="w-32 h-32 bg-stone-100 rounded-full border-2 border-stone-300 items-center justify-center overflow-hidden">
                {profileImage ? (
                  <Image source={{ uri: profileImage }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={64} color="#999" />
                )}
              </View>

              {!isGuestMode && (
                <TouchableOpacity
                  className="absolute bottom-0 right-0 w-8 h-8 bg-sage-600 rounded-full items-center justify-center border-2 border-white"
                  onPress={() => setShowImageModal(true)}
                >
                  <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Name input */}
            <View className="w-48">
              <TextInput
                style={{
                  backgroundColor: isGuestMode ? '#E7E5E4' : '#F5F5F4',
                  borderRadius: 25,
                  borderWidth: 2,
                  borderColor: isGuestMode ? '#D6D3D1' : '#E7E5E4',
                  paddingHorizontal: 20,
                  paddingVertical: 15,
                  fontSize: 18,
                  color: isGuestMode ? '#78716C' : '#292524',
                  minHeight: 50,
                  textAlign: 'center',
                }}
                placeholder={isGuestMode ? "Guest" : "Enter your name"}
                placeholderTextColor="#78716C"
                value={userName}
                onChangeText={(text) => !isGuestMode && setUserName(text)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                editable={!isGuestMode}
              />
            </View>
          </View>

          {/* Onboarding image with button overlay */}
          <View className="py-8 items-center relative">
            <Image
              source={require('../../../assets/onboarding.png')}
              style={{ width: 410, height: 410 }}
              resizeMode="contain"
            />
            
            {/* Start button overlay */}
            <View className="absolute bottom-16 left-0 right-0 px-7">
              <TouchableOpacity
                className={`flex-row items-center justify-center rounded-4xl py-6 px-6 border-2 ${
                  isGuestMode || userName.trim() !== ''
                    ? 'bg-sage-600 active:bg-sage-700 border-sage-600'
                    : 'bg-gray-300 border-gray-300'
                }`}
                onPress={handleStart}
                disabled={!isGuestMode && userName.trim() === ''}
              >
                <Text
                  className={`text-2xl font-bold ${
                    isGuestMode || userName.trim() !== '' ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  Start
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Image picker modal */}
        {showImageModal && !isGuestMode && (
          <View className="absolute inset-0 items-center justify-center z-[9999] pt-4">
            <View className="bg-stone-100 rounded-2xl p-6 mx-8 w-80 border-2 border-stone-300">
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
                onPress={handleOpenGalleryFromModal}
                disabled={isPicking}
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
                  Reset to Default
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}


      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ImportantFactor2Screen;