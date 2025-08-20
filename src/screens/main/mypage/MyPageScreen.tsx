import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useReservationStore from '../../../store/reservationStore';
import useUserStore from '../../../store/userStore';
import { Reservation } from '../../../types';
import { AuthService } from '../../../services/authService';

const MyPageScreen = ({ navigation }: any) => {
  const [user, setUser] = useState({
    name: 'User',
    profileImage: null as string | null
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { reservations, fetchUserReservations, loading } = useReservationStore();
  const { user: currentUser, logout: logoutUser } = useUserStore();

  // 사용자 정보 불러오기 - Supabase 연동
  const loadUserInfo = async () => {
    try {
      if (currentUser) {
        setUser({
          name: currentUser.name || currentUser.email?.split('@')[0] || 'User',
          profileImage: currentUser.profileImage || null
        });
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

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

  // 화면이 포커스될 때마다 예약 데이터와 사용자 정보 새로고침
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser?.id) {
        fetchUserReservations(currentUser.id);
        loadUserInfo();
      }
    }, [currentUser?.id, fetchUserReservations])
  );

  // 다가오는 예약 가져오기
  const upcomingReservation = reservations
    .filter((reservation: Reservation) => reservation.status === 'confirmed' || reservation.status === 'pending')
    .sort((a: Reservation, b: Reservation) => new Date(a.reservation_date || a.reservationDate || '').getTime() - new Date(b.reservation_date || b.reservationDate || '').getTime())[0];

  // 예약이 있는지 확인
  const hasReservations = reservations.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-stone-100">

      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-5 -py-5 bg-stone-100">
        <Text className="text-3xl font-bold text-neutral-900">My TempleBuk</Text>
      </View>

      <View className="flex-1 bg-stone-100">
        {/* 사용자 프로필 섹션 */}
        <View className="px-4 py-6">
          <View className="flex-row items-center">
            <View className="w-28 h-28 bg-gray-200 rounded-full justify-center items-center mr-4 overflow-hidden border-2 border-stone-300">
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} className="w-full h-full" />
              ) : (
                <Ionicons name="sunny" size={56} color="#F59E0B" />
              )}
            </View>
            <View className="flex-1 justify-center">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-2xl font-bold text-neutral-900">{user.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} className="ml-4">
                  <Text className="text-base text-gray-600">Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 현재 예약 확인 섹션 */}
        <View className="mx-4 mb-4">
          <View className="bg-white rounded-xl p-4 border-2 border-sage-200">
            <View className="flex-row justify-start items-start mb-3">
              <View className="bg-sage-600 px-3 py-1 rounded-full">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={14} color="white" />
                  <Text className="text-white text-sm font-semibold ml-1">Current Reservation</Text>
                </View>
              </View>
            </View>
            <Text className="text-base font-semibold text-neutral-900 mb-3">
                              {hasReservations && upcomingReservation && new Date(upcomingReservation.reservation_date || upcomingReservation.reservationDate || '').getTime() > new Date().getTime() ? `${upcomingReservation.temple_name || upcomingReservation.templeName || 'Unknown Temple'} - ${upcomingReservation.program_title || upcomingReservation.programName || 'Temple Stay Program'}` : 'No temple stay reservations yet'}
            </Text>
            <View className="border-t-2 border-sage-200 pt-3">
              <View className="flex-row items-center">
                <Text className="text-sm text-neutral-700">
                  {hasReservations && upcomingReservation && new Date(upcomingReservation.reservation_date || upcomingReservation.reservationDate || '').getTime() > new Date().getTime() ? 'Upcoming Reservation' : 'Try booking a templestay'}
                </Text>
                {upcomingReservation && new Date(upcomingReservation.reservation_date || upcomingReservation.reservationDate || '').getTime() > new Date().getTime() ? (
                  <>
                    <Ionicons name="time" size={16} color="#5A4636" className="ml-2" />
                    <Text className="text-sm font-semibold text-sage-700 ml-1">
                      D-{Math.ceil((new Date(upcomingReservation.reservation_date || upcomingReservation.reservationDate || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </Text>
                  </>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* 추가 메뉴들 */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => navigation.navigate('CommonList', { initialTab: 0 })}
            >
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">Reservation History</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => navigation.navigate('CommonList', { initialTab: 1 })}
            >
              <Ionicons name="heart-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">Favorite Temples</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => navigation.navigate('CommonList', { initialTab: 2 })}
            >
              <Ionicons name="star-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">My Reviews</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            

          </View>
        </View>

        {/* 설정 메뉴들 */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="notifications-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">Notification Settings</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="shield-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">Privacy Settings</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">Customer Support</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="text-base text-red-500 ml-3 flex-1">Logout</Text>
              <Ionicons name="chevron-forward" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

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
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'transparent' }}>
          <View className="bg-white rounded-2xl p-6 mx-8 w-80 shadow-lg">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="log-out-outline" size={32} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-neutral-800 mb-2">
                Logout
              </Text>
              <Text className="text-sm text-neutral-600 text-center leading-5">
                Are you sure you want to logout?
              </Text>
            </View>
            
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-gray-700 font-semibold text-base">
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
                <Text className="text-white font-semibold text-base">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MyPageScreen; 