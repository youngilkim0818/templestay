import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { TempleStackParamList } from '../../../navigation/TempleStackNavigator';
import useReservationStore from '../../../store/reservationStore';
import useUserStore from '../../../store/userStore';
import { ReservationService } from '../../../services/reservationService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { COLORS } from '../../../constants/colors';
import Button from '../../../components/common/Button';

// Styled components for NativeWind

const { width } = Dimensions.get('window');

type ConfirmScreenRouteProp = RouteProp<TempleStackParamList, 'ReservationConfirm'>;

interface Props {
  route: any;
  navigation: any;
}

const ReservationConfirmScreen = ({ route, navigation }: Props) => {
  const { reservationDetails } = route.params || {};
  
  // Store 상태
  const { currentReservation, setLoading, setError } = useReservationStore();
  const { user, isLoggedIn } = useUserStore();
  
  // 상태 관리
  const [agreeNotice, setAgreeNotice] = useState(false);
  const [request, setRequest] = useState('');
  const [showTempleInfo, setShowTempleInfo] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeThird, setAgreeThird] = useState(false);
  const [loading, setLocalLoading] = useState(false);

  // 사용자 정보 (실제 사용자 데이터 사용)
  const userName = user?.name || user?.displayName || '이름 없음';
  const userPhone = user?.phone || '연락처 없음';
  const userEmail = user?.email || 'email@example.com';

  // 예약 데이터 추출
  const reservationData = currentReservation || reservationDetails || {};
  const templeName = reservationData.templeName || 'Temple Stay';
const programTitle = reservationData.programTitle || 'Experience Type Temple Stay';
  const reservationDate = reservationData.reservationDate || new Date().toISOString().split('T')[0];
  const reservationTime = reservationData.reservationTime || '오전 11:00';
  const numberOfPeople = reservationData.numberOfPeople || 1;
  const programPrice = reservationData.programPrice || 35000;

  // 모든 동의 완료 여부
  const allAgreementsChecked = agreeNotice && agreeTerms && agreePrivacy && agreeThird;

  const handleReservation = async () => {
    if (!allAgreementsChecked) {
      Alert.alert('알림', '모든 약관에 동의해주세요.');
      return;
    }

    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      navigation.getParent()?.navigate('SnsLogin');
      return;
    }

    try {
      setLocalLoading(true);
      setLoading('creating', true);

      const reservationPayload = {
        userId: user.id,
        templeId: reservationData.templeId,
        programId: reservationData.programId,
        reservationDate: reservationDate,
        reservationTime: reservationTime,
        userName: userName,
        userPhone: userPhone,
        userEmail: userEmail,
        hasAllergies: false, // 추후 알레르기 정보 수집 기능 추가
        specialRequests: request
      };

      const newReservation = await ReservationService.createReservation(reservationPayload);
      
      Alert.alert(
        '예약 완료',
        '예약이 성공적으로 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              navigation.getParent()?.navigate('Main', { screen: 'Home' });
            }
          }
        ]
      );

    } catch (error) {
      console.error('예약 생성 오류:', error);
      Alert.alert('오류', '예약 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLocalLoading(false);
      setLoading('creating', false);
    }
  };

  // 비로그인 접근 가드
  useEffect(() => {
    if (!isLoggedIn) {
      navigation.getParent()?.navigate('SnsLogin');
    }
  }, [isLoggedIn, navigation]);

  // ZEN-TECH CheckBox 컴포넌트
  const CheckBox = ({ checked, onPress, label, required = false }: {
    checked: boolean;
    onPress: () => void;
    label: string;
    required?: boolean;
  }) => (
    <TouchableOpacity 
      className="flex-row items-center mb-4" 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View className={`w-5 h-5 rounded border-2 items-center justify-center mr-3 ${
        checked 
          ? 'bg-sage-600 border-sage-600' 
          : 'border-stone-300'
      }`}>
        {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      <Text className="text-sm text-neutral-700 flex-1">
        {label}
        {required && <Text className="text-coral-500"> *</Text>}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header - ZEN-TECH Style */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-neutral-900">
          예약 확인
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title Section - ZEN-TECH Style */}
        <View className="pt-8 pb-8">
          <Text className="text-3xl font-light text-sage-600 leading-10 mb-4">
            예약 내용을{"\n"}확인해주세요
          </Text>
          <Text className="text-base text-neutral-600 leading-6">
            모든 정보가 정확한지{"\n"}한 번 더 확인 부탁드려요
          </Text>
        </View>

        {/* Reservation Summary - ZEN-TECH Style */}
        <View className="bg-sage-50 rounded-2xl p-5 mb-5 border border-sage-200">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-2xl bg-sage-100 justify-center items-center mr-3">
              <Ionicons name="temple-outline" size={24} color="#4A5D23" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-semibold text-sage-600 mb-1">
                {programTitle}
              </Text>
              <Text className="text-sm text-neutral-600">
                {templeName}
              </Text>
            </View>
          </View>
          
          <View className="border-t border-sage-200 pt-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="people-outline" size={16} color="#4A5D23" />
              <Text className="text-sm text-neutral-700 ml-2 font-medium">
                {numberOfPeople}명
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={16} color="#4A5D23" />
              <Text className="text-sm text-neutral-700 ml-2 font-medium">
                {new Date(reservationDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short'
                })}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#4A5D23" />
              <Text className="text-sm text-neutral-700 ml-2 font-medium">
                {reservationTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Amount - ZEN-TECH Style */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-stone-200">
          <Text className="text-lg font-semibold text-sage-600 mb-4">결제 금액</Text>
          <View className="bg-stone-50 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-neutral-600">{programTitle} 체험비</Text>
              <Text className="text-sm text-neutral-700 font-medium">
                {programPrice.toLocaleString()}원
              </Text>
            </View>
            <View className="h-px bg-stone-200 my-3" />
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-semibold text-neutral-900">총 결제 금액</Text>
              <Text className="text-lg font-bold text-sage-600">
                {(programPrice * numberOfPeople).toLocaleString()}원
              </Text>
            </View>
          </View>
          <View className="flex-row items-center bg-coral-50 rounded-xl p-3 mt-3 border border-coral-200">
            <Ionicons name="information-circle-outline" size={16} color="#FF6B6B" />
            <Text className="text-sm text-coral-600 ml-2 font-medium">
              현장에서 직접 결제해주세요
            </Text>
          </View>
        </View>

        {/* User Info - ZEN-TECH Style */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-stone-200">
          <Text className="text-lg font-semibold text-sage-600 mb-4">예약자 정보</Text>
          <View className="bg-stone-50 rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-neutral-600 w-16">이름</Text>
              <Text className="text-sm text-neutral-700 font-medium flex-1">{userName}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-neutral-600 w-16">연락처</Text>
              <View className="flex-row items-center flex-1">
                <Text className="text-sm text-neutral-700 font-medium flex-1">{userPhone}</Text>
                <Button
                  title="확인"
                  variant="primary"
                  size="small"
                  onPress={() => {}}
                />
              </View>
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-sm text-neutral-600 w-16">이메일</Text>
              <Text className="text-sm text-neutral-700 font-medium flex-1">{userEmail}</Text>
            </View>
            <Button
              title="정보 수정"
              variant="ghost"
              size="small"
              icon="pencil-outline"
              iconPosition="left"
              onPress={() => {}}
              className="self-end"
            />
          </View>
        </View>

        {/* Special Requests - ZEN-TECH Style */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-stone-200">
          <Text className="text-lg font-semibold text-sage-600 mb-4">요청사항</Text>
          <TextInput
            className="bg-stone-50 rounded-xl p-4 text-sm text-neutral-700 min-h-24 border border-stone-200"
            value={request}
            onChangeText={setRequest}
            placeholder="특별한 요청사항이 있으시면 작성해주세요 (선택)"
            placeholderTextColor="#9AA0A6"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Notices - ZEN-TECH Style */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-stone-200">
          <Text className="text-lg font-semibold text-sage-600 mb-4">주의사항</Text>
          <View className="bg-stone-50 rounded-xl p-4 mb-4">
            <Text className="text-sm text-neutral-600 leading-5">
              • 예약 시간 30분 전까지 도착해주세요{"\n"}
              • 사찰 내 정숙을 지켜주세요{"\n"}
              • 음주, 흡연은 금지되어 있습니다{"\n"}
              • 편안한 복장으로 오시기 바랍니다
            </Text>
          </View>
          <CheckBox
            checked={agreeNotice}
            onPress={() => setAgreeNotice(!agreeNotice)}
            label="주의사항을 확인했습니다"
            required
          />
        </View>

        {/* 사찰 정보 - ZEN-TECH Style */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-stone-200">
          <TouchableOpacity 
            className="flex-row items-center justify-between"
            onPress={() => setShowTempleInfo(!showTempleInfo)}
          >
            <Text className="text-lg font-semibold text-sage-600">사찰 정보</Text>
            <Ionicons 
              name={showTempleInfo ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#9AA0A6" 
            />
          </TouchableOpacity>
          {showTempleInfo && (
            <View className="mt-4 pt-4 border-t border-stone-200">
              <Text className="text-sm text-neutral-600 leading-5 mb-4">
                불국사는 신라 시대 불교 예술의 정수를 보여주는 유네스코 세계문화유산입니다. 
                다보탑, 석가탑 등 수많은 국보와 함께 찬란했던 불교 문화를 생생하게 느낄 수 있습니다.
              </Text>
              <View className="bg-stone-50 rounded-xl p-3">
                <Text className="text-sm text-neutral-700 font-medium mb-1">연락처: 054-746-9913</Text>
                <Text className="text-sm text-neutral-700 font-medium">주소: 경상북도 경주시 불국로 385</Text>
              </View>
            </View>
          )}
        </View>

        {/* 개인정보 처리 - ZEN-TECH Style */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-stone-200">
          <TouchableOpacity 
            className="flex-row items-center justify-between"
            onPress={() => setShowPrivacy(!showPrivacy)}
          >
            <Text className="text-lg font-semibold text-sage-600">개인정보 처리</Text>
            <Ionicons 
              name={showPrivacy ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#9AA0A6" 
            />
          </TouchableOpacity>
          {showPrivacy && (
            <View className="mt-4 pt-4 border-t border-stone-200">
              <Text className="text-sm text-neutral-600 leading-5">
                개인정보는 예약 확인 및 서비스 제공 목적으로만 사용되며, 
                제3자에게 제공되지 않습니다. 자세한 내용은 개인정보처리방침을 확인해주세요.
              </Text>
            </View>
          )}
        </View>

        {/* Agreement Section - ZEN-TECH Style */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-sage-600 mb-4">약관 동의</Text>
          <View className="bg-white rounded-2xl p-5 border border-stone-200">
            <CheckBox
              checked={agreeTerms}
              onPress={() => setAgreeTerms(!agreeTerms)}
              label="이용약관 동의"
              required
            />
            <CheckBox
              checked={agreePrivacy}
              onPress={() => setAgreePrivacy(!agreePrivacy)}
              label="개인정보 수집 및 이용 동의"
              required
            />
            <CheckBox
              checked={agreeThird}
              onPress={() => setAgreeThird(!agreeThird)}
              label="개인정보 제3자 제공 동의"
              required
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button - ZEN-TECH Style */}
      <View className="p-5 border-t border-stone-200 bg-white">
        {loading ? (
          <View className="flex-row items-center justify-center bg-sage-50 rounded-2xl py-4 px-6">
            <LoadingSpinner />
            <Text className="text-base font-semibold text-sage-600 ml-3">예약 처리 중...</Text>
          </View>
        ) : (
          <Button
            title="예약 완료하기"
            variant="primary"
            size="large"
            icon="checkmark-circle"
            iconPosition="right"
            disabled={!allAgreementsChecked || loading}
            onPress={handleReservation}
            fullWidth
          />
        )}
      </View>
    </SafeAreaView>
  );
};

// StyleSheet removed - now using NativeWind classes

export default ReservationConfirmScreen; 