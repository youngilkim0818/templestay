import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../../../constants/colors';
import Button from '../../../components/common/Button';
import { Reservation } from '../../../types';
import { ReservationService } from '../../../services/reservationService';
import useUserStore from '../../../store/userStore';

// Styled components for NativeWind

const { width } = Dimensions.get('window');

// 예약 번호 생성 함수
const generateReservationNumber = () => {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TS${year}${month}${day}${random}`;
};

type ReservationPaymentScreenProps = {
  navigation: StackNavigationProp<any>;
  route: any;
};

const ReservationPaymentScreen = ({ navigation, route }: ReservationPaymentScreenProps) => {
  const [animationValue] = useState(new Animated.Value(0));
  const [reservationNumber] = useState(generateReservationNumber());
  const { user } = useUserStore();

  const initialReservation: Reservation | undefined = route?.params?.reservation;
  const [reservation, setReservation] = useState<Reservation | undefined>(initialReservation);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // 화면 진입 시 애니메이션
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!initialReservation?.id) return;
      try {
        setLoading(true);
        const fresh = await ReservationService.getReservationById(initialReservation.id);
        setReservation(fresh || initialReservation);
      } catch (e) {
        setReservation(initialReservation);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [initialReservation?.id]);

  const handleComplete = () => {
    Alert.alert(
      '예약이 완료되었습니다!', 
      '예약 확인 문자를 발송해드렸습니다.\n즐거운 템플스테이 되세요!', 
      [
            {
              text: '확인',
              onPress: () => {
                navigation.getParent()?.navigate('Main', { screen: 'Home' });
              }
            }
      ]
    );
  };

  const scaleAnimation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const fadeAnimation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header - ZEN-TECH Style */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
        <View className="w-6" />
        <Text className="text-lg font-semibold text-neutral-900">예약 완료</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Success Animation Section - ZEN-TECH Style */}
        <Animated.View 
          className="items-center py-10"
          style={{
            opacity: fadeAnimation,
            transform: [{ scale: scaleAnimation }]
          }}
        >
          <View className="w-20 h-20 rounded-full bg-sage-100 justify-center items-center mb-6">
            <Ionicons name="checkmark-circle" size={48} color="#4A5D23" />
          </View>
          <Text className="text-3xl font-bold text-sage-600 text-center mb-4">예약이 완료되었습니다!</Text>
          <Text className="text-base text-neutral-600 text-center leading-6">
            마음의 평화를 찾는{"\n"}특별한 여행을 준비해드렸어요
          </Text>
        </Animated.View>

        {/* Reservation Info Card - ZEN-TECH Style */}
        <Animated.View 
          className="bg-sage-50 rounded-2xl p-6 mb-5 border border-sage-200"
          style={{ opacity: fadeAnimation }}
        >
          <View className="flex-row items-center mb-5">
            <View className="w-12 h-12 rounded-2xl bg-sage-100 justify-center items-center mr-3">
              <Ionicons name="temple-outline" size={24} color="#4A5D23" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-sage-600 mb-1">
                {reservation?.programTitle || reservation?.temple_programs?.title || '템플스테이'}
              </Text>
              <Text className="text-sm text-neutral-600">
                {reservation?.templeName || reservation?.temples?.name || '사찰'}
              </Text>
            </View>
          </View>
          
          <View className="h-px bg-sage-200 mb-5" />
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-neutral-600 font-medium">예약번호</Text>
              <Text className="text-sm text-sage-600 font-semibold">{reservation?.id || reservationNumber}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-neutral-600 font-medium">예약자</Text>
              <Text className="text-sm text-sage-600 font-semibold">{reservation?.userName || reservation?.user_name || user?.name || '-'}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-neutral-600 font-medium">날짜</Text>
              <Text className="text-sm text-sage-600 font-semibold">
                {reservation?.reservationDate || reservation?.reservation_date || '-'}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-neutral-600 font-medium">시간</Text>
              <Text className="text-sm text-sage-600 font-semibold">{reservation?.reservationTime || reservation?.reservation_time || '-'}</Text>
            </View>
            {!!reservation?.numberOfPeople && (
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-neutral-600 font-medium">인원</Text>
                <Text className="text-sm text-sage-600 font-semibold">{reservation.numberOfPeople}명</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Payment Info - ZEN-TECH Style */}
        <Animated.View 
          className="bg-white rounded-2xl p-5 mb-4 border border-stone-200"
          style={{ opacity: fadeAnimation }}
        >
          <Text className="text-lg font-bold text-sage-600 mb-4">결제 정보</Text>
          <View className="bg-stone-50 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base text-neutral-600">결제 금액</Text>
              <Text className="text-xl font-bold text-sage-600">
                {reservation?.temple_programs?.price ? `${reservation.temple_programs.price.toLocaleString()}원` : '현장 결제'}
              </Text>
            </View>
            <View className="flex-row items-center bg-coral-50 rounded-xl p-3 border border-coral-200">
              <Ionicons name="information-circle-outline" size={20} color="#FF6B6B" />
              <Text className="text-sm text-coral-600 ml-2 font-medium">
                현장에서 직접 결제해주세요
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Next Steps Guide - ZEN-TECH Style */}
        <Animated.View 
          className="bg-white rounded-2xl p-5 mb-4 border border-stone-200"
          style={{ opacity: fadeAnimation }}
        >
          <Text className="text-lg font-bold text-sage-600 mb-4">다음 단계</Text>
          <View className="space-y-5">
            <View className="flex-row items-start">
              <View className="w-7 h-7 rounded-full bg-sage-600 justify-center items-center mr-4">
                <Text className="text-sm font-bold text-white">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-neutral-900 mb-1">예약 확인 문자 받기</Text>
                <Text className="text-sm text-neutral-600 leading-5">
                  등록하신 연락처로 예약 확인 문자를 발송해드렸습니다
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-7 h-7 rounded-full bg-sage-600 justify-center items-center mr-4">
                <Text className="text-sm font-bold text-white">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-neutral-900 mb-1">사찰 도착 (30분 전)</Text>
                <Text className="text-sm text-neutral-600 leading-5">
                  예약 시간 30분 전까지 불국사에 도착해주세요
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-7 h-7 rounded-full bg-sage-600 justify-center items-center mr-4">
                <Text className="text-sm font-bold text-white">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-neutral-900 mb-1">현장 결제 및 체크인</Text>
                <Text className="text-sm text-neutral-600 leading-5">
                  접수처에서 예약번호를 알려주시고 현장에서 결제해주세요
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Contact Info - ZEN-TECH Style */}
        <Animated.View 
          className="bg-white rounded-2xl p-5 mb-4 border border-stone-200"
          style={{ opacity: fadeAnimation }}
        >
          <Text className="text-lg font-bold text-sage-600 mb-4">문의 연락처</Text>
          <View className="space-y-4">
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={20} color="#4A5D23" />
              <View className="flex-1 ml-3">
                <Text className="text-sm text-neutral-600 mb-0.5">불국사 템플스테이</Text>
                <Text className="text-base font-semibold text-neutral-900">054-746-9913</Text>
              </View>
              <Button
                title=""
                variant="primary"
                size="small"
                icon="call"
                onPress={() => {}}
                className="w-9 h-9 rounded-full min-h-[36px]"
              />
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#4A5D23" />
              <View className="flex-1 ml-3">
                <Text className="text-sm text-neutral-600 mb-0.5">운영 시간</Text>
                <Text className="text-base font-semibold text-neutral-900">오전 9시 - 오후 6시</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Notice - ZEN-TECH Style */}
        <Animated.View 
          className="bg-white rounded-2xl p-5 mb-8 border border-stone-200"
          style={{ opacity: fadeAnimation }}
        >
          <Text className="text-lg font-bold text-sage-600 mb-4">주의사항</Text>
          <View className="space-y-2">
            <Text className="text-sm text-neutral-600 leading-5">• 예약 시간 30분 전까지 도착해주세요</Text>
            <Text className="text-sm text-neutral-600 leading-5">• 편안한 복장으로 오시기 바랍니다</Text>
            <Text className="text-sm text-neutral-600 leading-5">• 사찰 내에서는 정숙을 지켜주세요</Text>
            <Text className="text-sm text-neutral-600 leading-5">• 음주, 흡연은 금지되어 있습니다</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Buttons - ZEN-TECH Style */}
        <Animated.View 
        className="flex-row p-5 border-t border-stone-200 bg-white space-x-3"
        style={{ opacity: fadeAnimation }}
      >
        <Button
          title="예약 정보 공유"
          variant="outline"
          size="medium"
          icon="share-outline"
          iconPosition="left"
          className="flex-1"
          onPress={() => {}}
        />
        
        <Button
          title="확인"
          variant="primary"
          size="medium"
          icon="checkmark-circle"
          iconPosition="right"
          className="flex-2"
          onPress={handleComplete}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

// StyleSheet removed - now using NativeWind classes

export default ReservationPaymentScreen; 