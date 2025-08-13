import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useReservationStore from '../../../store/reservationStore';
import useUserStore from '../../../store/userStore';
import { Reservation } from '../../../types';

const MyPageScreen = ({ navigation }: any) => {
  const [user] = useState({
    name: '상타이거',
    profileImage: null
  });

  const { reservations, fetchUserReservations, loading } = useReservationStore();
  const { user: currentUser } = useUserStore();

  // 화면이 포커스될 때마다 예약 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      if (currentUser?.id) {
        fetchUserReservations(currentUser.id);
      }
    }, [currentUser?.id, fetchUserReservations])
  );

  // 다가오는 예약 가져오기
  const upcomingReservation = reservations
    .filter((reservation: Reservation) => reservation.status === 'confirmed' || reservation.status === 'pending')
    .sort((a: Reservation, b: Reservation) => new Date(a.reservationDate || '').getTime() - new Date(b.reservationDate || '').getTime())[0];

  // 예약이 있는지 확인
  const hasReservations = reservations.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-5 -py-5 border-b border-gray-100">
        <Text className="text-xl font-bold text-neutral-900">My TempleBuk</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity className="p-2">
            <Ionicons name="headset-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="settings-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 사용자 프로필 섹션 */}
        <View className="px-4 py-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mr-4">
              <Ionicons name="paw-outline" size={32} color="#6b7280" />
            </View>
            <View className="flex-1 justify-center">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-lg font-bold text-neutral-900 mr-2">{user.name}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="text-base text-gray-600">프로필 수정</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 현재 예약 확인 섹션 */}
        <View className="mx-4 mb-4">
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <View className="flex-row justify-between items-start mb-3">
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={14} color="white" />
                  <Text className="text-white text-sm font-semibold ml-1">현재 예약</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="bg-blue-600 px-3 py-1 rounded-lg"
                onPress={() => navigation.navigate('Main', { screen: 'MyPage', params: { screen: 'MyReservations' } })}
              >
                <Text className="text-white text-sm font-semibold h-5">확인하기</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-base font-semibold text-neutral-900 mb-3">
              {hasReservations ? '현재 예약한 템플스테이를 확인해보세요' : '아직 예약한 템플스테이가 없습니다'}
            </Text>
            <View className="border-t border-blue-200 pt-3">
              <View className="flex-row items-center">
                <Text className="text-sm text-neutral-700">
                  {hasReservations ? '다가오는 예약' : '첫 번째 예약을 해보세요'}
                </Text>
                <Ionicons name="time" size={16} color="#3b82f6" className="ml-2" />
                {upcomingReservation ? (
                  <Text className="text-sm font-semibold text-blue-600 ml-1">
                    {upcomingReservation.templeName} - {new Date(upcomingReservation.reservationDate || '').toLocaleDateString('ko-KR')}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Temples' })}>
                    <Text className="text-sm font-semibold text-blue-600 ml-1 underline">
                      예약하기
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 통계 요약 섹션 */}
        <View className="mx-4 mb-6">
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <View className="flex-row">
              {/* 쿠폰함 */}
              <View className="flex-1 items-center border-r border-gray-100">
                <View className="w-10 h-10 bg-blue-100 rounded-full justify-center items-center mb-2">
                  <Text className="text-blue-600 text-lg font-bold">%</Text>
                </View>
                <Text className="text-lg font-bold text-neutral-900 mb-1">4장</Text>
                <Text className="text-sm text-neutral-600">쿠폰함</Text>
              </View>

              {/* 포인트 */}
              <View className="flex-1 items-center border-r border-gray-100">
                <View className="w-10 h-10 bg-green-100 rounded-full justify-center items-center mb-2">
                  <Text className="text-green-600 text-lg font-bold">P</Text>
                </View>
                <Text className="text-lg font-bold text-neutral-900 mb-1">0원</Text>
                <Text className="text-sm text-neutral-600">포인트</Text>
              </View>

              {/* 받은 선물 */}
              <View className="flex-1 items-center">
                <View className="w-10 h-10 bg-purple-100 rounded-full justify-center items-center mb-2">
                  <Ionicons name="gift" size={20} color="#8b5cf6" />
                </View>
                <Text className="text-lg font-bold text-neutral-900 mb-1">0원</Text>
                <Text className="text-sm text-neutral-600">받은 선물</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 추가 메뉴들 */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">예약 내역</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="heart-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">찜한 템플</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="star-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">내가 쓴 리뷰</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-4">
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">방문한 템플</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 설정 메뉴들 */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="notifications-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">알림 설정</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <Ionicons name="shield-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">개인정보 설정</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center p-4">
              <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
              <Text className="text-base text-neutral-900 ml-3 flex-1">고객센터</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 여백 */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPageScreen; 