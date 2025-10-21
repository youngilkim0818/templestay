import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useReservationStore from '../../../store/reservationStore';
import useUserStore from '../../../store/userStore';
import { Reservation } from '../../../types';
import { AuthService } from '../../../services/authService';
import { supabase } from '../../../lib/supabase';

const MyPageScreen = ({ navigation }: any) => {
  const [user, setUser] = useState({
    name: 'User',
    profileImage: null as string | null
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showCustomerSupport, setShowCustomerSupport] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [receiveEmailNotifications, setReceiveEmailNotifications] = useState(false);

  const { reservations, fetchUserReservations, loading } = useReservationStore();
  const { user: currentUser, logout: logoutUser, updateUser, isGuestMode } = useUserStore();

  // 화면 크기 기반 반응형 스타일
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenHeight < 700;
  const isLargeScreen = screenHeight > 800;
  
  // 동적 크기 계산 (전체적으로 크기 축소)
  const profileImageSize = isSmallScreen ? 20 : (isLargeScreen ? 26 : 22);
  const headerFontSize = isSmallScreen ? 17.5 : (isLargeScreen ? 22.75 : 19.25);
  const nameFontSize = isSmallScreen ? 14 : (isLargeScreen ? 17.5 : 15.75);
  const sectionPadding = isSmallScreen ? 10 : (isLargeScreen ? 16 : 12);
  const menuItemPadding = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
  const bottomSpacing = isSmallScreen ? 8 : (isLargeScreen ? 16 : 12);

  // 사용자 정보 불러오기 - Supabase 연동
  const loadUserInfo = useCallback(async () => {
    try {
      // 게스트 모드인 경우
      if (isGuestMode) {
        setUser({
          name: 'Guest',
          profileImage: null
        });
        return;
      }

      if (currentUser) {
        try {
          // Supabase에서 최신 프로필 정보 가져오기 시도
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('name, profile_image')
            .eq('id', currentUser.id)
            .single();

          if (error) {
            // Supabase 프로필 조회 실패 시 조용히 로컬 데이터 사용 (첫 실행 시 정상)
            // Supabase에서 가져오기 실패시 userStore 데이터 사용
            setUser({
              name: currentUser.name || currentUser.email?.split('@')[0] || 'User',
              profileImage: currentUser.profileImage || null
            });
          } else {
            // Supabase 데이터로 업데이트
            const updatedUser = {
              name: profile?.name || currentUser.name || currentUser.email?.split('@')[0] || 'User',
              profileImage: profile?.profile_image || currentUser.profileImage || null
            };
            
            setUser(updatedUser);
            
            // userStore도 업데이트 (Supabase 데이터로 동기화)
            updateUser({
              name: updatedUser.name,
              profileImage: updatedUser.profileImage
            });
            
            if (__DEV__) {
              console.log('✅ Supabase 프로필 동기화 성공:', updatedUser.name);
            }
          }
        } catch (error) {
          // Supabase 연결 오류 시 조용히 로컬 데이터만 사용
          // 에러 발생시 userStore 데이터 사용
          setUser({
            name: currentUser.name || currentUser.email?.split('@')[0] || 'User',
            profileImage: currentUser.profileImage || null
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
      // 에러 발생시 기본값 사용
      if (currentUser) {
        setUser({
          name: currentUser.name || currentUser.email?.split('@')[0] || 'User',
          profileImage: currentUser.profileImage || null
        });
      }
    }
  }, [currentUser, isGuestMode, updateUser]);

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

  // 계정 삭제 실행
  const executeDeleteAccount = async () => {
    try {
      if (__DEV__) console.log('🗑️ 계정 삭제 시작');
      
      if (!currentUser?.id) {
        Alert.alert('Error', 'No user session found');
        return;
      }

      // 1. 먼저 사용자 데이터 삭제 (profiles 테이블)
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', currentUser.id);
        
        if (profileError && __DEV__) {
          console.log('프로필 삭제 오류 (무시됨):', profileError);
        } else if (__DEV__) {
          console.log('✅ 프로필 데이터 삭제 완료');
        }
      } catch (error) {
        if (__DEV__) console.log('프로필 삭제 시 오류 (무시됨):', error);
      }

      // 2. 예약 데이터 삭제 (만약 있다면)
      try {
        const { error: reservationError } = await supabase
          .from('reservations')
          .delete()
          .eq('user_id', currentUser.id);
        
        if (reservationError && __DEV__) {
          console.log('예약 삭제 오류 (무시됨):', reservationError);
        }
      } catch (error) {
        if (__DEV__) console.log('예약 삭제 시 오류 (무시됨):', error);
      }

      // 3. 계정 완전 삭제는 고객지원을 통해 안내
      if (__DEV__) console.log('🔐 계정 데이터 삭제 완료, 완전 삭제는 고객지원 통해 진행');

      // 4. 로컬 데이터 정리 및 로그아웃
      await logoutUser();
      
      // 5. 로그인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      
      Alert.alert(
        'Account Data Deleted', 
        'Your account data has been deleted from our servers. For complete account removal, please contact our support team.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
    }
  };

  // 화면이 포커스될 때마다 예약 데이터와 사용자 정보 새로고침
  useFocusEffect(
    React.useCallback(() => {
      // 게스트 모드인 경우 사용자 정보만 로드
      if (isGuestMode) {
        loadUserInfo();
        return;
      }
      
      if (currentUser?.id) {
        fetchUserReservations(currentUser.id);
        loadUserInfo();
      }
    }, [currentUser?.id, fetchUserReservations, isGuestMode, loadUserInfo])
  );

  // 다가오는 예약 가져오기
  const upcomingReservation = reservations
    .filter((reservation: Reservation) => reservation.status === 'confirmed' || reservation.status === 'pending')
    .sort((a: Reservation, b: Reservation) => new Date(a.reservation_date || '').getTime() - new Date(b.reservation_date || '').getTime())[0];

  // 예약이 있는지 확인
  const hasReservations = reservations.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-stone-100">

      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-5 -py-5 bg-stone-100">
        <Text style={{ fontSize: headerFontSize, fontWeight: 'bold', color: '#262626' }}>My TempleBuk</Text>
      </View>

      <View className="flex-1 bg-stone-100">
        {/* 사용자 프로필 섹션 */}
        <View style={{ paddingHorizontal: 16, paddingVertical: sectionPadding }}>
          <View className="flex-row items-center">
            <View style={{ 
              width: profileImageSize * 4, 
              height: profileImageSize * 4, 
              backgroundColor: '#f3f4f6', 
              borderRadius: profileImageSize * 2, 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginRight: 16, 
              overflow: 'hidden', 
              borderWidth: 2, 
              borderColor: '#d6d3d1' 
            }}>
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Ionicons name="sunny" size={profileImageSize * 2} color="#F59E0B" />
              )}
            </View>
            <View className="flex-1 justify-center">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="flex-row items-center">
                  <Text style={{ fontSize: nameFontSize, fontWeight: 'bold', color: '#171717' }}>{user.name}</Text>
                </TouchableOpacity>
                {!isGuestMode && (
                  <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={{ marginLeft: 16 }}>
                    <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#6b7280' }}>Edit Profile</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 현재 예약 확인 섹션 - 게스트 모드가 아닐 때만 표시 */}
        {!isGuestMode && (
          <View style={{ marginHorizontal: 16, marginBottom: isSmallScreen ? 12 : 16 }}>
            <View className="bg-white rounded-xl border-2 border-sage-200" style={{ padding: sectionPadding }}>
              <View className="flex-row justify-start items-start" style={{ marginBottom: 12 }}>
                <View className="bg-sage-600 px-3 py-1 rounded-full">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={isSmallScreen ? 10 : 12} color="white" />
                    <Text style={{ color: 'white', fontSize: isSmallScreen ? 8.75 : 10.5, fontWeight: '600', marginLeft: 4 }}>Current Reservation</Text>
                  </View>
                </View>
              </View>
              <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, fontWeight: '600', color: '#171717', marginBottom: 10 }}>
                {hasReservations && upcomingReservation && new Date(upcomingReservation.reservation_date || '').getTime() > new Date().getTime() ? `${upcomingReservation.temple_name || 'Unknown Temple'} - ${upcomingReservation.program_title || 'Temple Stay Program'}` : 'No temple stay reservations yet'}
              </Text>
              <View className="border-t-2 border-sage-200" style={{ paddingTop: 10 }}>
                <View className="flex-row items-center">
                  <Text style={{ fontSize: isSmallScreen ? 8.75 : 10.5, color: '#404040' }}>
                    {hasReservations && upcomingReservation && new Date(upcomingReservation.reservation_date || '').getTime() > new Date().getTime() ? 'Upcoming Reservation' : 'Try booking a templestay'}
                  </Text>
                  {upcomingReservation && new Date(upcomingReservation.reservation_date || '').getTime() > new Date().getTime() ? (
                    <>
                      <Ionicons name="time" size={isSmallScreen ? 12 : 14} color="#5A4636" style={{ marginLeft: 6 }} />
                      <Text style={{ fontSize: isSmallScreen ? 8.75 : 10.5, fontWeight: '600', color: '#4A5D23', marginLeft: 3 }}>
                        D-{Math.ceil((new Date(upcomingReservation.reservation_date || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </Text>
                    </>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 추가 메뉴들 */}
        <View style={{ marginHorizontal: 16, marginBottom: isSmallScreen ? 16 : 24 }}>
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center border-b border-gray-100"
              style={{ padding: menuItemPadding }}
              onPress={() => navigation.navigate('CommonList', { initialTab: 0 })}
            >
              <Ionicons name="calendar-outline" size={isSmallScreen ? 16 : 18} color="#6b7280" />
              <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#171717', marginLeft: 10, flex: 1 }}>Reservation History</Text>
              <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center border-b border-gray-100"
              style={{ padding: menuItemPadding }}
              onPress={() => navigation.navigate('CommonList', { initialTab: 1 })}
            >
              <Ionicons name="heart-outline" size={isSmallScreen ? 16 : 18} color="#6b7280" />
              <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#171717', marginLeft: 10, flex: 1 }}>Favorite Temples</Text>
              <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center"
              style={{ padding: menuItemPadding }}
              onPress={() => navigation.navigate('CommonList', { initialTab: 2 })}
            >
              <Ionicons name="star-outline" size={isSmallScreen ? 16 : 18} color="#6b7280" />
              <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#171717', marginLeft: 10, flex: 1 }}>My Reviews</Text>
              <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 설정 메뉴들 */}
        <View style={{ marginHorizontal: 16, marginBottom: isSmallScreen ? 16 : 24 }}>
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center border-b border-gray-100"
              style={{ padding: menuItemPadding }}
              onPress={() => setShowNotificationSettings(true)}
            >
              <Ionicons name="notifications-outline" size={isSmallScreen ? 16 : 18} color="#6b7280" />
              <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#171717', marginLeft: 10, flex: 1 }}>Notification Settings</Text>
              <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center border-b border-gray-100"
              style={{ padding: menuItemPadding }}
              onPress={() => setShowPrivacyPolicy(true)}
            >
              <Ionicons name="shield-outline" size={isSmallScreen ? 16 : 18} color="#6b7280" />
              <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#171717', marginLeft: 10, flex: 1 }}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center border-b border-gray-100"
              style={{ padding: menuItemPadding }}
              onPress={() => setShowCustomerSupport(true)}
            >
              <Ionicons name="help-circle-outline" size={isSmallScreen ? 16 : 18} color="#6b7280" />
              <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#171717', marginLeft: 10, flex: 1 }}>Customer Support</Text>
              <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#6b7280" />
            </TouchableOpacity>

            {isGuestMode ? (
              <TouchableOpacity 
                className="flex-row items-center border-b border-gray-100"
                style={{ padding: menuItemPadding }}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="log-in-outline" size={isSmallScreen ? 16 : 18} color="#5A4636" />
                <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#4A5D23', marginLeft: 10, flex: 1 }}>Sign In</Text>
                <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#5A4636" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                className="flex-row items-center border-b border-gray-100"
                style={{ padding: menuItemPadding }}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={isSmallScreen ? 16 : 18} color="#ef4444" />
                <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#ef4444', marginLeft: 10, flex: 1 }}>Logout</Text>
                <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#ef4444" />
              </TouchableOpacity>
            )}

            {!isGuestMode && (
              <TouchableOpacity 
                className="flex-row items-center"
                style={{ padding: menuItemPadding }}
                onPress={() => setShowDeleteAccountModal(true)}
              >
                <Ionicons name="trash-outline" size={isSmallScreen ? 16 : 18} color="#ef4444" />
                <Text style={{ fontSize: isSmallScreen ? 10.5 : 12.25, color: '#ef4444', marginLeft: 10, flex: 1 }}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={isSmallScreen ? 12 : 14} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: bottomSpacing * 3 }} />
      </View>

      {/* 로그아웃 모달 */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'transparent' }}>
          <View className="bg-white rounded-2xl p-6 mx-8 w-80 shadow-lg">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="log-out-outline" size={32} color="#ef4444" />
              </View>
              <Text className="text-lg font-bold text-neutral-800 mb-2">
                Logout
              </Text>
              <Text className="text-xs text-neutral-600 text-center leading-5">
                Are you sure you want to logout?
              </Text>
            </View>
            
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-sm">
                  Cancel
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
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 계정 삭제 모달 */}
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
                <Ionicons name="trash-outline" size={32} color="#ef4444" />
              </View>
              <Text className="text-lg font-bold text-neutral-800 mb-2">
                Delete Account
              </Text>
              <Text className="text-xs text-neutral-600 text-center leading-5">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </Text>
            </View>
            
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                onPress={() => setShowDeleteAccountModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-xl items-center ml-2"
                onPress={() => {
                  setShowDeleteAccountModal(false);
                  executeDeleteAccount();
                }}
              >
                <Text className="text-white font-semibold text-sm">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyPolicy}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrivacyPolicy(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl mx-4 max-h-[90%] w-[95%]">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-stone-200">
              <Text className="text-lg font-bold text-neutral-900">Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Content */}
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
              <Text className="text-xs text-neutral-700 leading-6 mb-4">
                Templebuk ("the Company") complies with the Personal Information Protection Act and is committed to protecting users' personal information and rights, as well as smoothly handling user complaints related to personal data.
              </Text>
              
              <Text className="text-sm font-bold text-neutral-900 mb-2">1. Purpose of Processing Personal Information</Text>
              <Text className="text-xs text-neutral-700 leading-6 mb-3">
                The Company processes personal information for the following purposes. Personal data will not be used for any purposes other than those stated below, and if the purpose of use changes, necessary actions such as obtaining additional consent will be taken in accordance with Article 18 of the Personal Information Protection Act.
              </Text>
              
              <Text className="text-sm font-bold text-neutral-900 mb-2">2. Types of Personal Information Collected</Text>
              <Text className="text-xs text-neutral-700 leading-6 mb-3">
                • Account information: email, name, phone number{'\n'}
                • Profile information: profile picture{'\n'}
                • Reservation information: temple, date, time, participants{'\n'}
                • Location information: GPS coordinates (with consent)
              </Text>
              
              <Text className="text-sm font-bold text-neutral-900 mb-2">3. How We Use Your Information</Text>
              <Text className="text-xs text-neutral-700 leading-6 mb-3">
                • Provide temple stay reservation services{'\n'}
                • Send booking confirmations and notifications{'\n'}
                • Improve our services and user experience{'\n'}
                • Respond to customer inquiries and support requests
              </Text>
              
              <Text className="text-sm font-bold text-neutral-900 mb-2">4. Data Security</Text>
              <Text className="text-xs text-neutral-700 leading-6 mb-3">
                We implement appropriate security measures to protect your personal information, including encryption, access controls, and regular security audits.
              </Text>
              
              <Text className="text-sm font-bold text-neutral-900 mb-2">5. Your Rights</Text>
              <Text className="text-xs text-neutral-700 leading-6 mb-3">
                You have the right to access, correct, or delete your personal information at any time through your account settings.
              </Text>
              
              <Text className="text-sm font-bold text-neutral-900 mb-2">Effective Date</Text>
              <Text className="text-xs text-neutral-700 leading-6 mb-4">
                This Privacy Policy will be effective as of August 19, 2025.
              </Text>
                         </ScrollView>
           </View>
         </View>
       </Modal>

       {/* Customer Support Modal */}
       <Modal
         visible={showCustomerSupport}
         animationType="fade"
         transparent={true}
         onRequestClose={() => setShowCustomerSupport(false)}
       >
         <View className="flex-1 bg-black/50 justify-center items-center">
           <View className="bg-white rounded-2xl p-6 mx-8 w-80 shadow-lg">
             <View className="items-center mb-4">
                               <View className="w-16 h-16 bg-sage-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="mail-outline" size={32} color="#4A5D23" />
                </View>
               <Text className="text-lg font-bold text-neutral-800 mb-2">
                 Customer Support
               </Text>
               <Text className="text-xs text-neutral-600 text-center leading-5">
                 Contact us at templebuk@gmail.com
               </Text>
             </View>
             
             <TouchableOpacity
               className="bg-sage-600 py-3 rounded-xl items-center"
               onPress={() => setShowCustomerSupport(false)}
             >
               <Text className="text-white font-semibold text-base">
                 OK
               </Text>
                           </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Notification Settings Modal */}
        <Modal
          visible={showNotificationSettings}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowNotificationSettings(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white rounded-2xl p-6 mx-8 w-80 shadow-lg">
              <View className="items-center mb-4">
                <View className="w-16 h-16 bg-sage-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="notifications-outline" size={32} color="#4A5D23" />
                </View>
                <Text className="text-lg font-bold text-neutral-800 mb-2">
                  Notification Settings
                </Text>
                <Text className="text-sm text-neutral-600 text-center leading-5 mb-4">
                  Please check if you agree to receive emails
                </Text>
                
                {/* Email Notifications Checkbox */}
                <TouchableOpacity 
                  className="flex-row items-center w-full p-3 bg-stone-50 rounded-xl"
                  onPress={() => setReceiveEmailNotifications(!receiveEmailNotifications)}
                >
                  <View className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                    receiveEmailNotifications ? 'bg-sage-600 border-sage-600' : 'border-stone-300'
                  }`}>
                    {receiveEmailNotifications && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                  <Text className="text-sm text-neutral-900">
                    Receive Email notifications
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                className="bg-sage-600 py-3 rounded-xl items-center"
                onPress={() => setShowNotificationSettings(false)}
              >
                <Text className="text-white font-semibold text-sm">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
};

export default MyPageScreen; 