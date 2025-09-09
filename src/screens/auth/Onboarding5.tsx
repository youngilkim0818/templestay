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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { InteractionManager } from 'react-native'; // ★ iPad 크래시 방지용
import useUserStore from '../../store/userStore';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isLargeScreen = height > 800;

// Responsive sizes
const headerFontSize = isSmallScreen ? 18 : (isLargeScreen ? 24 : 20);
const subHeaderFontSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const cardPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
const cardMargin = isSmallScreen ? 4 : (isLargeScreen ? 8 : 6);
const buttonPadding = isSmallScreen ? 8 : (isLargeScreen ? 12 : 10);
const buttonFontSize = isSmallScreen ? 11 : (isLargeScreen ? 15 : 13);
const inputFontSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
const inputPadding = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
const iconSize = isSmallScreen ? 16 : (isLargeScreen ? 22 : 20);
const profileImageSize = isSmallScreen ? 60 : (isLargeScreen ? 90 : 75);
const sectionPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);

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
          <View style={{ paddingVertical: sectionPadding * 2 }}>
            <Text style={{ 
              fontSize: headerFontSize + 8, 
              fontWeight: 'bold', 
              color: '#111827', 
              marginLeft: sectionPadding, 
              lineHeight: (headerFontSize + 8) * 1.2, 
              marginBottom: 4 
            }}>
              Welcome to TempleBuk!
            </Text>
            {!isGuestMode && (
              <Text style={{ 
                fontSize: headerFontSize, 
                fontWeight: 'bold', 
                color: '#111827', 
                marginLeft: sectionPadding, 
                lineHeight: headerFontSize * 1.2 
              }}>
                Set up your profile
              </Text>
            )}
          </View>

          {/* Profile section */}
          <View style={{ 
            paddingHorizontal: cardPadding, 
            alignItems: 'center', 
            paddingVertical: isGuestMode ? sectionPadding * 2 : sectionPadding * 1.5 
          }}>
            <View style={{ position: 'relative', marginBottom: sectionPadding * 1.5 }}>
              <View style={{
                width: profileImageSize,
                height: profileImageSize,
                backgroundColor: '#F5F5F4',
                borderRadius: profileImageSize / 2,
                borderWidth: 2,
                borderColor: '#D6D3D1',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Ionicons name="person" size={profileImageSize * 0.6} color="#999" />
                )}
              </View>

              {!isGuestMode && (
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: iconSize + 8,
                    height: iconSize + 8,
                    backgroundColor: '#5A4636',
                    borderRadius: (iconSize + 8) / 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: 'white'
                  }}
                  onPress={() => setShowImageModal(true)}
                >
                  <Ionicons name="camera" size={iconSize} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Name input */}
            <View style={{ width: profileImageSize * 2 }}>
              <TextInput
                style={{
                  backgroundColor: isGuestMode ? '#E7E5E4' : '#F5F5F4',
                  borderRadius: 25,
                  borderWidth: 2,
                  borderColor: isGuestMode ? '#D6D3D1' : '#E7E5E4',
                  paddingHorizontal: inputPadding * 1.5,
                  paddingVertical: inputPadding,
                  fontSize: inputFontSize,
                  color: isGuestMode ? '#78716C' : '#292524',
                  minHeight: inputPadding * 3,
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
          <View style={{ marginTop: -sectionPadding * 2, alignItems: 'center', position: 'relative' }}>
            <Image
              source={require('../../../assets/onboarding.png')}
              style={{ 
                width: isSmallScreen ? 280 : (isLargeScreen ? 420 : 360), 
                height: isSmallScreen ? 280 : (isLargeScreen ? 420 : 360) 
              }}
              resizeMode="contain"
            />
            
            {/* Start button overlay */}
            <View style={{ 
              position: 'absolute', 
              bottom: -sectionPadding * 3, 
              left: 0, 
              right: 0, 
              paddingHorizontal: sectionPadding * 2,
              alignItems: 'center'
            }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 30,
                  paddingVertical: 18,
                  paddingHorizontal: 90,
                  minWidth: 360,
                  minHeight: 60,
                  backgroundColor: isGuestMode || userName.trim() !== ''
                    ? '#4A5D23'
                    : '#D1D5DB',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                onPress={handleStart}
                disabled={!isGuestMode && userName.trim() === ''}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  Start
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Image picker modal */}
        {showImageModal && !isGuestMode && (
          <TouchableOpacity 
            className="absolute inset-0 items-center justify-center z-[9999] pt-0"
            activeOpacity={1}
            onPress={() => setShowImageModal(false)}
          >
            <View 
              style={{
                backgroundColor: '#F5F5F4',
                borderRadius: 16,
                padding: sectionPadding,
                marginHorizontal: sectionPadding * 3,
                width: isSmallScreen ? 240 : (isLargeScreen ? 300 : 270),
                borderWidth: 2,
                borderColor: '#D6D3D1'
              }}
              onStartShouldSetResponder={() => true}
            >
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: sectionPadding,
                  right: sectionPadding,
                  width: iconSize + 8,
                  height: iconSize + 8,
                  backgroundColor: '#E7E5E4',
                  borderRadius: (iconSize + 8) / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10000
                }}
                onPress={() => setShowImageModal(false)}
                onStartShouldSetResponder={() => true}
              >
                <Ionicons name="close" size={iconSize} color="#78716C" />
              </TouchableOpacity>

              <Text style={{
                fontSize: headerFontSize,
                fontWeight: 'bold',
                color: '#292524',
                textAlign: 'center',
                marginBottom: sectionPadding * 1.5
              }}>
                Profile Image
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: '#5A4636',
                  borderRadius: 16,
                  paddingVertical: buttonPadding,
                  paddingHorizontal: buttonPadding * 1.5,
                  marginBottom: cardPadding
                }}
                onPress={handleOpenGalleryFromModal}
                disabled={isPicking}
              >
                <Text style={{
                  color: 'white',
                  fontSize: buttonFontSize + 1,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Open Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#5A4636',
                  borderRadius: 16,
                  paddingVertical: buttonPadding,
                  paddingHorizontal: buttonPadding * 1.5,
                  marginBottom: cardPadding
                }}
                onPress={() => {
                  resetToDefaultImage();
                  setShowImageModal(false);
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: buttonFontSize + 1,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Reset to Default
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}


      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ImportantFactor2Screen;