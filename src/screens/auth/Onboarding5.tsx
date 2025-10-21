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
import { COLORS } from '../../constants/colors';

const ImportantFactor2Screen = ({ navigation }: any) => {
  const screen = Dimensions.get('window');
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
      // 온보딩 진행 상태 제거
      await AsyncStorage.removeItem('isOnboardingInProgress');

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
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.secondary }}>
        <View
          style={{ flex: 1, paddingHorizontal: screen.width * 0.04, backgroundColor: COLORS.background.secondary }}
        >
            {/* Title - 반응형 크기 */}
            <View style={{ paddingVertical: screen.height * 0.03 }}>
              <Text style={{ 
                fontSize: Math.max(screen.width * 0.06125, 17.5), 
                fontWeight: 'bold', 
                color: COLORS.text.primary, 
                marginLeft: screen.width * 0.04, 
                lineHeight: Math.max(screen.width * 0.08, 24), 
                marginBottom: screen.height * 0.01 
              }}>
                Welcome to TempleBuk!
              </Text>
              {!isGuestMode && (
                <Text style={{ 
                  fontSize: Math.max(screen.width * 0.0525, 15.75), 
                  fontWeight: 'bold', 
                  color: COLORS.text.primary, 
                  marginLeft: screen.width * 0.04, 
                  lineHeight: Math.max(screen.width * 0.07, 22) 
                }}>
                  Set up your profile
                </Text>
              )}
            </View>

            {/* Profile section - 반응형 크기 */}
            <View style={{ 
              paddingHorizontal: screen.width * 0.04, 
              alignItems: 'center', 
              paddingVertical: screen.height * 0.02 
            }}>
              <View style={{ position: 'relative', marginBottom: screen.height * 0.02 }}>
                <View style={{
                  width: Math.max(screen.width * 0.2, 80),
                  height: Math.max(screen.width * 0.2, 80),
                  backgroundColor: COLORS.background.secondary,
                  borderRadius: Math.max(screen.width * 0.1, 40),
                  borderWidth: 2,
                  borderColor: '#D4C4A8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Ionicons name="sunny" size={Math.max(screen.width * 0.1, 40)} color="#FF8C00" />
                  )}
                </View>

                {!isGuestMode && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      bottom: -screen.width * 0.02,
                      right: screen.width * 0.02,
                      width: screen.width * 0.07,
                      height: screen.width * 0.07,
                      backgroundColor: COLORS.brand.sage,
                      borderRadius: screen.width * 0.035,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: 'white'
                    }}
                    onPress={() => setShowImageModal(true)}
                  >
                    <Ionicons name="camera" size={screen.width * 0.035} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Name input - 반응형 크기 */}
              <View style={{ width: Math.max(screen.width * 0.35, 200) }}>
                <TextInput
                  style={{
                    backgroundColor: isGuestMode ? COLORS.neutral[200] : COLORS.background.secondary,
                    borderRadius: Math.max(screen.width * 0.05, 20),
                    borderWidth: 2,
                    borderColor: '#D4C4A8',
                    paddingHorizontal: screen.width * 0.03,
                    paddingVertical: screen.height * 0.015,
                    fontSize: Math.max(screen.width * 0.030625, 12.25),
                    color: isGuestMode ? COLORS.text.tertiary : COLORS.text.primary,
                    minHeight: Math.max(screen.height * 0.06, 40),
                    textAlign: 'center',
                  }}
                  placeholder={isGuestMode ? "Guest" : "Enter your name"}
                  placeholderTextColor={COLORS.text.tertiary}
                  value={userName}
                  onChangeText={(text) => !isGuestMode && setUserName(text)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  editable={!isGuestMode}
                />
              </View>
            </View>

            {/* Onboarding image with button overlay - 반응형 크기 */}
            <View style={{ marginTop: -screen.height * 0.01, alignItems: 'center', position: 'relative' }}>
              <Image
                source={require('../../../assets/onboarding.png')}
                style={{ 
                  width: Math.min(screen.width * 0.99, 500), 
                  height: Math.min(screen.width * 0.99, 500) 
                }}
                resizeMode="contain"
              />
              
              {/* Start button overlay */}
              <View style={{ 
                marginTop: -screen.height * 0.01,
                paddingHorizontal: screen.width * 0.08,
                alignItems: 'center'
              }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: Math.max(screen.width * 0.08, 25),
                    paddingVertical: Math.max(screen.height * 0.025, 18),
                    paddingHorizontal: screen.width * 0.18,
                    minWidth: Math.max(screen.width * 0.8, 250),
                    minHeight: Math.max(screen.height * 0.08, 60),
                    backgroundColor: isGuestMode || userName.trim() !== ''
                      ? COLORS.brand.sage
                      : COLORS.neutral[300],
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
                      fontSize: Math.max(screen.width * 0.039375, 15.75),
                      fontWeight: '700',
                      textAlign: 'center',
                    }}
                  >
                    Start
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        {/* Image picker modal */}
        {showImageModal && !isGuestMode && (
          <TouchableOpacity 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
            activeOpacity={1}
            onPress={() => setShowImageModal(false)}
          >
            <View 
              style={{
                backgroundColor: COLORS.background.secondary,
                borderRadius: screen.width * 0.04,
                padding: screen.width * 0.04,
                marginHorizontal: screen.width * 0.12,
                width: screen.width * 0.75,
                borderWidth: 2,
                borderColor: '#D4C4A8'
              }}
              onStartShouldSetResponder={() => true}
            >
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: screen.width * 0.04,
                  right: screen.width * 0.04,
                  width: screen.width * 0.06,
                  height: screen.width * 0.06,
                  backgroundColor: COLORS.neutral[200],
                  borderRadius: screen.width * 0.03,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10000
                }}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={screen.width * 0.04} color={COLORS.text.tertiary} />
              </TouchableOpacity>

              <Text style={{
                fontSize: screen.width * 0.04375,
                fontWeight: 'bold',
                color: COLORS.text.primary,
                textAlign: 'center',
                marginBottom: screen.height * 0.03
              }}>
                Profile Image
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.brand.sage,
                  borderRadius: screen.width * 0.04,
                  paddingVertical: screen.height * 0.02,
                  paddingHorizontal: screen.width * 0.06,
                  marginBottom: screen.height * 0.02
                }}
                onPress={handleOpenGalleryFromModal}
                disabled={isPicking}
              >
                <Text style={{
                  color: 'white',
                  fontSize: screen.width * 0.035,
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Open Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.brand.sage,
                  borderRadius: screen.width * 0.04,
                  paddingVertical: screen.height * 0.02,
                  paddingHorizontal: screen.width * 0.06,
                  marginBottom: screen.height * 0.02
                }}
                onPress={() => {
                  resetToDefaultImage();
                  setShowImageModal(false);
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: screen.width * 0.035,
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