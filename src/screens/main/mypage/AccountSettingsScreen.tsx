import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, TextInput, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../../../services/authService';
import useUserStore from '../../../store/userStore';
import { supabase } from '../../../lib/supabase';

const AccountSettingsScreen = ({ navigation }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { logout: logoutUser } = useUserStore();
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 로그아웃 처리
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // 실제 로그아웃 실행
  const executeLogout = async () => {
    try {
      // Supabase에서 로그아웃
      await AuthService.signOut();
      
      // 로컬 스토어에서 로그아웃 (AsyncStorage도 함께 정리됨)
      await logoutUser();
      
      // 로그인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 회원탈퇴 처리
  const handleDeleteAccount = () => {
    if (showAgreement) {
      if (!agreeToTerms) {
        Alert.alert('알림', '서비스 이용 중단 안내에 동의해주세요.');
        return;
      }
      setShowPasswordModal(true);
    } else {
      // 동의 페이지를 아래로 슬라이드
      setShowAgreement(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // 동의 페이지 토글 (아래로 내리기/위로 올리기)
  const toggleAgreement = () => {
    if (showAgreement) {
      // 위로 올리기
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowAgreement(false);
        setAgreeToTerms(false); // 동의 상태도 초기화
      });
    } else {
      // 아래로 내리기
      setShowAgreement(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // 비밀번호 확인 후 회원탈퇴 실행
  const handlePasswordConfirm = async () => {
    if (!currentPassword.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 현재 사용자의 이메일로 비밀번호 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 비밀번호 확인
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (error) {
        setPasswordError('비밀번호가 올바르지 않습니다.');
        return;
      }

      // 비밀번호 확인 성공 시 회원탈퇴 모달 표시
      setShowPasswordModal(false);
      setCurrentPassword('');
      setPasswordError('');
      setShowDeleteAccountModal(true);
    } catch (error) {
      console.error('Password verification error:', error);
      setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
    }
  };

  // 실제 회원탈퇴 실행
  const executeDeleteAccount = async () => {
    try {
      // 현재 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // Supabase에서 사용자 계정 삭제
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        console.error('Delete account error:', error);
        throw error;
      }
      
      // 로컬 스토어에서 로그아웃
      await logoutUser();
      
      Alert.alert('완료', '계정이 성공적으로 삭제되었습니다.');
      
      // 로그인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('오류', '회원탈퇴 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-stone-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-neutral-800">계정설정</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 bg-stone-100">


                 {/* 계정 관리 메뉴들 */}
         <View className="mx-4 mt-24">
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="text-sm text-red-500 ml-3 flex-1">로그아웃</Text>
              <Ionicons name="chevron-forward" size={16} color="#ef4444" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={toggleAgreement}
            >
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
              <Text className="text-sm text-red-600 ml-3 flex-1">회원탈퇴</Text>
              <Ionicons name="chevron-forward" size={16} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 서비스 이용 중단 안내 - 슬라이드 애니메이션 */}
        <Animated.View 
          className="mx-4 mt-4"
          style={{
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [200, 0],
              })
            }],
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
            height: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200],
            }),
          }}
        >
                                           {showAgreement && (
                        <View className="bg-red-50 rounded-xl border border-red-200 p-4">
                          {/* Service Discontinuation */}
                          <Text className="text-xs font-semibold text-red-800 mb-2">Service Discontinuation</Text>
                          <Text className="text-[11px] text-red-700 leading-4 mb-4">
                            When you withdraw your membership, the app's service will be immediately discontinued.
                          </Text>
                          
                          {/* Personal Information Processing */}
                          <Text className="text-xs font-semibold text-red-800 mb-2">Personal Information Processing</Text>
                          <Text className="text-[11px] text-red-700 leading-4 mb-4">
                            According to relevant laws and privacy policy, the company's retention of member's personal information will be deleted, and information may be retained only in cases where retention is required.
                          </Text>
                          
                          {/* Objection */}
                          <Text className="text-xs font-semibold text-red-800 mb-2">Objection</Text>
                          <Text className="text-[11px] text-red-700 leading-4 mb-4">
                            If you do not agree to the changed terms, you can express your refusal through membership withdrawal.
                          </Text>

                          {/* 동의 체크박스 */}
                          <TouchableOpacity 
                            className="flex-row items-center mb-4"
                            onPress={() => setAgreeToTerms(!agreeToTerms)}
                          >
                            <View className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                              agreeToTerms ? 'bg-red-600 border-red-600' : 'border-red-300'
                            }`}>
                              {agreeToTerms && (
                                <Ionicons name="checkmark" size={14} color="white" />
                              )}
                            </View>
                            <Text className="text-xs text-red-800 font-medium">
                              I understand and agree to the above terms
                            </Text>
                          </TouchableOpacity>

                          {/* 계속하기 버튼 */}
                          <TouchableOpacity 
                            className={`w-full py-3 rounded-xl items-center ${
                              agreeToTerms ? 'bg-red-600' : 'bg-gray-300'
                            }`}
                            onPress={handleDeleteAccount}
                            disabled={!agreeToTerms}
                          >
                            <Text className={`font-semibold text-sm ${
                              agreeToTerms ? 'text-white' : 'text-gray-500'
                            }`}>
                              계속하기
                            </Text>
                          </TouchableOpacity>
                        </View>
           )}
        </Animated.View>

        {/* 하단 여백 */}
        <View className="h-20" />
      </View>

      {/* 로그아웃 모달 */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl p-6 mx-8 w-80 shadow-lg">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="log-out-outline" size={32} color="#ef4444" />
              </View>
              <Text className="text-lg font-bold text-neutral-800 mb-2">
                로그아웃
              </Text>
              <Text className="text-xs text-neutral-600 text-center leading-5">
                정말 로그아웃 하시겠습니까?
              </Text>
            </View>
            
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-sm">
                  취소
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-xl items-center ml-2"
                onPress={() => {
                  setShowLogoutModal(false);
                  executeLogout();
                }}
              >
                <Text className="text-white font-semibold text-sm">
                  로그아웃
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 회원탈퇴 모달 */}
      <Modal
        visible={showDeleteAccountModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteAccountModal(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl p-6 mx-8 w-80 shadow-lg">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="trash-outline" size={32} color="#dc2626" />
              </View>
              <Text className="text-lg font-bold text-neutral-800 mb-2">
                회원탈퇴
              </Text>
              <Text className="text-xs text-neutral-600 text-center leading-5 mb-2">
                정말 계정을 삭제하시겠습니까?
              </Text>
              <Text className="text-[11px] text-red-500 text-center leading-4">
                이 작업은 되돌릴 수 없습니다.
              </Text>
            </View>
            
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                onPress={() => setShowDeleteAccountModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-sm">
                  취소
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-xl items-center ml-2"
                onPress={() => {
                  setShowDeleteAccountModal(false);
                  executeDeleteAccount();
                }}
              >
                <Text className="text-white font-semibold text-sm">
                  삭제
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 비밀번호 확인 모달 */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl p-6 mx-8 w-80 shadow-lg">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="lock-closed-outline" size={32} color="#dc2626" />
              </View>
              <Text className="text-lg font-bold text-neutral-800 mb-2">
                비밀번호 확인
              </Text>
              <Text className="text-xs text-neutral-600 text-center leading-5 mb-4">
                회원탈퇴를 위해 현재 비밀번호를 입력해주세요
              </Text>
            </View>
            
            {/* 비밀번호 입력 */}
            <View className="w-full mb-4">
              <Text className="text-xs font-medium text-neutral-700 mb-2">현재 비밀번호</Text>
              <TextInput
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"
                placeholder="비밀번호를 입력하세요"
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setPasswordError('');
                }}
              />
              {passwordError ? (
                <Text className="text-red-500 text-xs mt-1">{passwordError}</Text>
              ) : null}
            </View>
            
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setPasswordError('');
                }}
              >
                <Text className="text-gray-700 font-semibold text-sm">
                  취소
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-xl items-center ml-2"
                onPress={handlePasswordConfirm}
              >
                <Text className="text-white font-semibold text-sm">
                  확인
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountSettingsScreen;
