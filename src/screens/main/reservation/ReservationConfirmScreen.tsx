import React, { useState, useLayoutEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Modal, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TempleStackParamList } from '../../../navigation/TempleStackNavigator';
import { Temple } from '../../../types';
import { TEMPLES_DATA } from '../../../data/temple-data';
import useReservationStore from '../../../store/reservationStore';
import useUserStore from '../../../store/userStore';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isLargeScreen = height > 800;

// Responsive sizes
const headerFontSize = isSmallScreen ? 16 : (isLargeScreen ? 22 : 18);
const subHeaderFontSize = isSmallScreen ? 11 : (isLargeScreen ? 15 : 13);
const cardPadding = isSmallScreen ? 8 : (isLargeScreen ? 14 : 10);
const cardMargin = isSmallScreen ? 3 : (isLargeScreen ? 6 : 4);
const templeImageHeight = isSmallScreen ? 100 : (isLargeScreen ? 140 : 120);
const templeTitleSize = isSmallScreen ? 13 : (isLargeScreen ? 17 : 15);
const templeDescSize = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
const templeDistanceSize = isSmallScreen ? 9 : (isLargeScreen ? 13 : 11);
const sectionPadding = isSmallScreen ? 8 : (isLargeScreen ? 14 : 10);
const iconSize = isSmallScreen ? 14 : (isLargeScreen ? 20 : 18);
const buttonPadding = isSmallScreen ? 6 : (isLargeScreen ? 10 : 8);
const buttonFontSize = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
const programTitleSize = isSmallScreen ? 13 : (isLargeScreen ? 17 : 15);
const programDescSize = isSmallScreen ? 9 : (isLargeScreen ? 13 : 11);
const priceFontSize = isSmallScreen ? 11 : (isLargeScreen ? 15 : 13);
const totalPriceFontSize = isSmallScreen ? 14 : (isLargeScreen ? 20 : 16);

type ReservationConfirmRouteProp = RouteProp<TempleStackParamList, 'ReservationConfirm'>;

interface ReservationConfirmParams {
  temple: Temple;
  selectedProgram: any;
  selectedDate: string[]; // Date[]에서 string[]로 변경
  participants: {
    adults: number;
    teenagers: number;
    children: number;
    preschool: number;
  };
  totalAmount: number;
}

const ReservationConfirmScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TempleStackParamList>>();
  const route = useRoute<ReservationConfirmRouteProp>();
  const { temple, selectedProgram, selectedDate: initialSelectedDate, participants: initialParticipants, totalAmount } = route.params;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank' | 'onsite' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showReservationCompleteModal, setShowReservationCompleteModal] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState<string[]>(initialSelectedDate);
  const [tempParticipants, setTempParticipants] = useState(initialParticipants);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string[]>(initialSelectedDate);
  const [participants, setParticipants] = useState(initialParticipants);
  
  const { createReservation } = useReservationStore();
  const { user } = useUserStore();

  // 네비게이션 헤더 수정
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
      ),
      headerTitle: '',
      headerStyle: {
        backgroundColor: '#F5F5F4', // stone-100
      },
    });
  }, [navigation]);

  const handlePaymentMethodSelect = (method: 'bank' | 'onsite') => {
    // 이미 선택된 방식이라면 해제, 아니면 선택
    setSelectedPaymentMethod(selectedPaymentMethod === method ? null : method);
  };

  const handleDateSelect = (date: string) => {
    const today = new Date();
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    
    // 이미 선택된 날짜라면 해제
    if (tempSelectedDate.includes(date)) {
      setTempSelectedDate([]);
    } else {
      // 새로운 날짜 선택
      setTempSelectedDate([date, nextDay.toISOString().split('T')[0]]);
    }
  };

  const handleParticipantsChange = (type: 'adults' | 'teenagers' | 'children' | 'preschool', value: number) => {
    setTempParticipants(prev => ({
      ...prev,
      [type]: Math.max(0, value)
    }));
  };

  const handleDateModalConfirm = () => {
    setSelectedDate(tempSelectedDate);
    setShowDateModal(false);
  };

  const handleParticipantsModalConfirm = () => {
    setParticipants(tempParticipants);
    setShowParticipantsModal(false);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, firstDayOfWeek };
  };

  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const handleConfirmReservation = async () => {
    if (!user) {
      Alert.alert("Login Required", "You need to be logged in to make a reservation.");
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert("Payment Method Required", "Please select a payment method.");
      return;
    }

    setIsLoading(true);

    try {
      const reservationData = {
        templeId: temple.id,
        templeName: temple.name,
        programTitle: selectedProgram.title,
        reservationDate: selectedDate[0], // 이미 문자열이므로 그대로 사용
        reservationTime: selectedProgram.times?.[0] || '09:00',
        participants,
        totalAmount,
        paymentMethod: selectedPaymentMethod,
        status: 'confirmed',
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      };

      await createReservation(reservationData);
      
      // 예약 완료 모달 표시
      setShowReservationCompleteModal(true);

    } catch (error) {
      console.error("Failed to create reservation:", error);
      Alert.alert("Error", "Failed to create reservation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  const isDateInRange = (date: string, selectedDates: string[]) => {
    if (selectedDates.length !== 2) return false;
    const currentDate = new Date(date);
    const startDate = new Date(selectedDates[0]);
    const endDate = new Date(selectedDates[1]);
    return currentDate > startDate && currentDate < endDate;
  };

  // 프로그램별 예약 가능 날짜 확인 함수
  const isReservationAvailable = (date: string) => {
    if (!selectedProgram) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    const daysUntilProgram = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // TEMPLES_DATA에서 프로그램의 reservationNotice 확인
    const basicTemple = TEMPLES_DATA.find((item) => item.id === temple?.id);
    const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
    
    if (programDetail?.reservationNotice) {
      // reservationNotice에서 일수 추출
      const noticeText = programDetail.reservationNotice;
      
      if (noticeText.includes('1 day before')) {
        // 1일 전까지 예약 불가: 오늘(0일), 내일(1일)은 예약 불가
        return daysUntilProgram >= 2;
      } else if (noticeText.includes('2 days before')) {
        // 2일 전까지 예약 불가: 오늘(0일), 내일(1일), 모레(2일)은 예약 불가
        return daysUntilProgram >= 3;
      } else if (noticeText.includes('3 days before')) {
        // 3일 전까지 예약 불가: 오늘(0일), 내일(1일), 모레(2일), 글피(3일)은 예약 불가
        return daysUntilProgram >= 4;
      } else if (noticeText.includes('5 days before')) {
        // 5일 전까지 예약 불가: 오늘~5일 후까지는 예약 불가
        return daysUntilProgram >= 6;
      } else if (noticeText.includes('7 days before')) {
        // 7일 전까지 예약 불가: 오늘~7일 후까지는 예약 불가
        return daysUntilProgram >= 8;
      }
    }
    
    // 기본값: 3일 전까지 예약 가능 (오늘, 내일, 모레는 예약 불가)
    return daysUntilProgram >= 4;
  };

  return (
    <View className="flex-1 bg-stone-100">
      <ScrollView className="flex-1 px-4 py-6">
        {/* 사찰 정보 */}
        <View className="bg-white rounded-xl p-4 mb-2 border border-stone-200">
          <View className="flex-row items-center mb-3">
            <View className="w-16 h-16 rounded-xl overflow-hidden mr-3">
              {(() => {
                console.log('🔍 ReservationConfirm 사찰 이미지 디버깅:', {
                  templeName: temple.name,
                  imageUrl: temple.imageUrl,
                  imageUrlType: typeof temple.imageUrl,
                  hasImageUrl: !!temple.imageUrl
                });
                
                return temple.imageUrl ? (
                  <Image source={temple.imageUrl} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full bg-stone-200 items-center justify-center">
                    <Text style={{ fontSize: iconSize * 2 }}>🏯</Text>
                  </View>
                );
              })()}
            </View>
            <View className="flex-1">
              <Text 
                className="font-bold text-neutral-900 mb-1"
                style={{ fontSize: templeTitleSize }}
              >
                {temple.name.replace(/Temple/g, '').trim()}
              </Text>
              <Text 
                className="text-neutral-600"
                style={{ fontSize: templeDescSize }}
              >
                {temple.address}
              </Text>
            </View>
          </View>
        </View>

        {/* 프로그램 정보 */}
        <View className="bg-white rounded-xl p-4 mb-2 border border-stone-200">
          <Text 
            className="font-bold text-neutral-900 mb-3"
            style={{ fontSize: programTitleSize }}
          >
            Selected Program
          </Text>
          <View className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <Text 
              className="font-semibold text-sage-600 mb-2"
              style={{ fontSize: programTitleSize }}
            >
              {selectedProgram.title}
            </Text>
            <Text 
              className="text-neutral-700"
              style={{ fontSize: programDescSize }}
            >
              {selectedProgram.description}
            </Text>
          </View>
        </View>

        {/* 날짜/인원 선택 */}
        <View className="bg-white rounded-xl p-4 mb-2 border border-stone-200">
          <View className="flex-row items-center">
            {/* 왼쪽: 날짜 정보 */}
            <TouchableOpacity 
              className="flex-1 border-r border-stone-300 pr-4"
              onPress={() => setShowDateModal(true)}
            >
              <Text 
                className="font-semibold text-neutral-900 text-center"
                style={{ fontSize: templeTitleSize }}
              >
                {selectedDate.length === 2 ? `${formatDate(selectedDate[0])} ~ ${formatDate(selectedDate[1])}` : 'No date selected'}
              </Text>
            </TouchableOpacity>
            {/* 오른쪽: 참가자 정보 */}
            <TouchableOpacity 
              className="flex-1 pl-4"
              onPress={() => setShowParticipantsModal(true)}
            >
              <View className="flex-col items-center">
                <Text 
                  className="font-bold text-neutral-900 text-center"
                  style={{ fontSize: templeDescSize }}
                >
                  {(() => {
                    const parts = [];
                    if (participants.adults > 0) parts.push(`Adult ${participants.adults}`);
                    if (participants.teenagers > 0) parts.push(`Teenager ${participants.teenagers}`);
                    if (participants.children > 0) parts.push(`Child ${participants.children}`);
                    if (participants.preschool > 0) parts.push(`Preschool ${participants.preschool}`);
                    
                    if (parts.length === 0) return 'No participants selected';
                    if (parts.length === 1) return parts[0];
                    if (parts.length === 2) return `${parts[0]}, ${parts[1]}`;
                    if (parts.length === 3) return `${parts[0]}, ${parts[1]}`;
                    if (parts.length === 4) return `${parts[0]}, ${parts[1]}`;
                  })()}
                </Text>
                {(() => {
                  const parts = [];
                  if (participants.adults > 0) parts.push(`Adult ${participants.adults}`);
                  if (participants.teenagers > 0) parts.push(`Teenager ${participants.teenagers}`);
                  if (participants.children > 0) parts.push(`Child ${participants.children}`);
                  if (participants.preschool > 0) parts.push(`Preschool ${participants.preschool}`);
                  
                  if (parts.length >= 3) {
                    return (
                      <Text 
                        className="font-bold text-neutral-900 text-center"
                        style={{ fontSize: templeDescSize }}
                      >
                        {parts[2]}
                        {parts.length === 4 && `, ${parts[3]}`}
                      </Text>
                    );
                  }
                  return null;
                })()}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 예약 상세 */}
        <View className="bg-white rounded-xl p-4 mb-2 border border-stone-200">
          <Text 
            className="font-bold text-neutral-900 mb-3"
            style={{ fontSize: programTitleSize }}
          >
            Reservation Details
          </Text>
          
          {/* 날짜 */}
          <View className="flex-row justify-between items-center py-2 border-b border-stone-100">
            <Text 
              className="font-bold text-neutral-600"
              style={{ fontSize: templeDistanceSize }}
            >
              Date
            </Text>
                              <Text 
                                className="font-semibold text-neutral-900"
                                style={{ fontSize: templeDistanceSize }}
                              >
                    {selectedDate.length === 2 ? `${formatDate(selectedDate[0])} ~ ${formatDate(selectedDate[1])}` : 'No date selected'}
                  </Text>
          </View>

          {/* 참가자 */}
          <View className="flex-row justify-between items-center py-2 border-b border-stone-100">
            <Text 
              className="font-bold text-neutral-600"
              style={{ fontSize: templeDistanceSize }}
            >
              Participants
            </Text>
            <View className="flex-col items-end">
              <Text 
                className="font-bold text-neutral-900"
                style={{ fontSize: templeDistanceSize }}
              >
                {(() => {
                  const parts = [];
                  if (participants.adults > 0) parts.push(`Adult ${participants.adults}`);
                  if (participants.teenagers > 0) parts.push(`Teenager ${participants.teenagers}`);
                  if (participants.children > 0) parts.push(`Child ${participants.children}`);
                  if (participants.preschool > 0) parts.push(`Preschool ${participants.preschool}`);
                  
                  if (parts.length === 0) return 'No participants selected';
                  if (parts.length === 1) return parts[0];
                  if (parts.length === 2) return `${parts[0]}, ${parts[1]}`;
                  if (parts.length === 3) return `${parts[0]}, ${parts[1]}`;
                  if (parts.length === 4) return `${parts[0]}, ${parts[1]}`;
                })()}
              </Text>
              {(() => {
                const parts = [];
                if (participants.adults > 0) parts.push(`Adult ${participants.adults}`);
                if (participants.teenagers > 0) parts.push(`Teenager ${participants.teenagers}`);
                if (participants.children > 0) parts.push(`Child ${participants.children}`);
                if (participants.preschool > 0) parts.push(`Preschool ${participants.preschool}`);
                
                if (parts.length >= 3) {
                  return (
                    <Text 
                      className="font-bold text-neutral-900"
                      style={{ fontSize: templeDistanceSize }}
                    >
                      {parts[2]}
                      {parts.length === 4 && `, ${parts[3]}`}
                    </Text>
                  );
                }
                return null;
              })()}
            </View>
          </View>

          {/* 총 금액 */}
          <View className="flex-row justify-between items-center py-2">
            <Text 
              className="font-bold text-neutral-900"
              style={{ fontSize: programTitleSize }}
            >
              Total Amount
            </Text>
            <Text 
              className="font-bold text-orange-600"
              style={{ fontSize: totalPriceFontSize }}
            >
              ₩{(() => {
                // TEMPLES_DATA에서 정확한 가격 가져오기
                const basicTemple = TEMPLES_DATA.find((item) => item.id === temple?.id);
                const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                
                if (programDetail?.pricing) {
                  // 정확한 가격 사용
                  const total = (participants.adults * (programDetail.pricing.adult || 0)) + 
                              (participants.teenagers * (programDetail.pricing.teenager || 0)) + 
                              (participants.children * (programDetail.pricing.child || 0)) + 
                              (participants.preschool * (programDetail.pricing.preschool || 0));
                  return total.toLocaleString();
                } else {
                  // fallback: 기본 가격 사용
                  const adultPrice = selectedProgram.price || 0;
                  const total = (participants.adults * adultPrice) + 
                              (participants.teenagers * Math.floor(adultPrice * 0.9)) + 
                              (participants.children * Math.floor(adultPrice * 0.8)) + 
                              (participants.preschool * Math.floor(adultPrice * 0.7));
                  return total.toLocaleString();
                }
              })()}
            </Text>
          </View>
        </View>

        {/* 결제 방법 선택 */}
        <View className="bg-white rounded-xl p-4 mb-6 border border-stone-200">
          <Text 
            className="font-bold text-neutral-900 mb-3"
            style={{ fontSize: programTitleSize }}
          >
            Payment Method
          </Text>
          
          <TouchableOpacity 
            onPress={() => handlePaymentMethodSelect('bank')}
            className={`p-4 border rounded-lg mb-3 ${
              selectedPaymentMethod === 'bank' 
                ? 'border-sage-600 bg-sage-50' 
                : 'border-stone-200 bg-white'
            }`}
          >
            <View className="flex-row items-center">
              <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                selectedPaymentMethod === 'bank' 
                  ? 'border-sage-600 bg-sage-600' 
                  : 'border-stone-300'
              }`}>
                {selectedPaymentMethod === 'bank' && (
                  <View className="w-2.5 h-2.5 rounded-full bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </View>
              <View>
                <Text className={`font-semibold ${
                  selectedPaymentMethod === 'bank' ? 'text-sage-600' : 'text-neutral-700'
                }`}>Bank Transfer</Text>
                <Text 
                  className="text-neutral-500"
                  style={{ fontSize: templeDistanceSize - 2 }}
                >
                  Transfer to our account within 7 days
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handlePaymentMethodSelect('onsite')}
            className={`p-4 border rounded-lg ${
              selectedPaymentMethod === 'onsite' 
                ? 'border-sage-600 bg-sage-50' 
                : 'border-stone-200 bg-white'
            }`}
          >
            <View className="flex-row items-center">
              <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                selectedPaymentMethod === 'onsite' 
                  ? 'border-sage-600 bg-sage-600' 
                  : 'border-stone-300'
              }`}>
                {selectedPaymentMethod === 'onsite' && (
                  <View className="w-2.5 h-2.5 rounded-full bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </View>
              <View>
                <Text className={`font-semibold ${
                  selectedPaymentMethod === 'onsite' ? 'text-sage-600' : 'text-neutral-700'
                }`}>Onsite Payment</Text>
                <Text 
                  className="text-neutral-500"
                  style={{ fontSize: templeDistanceSize - 2 }}
                >
                  Pay when you arrive at the temple
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Confirm Reservation 버튼 */}
        <View className="bg-white rounded-xl p-4 mb-2 border border-stone-200 -mt-4">
          <TouchableOpacity 
            onPress={handleConfirmReservation}
            disabled={!selectedPaymentMethod || isLoading || selectedDate.length !== 2 || (participants.adults + participants.teenagers + participants.children + participants.preschool) === 0}
            className={`w-full py-4 rounded-lg ${
              selectedPaymentMethod && !isLoading && selectedDate.length === 2 && (participants.adults + participants.teenagers + participants.children + participants.preschool) > 0
                ? 'bg-sage-600' 
                : 'bg-gray-400'
            }`}
          >
            <Text 
              className="text-center font-semibold text-white"
              style={{ fontSize: buttonFontSize }}
            >
              {isLoading ? 'Processing...' : 'Confirm Reservation'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 날짜 선택 모달 */}
        <Modal
          visible={showDateModal}
          animationType="fade"
          transparent={true}
        >
         <View className="flex-1 justify-end items-center" style={{ transform: [{ translateY: 50 }] }}>
           <View className="bg-white rounded-3xl w-full h-[700px] mx-4 border border-stone-300">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-4 border-b border-stone-200">
             <TouchableOpacity onPress={() => setShowDateModal(false)}>
               <Ionicons name="close" size={24} color="#6b7280" />
             </TouchableOpacity>
                           <Text 
                             className="font-bold text-neutral-900"
                             style={{ fontSize: programTitleSize }}
                           >
                             Date Selection
                           </Text>
             <View className="w-6" />
           </View>

           

                                               {/* 월 선택 헤더 */}
             <View className="mx-4 mt-2">
              <View className="flex-row items-center justify-between mb-3">
                <TouchableOpacity 
                  onPress={() => changeMonth('prev')}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="chevron-back" size={20} color="#6b7280" />
                </TouchableOpacity>
                <Text 
                  className="font-bold text-neutral-900"
                  style={{ fontSize: headerFontSize }}
                >
                  {formatMonthYear(currentMonth)}
                </Text>
                <TouchableOpacity 
                  onPress={() => changeMonth('next')}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <View className="flex-row">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <View key={day} className="flex-1 items-center justify-center py-2">
                    <Text 
                      className={`font-medium text-center ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-stone-600'}`}
                      style={{ fontSize: templeTitleSize }}
                    >
                      {day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

           

                                                                                               {/* 캘린더 그리드 */}
              <View className="mx-4 relative">

                {(() => {
                  const { daysInMonth, firstDayOfWeek } = getDaysInMonth(currentMonth);
                  const weeks = [];
                  
                  // 첫 번째 주 (빈 칸 + 1일부터)
                  let firstWeek = [];
                  for (let i = 0; i < firstDayOfWeek; i++) {
                    firstWeek.push(<View key={`empty-${i}`} className="flex-1 h-16 items-center justify-center" />);
                  }
                  
                  for (let day = 1; day <= Math.min(7 - firstDayOfWeek, daysInMonth); day++) {
                    const date = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const isSelected = tempSelectedDate.includes(date);
                    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selectedDate = new Date(date);
                    const isPastOrToday = selectedDate <= today;
                    const isReservationUnavailable = !isReservationAvailable(date);
                    
                    firstWeek.push(
                      <TouchableOpacity
                        key={day}
                        className={`flex-1 h-16 items-center pt-4`}
                        onPress={() => !isPastOrToday && isReservationAvailable(date) && handleDateSelect(date)}
                        disabled={isPastOrToday || isReservationUnavailable}
                      >
                        <Text 
                          className={`text-center ${
                            isSelected ? 'font-extrabold' : 'font-medium'
                          } ${
                            isPastOrToday ? 'text-red-500' : 
                            isReservationUnavailable ? 'text-red-500' : 'text-stone-700'
                          }`}
                          style={{ fontSize: templeTitleSize }}
                        >
                          {day}
                        </Text>
                        {/* 선택된 날짜 배경 도형 */}
                        {isSelected && (
                          <View 
                            className="absolute inset-0 bg-sage-800 rounded-full opacity-20 border border-sage-900"
                            style={{
                              width: tempSelectedDate.length > 1 ? 55 : 40,
                              height: 40,
                              left: tempSelectedDate.length > 1 ? 10 : 0,
                              top: -5,
                              zIndex: -1
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }
                  weeks.push(<View key="week-0" className="flex-row mb-2">{firstWeek}</View>);
                  
                  // 나머지 주들
                  let currentDay = 7 - firstDayOfWeek + 1;
                  while (currentDay <= daysInMonth) {
                    const week = [];
                    for (let i = 0; i < 7; i++) {
                                             if (currentDay <= daysInMonth) {
                         const date = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
                         const isSelected = tempSelectedDate.includes(date);
                         const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
                         const today = new Date();
                         today.setHours(0, 0, 0, 0);
                         const selectedDate = new Date(date);
                         const isPastOrToday = selectedDate <= today;
                         const isReservationUnavailable = !isReservationAvailable(date);
                         
                         week.push(
                           <TouchableOpacity
                             key={currentDay}
                             className={`flex-1 h-12 items-center`}
                             onPress={() => !isPastOrToday && isReservationAvailable(date) && handleDateSelect(date)}
                             disabled={isPastOrToday || isReservationUnavailable}
                           >
                             <Text 
                               className={`text-center ${
                                 isSelected ? 'font-extrabold' : 'font-medium'
                               } ${
                                 isPastOrToday ? 'text-red-500' : 
                                 isReservationUnavailable ? 'text-red-500' : 'text-stone-700'
                               }`}
                               style={{ fontSize: templeTitleSize }}
                             >
                               {currentDay}
                             </Text>
                            {/* 선택된 날짜 배경 도형 */}
                            {isSelected && (
                              <View 
                                className="absolute inset-0 bg-sage-800 rounded-full opacity-20 border border-sage-900"
                                                            style={{
                              width: tempSelectedDate.length > 1 ? 36 : 32,
                              height: 32,
                              left: tempSelectedDate.length > 1 ? 8 : 0,
                              top: -5,
                              zIndex: -1
                            }}
                              />
                            )}
                          </TouchableOpacity>
                        );
                        currentDay++;
                      } else {
                        week.push(<View key={`empty-${currentDay}-${i}`} className="flex-1 h-16 items-center justify-center" />);
                      }
                    }
                    weeks.push(<View key={`week-${weeks.length}`} className="flex-row mb-2">{week}</View>);
                  }
                  
                  return weeks;
                })()}
              </View>

                                                                                                                                               {/* 하단 버튼 */}
               <View className="p-4 border-t border-stone-200 mt-36">
               <TouchableOpacity
                 onPress={handleDateModalConfirm}
                 className={`w-full py-5 rounded-2xl ${
                   tempSelectedDate.length === 2 ? 'bg-sage-600' : 'bg-gray-400'
                 }`}
               >
                                  <Text 
                                    className="text-white text-center font-semibold"
                                    style={{ fontSize: buttonFontSize }}
                                  >
                    {tempSelectedDate.length > 0 
                      ? `${formatDate(tempSelectedDate[0])} ~ ${formatDate(tempSelectedDate[1])}`
                      : 'Please select a date'
                    }
                  </Text>
               </TouchableOpacity>
             </View>
            </View>
          </View>
        </Modal>

       {/* 인원수 선택 모달 */}
       <Modal
         visible={showParticipantsModal}
         animationType="fade"
         transparent={true}
       >
         <View className="flex-1 justify-end items-center" style={{ transform: [{ translateY: 50 }] }}>
           <View className="bg-white rounded-3xl w-full h-[700px] mx-4 border border-stone-300">
             {/* 헤더 */}
             <View className="flex-row items-center justify-between border-b border-stone-200" style={{ padding: cardPadding }}>
               <TouchableOpacity onPress={() => setShowParticipantsModal(false)}>
                 <Ionicons name="close" size={24} color="#6b7280" />
               </TouchableOpacity>
               <Text 
                 className="font-bold text-neutral-900"
                 style={{ fontSize: programTitleSize }}
               >
                 Participant Selection
               </Text>
               <View className="w-6" />
             </View>

             {/* 인원수 선택 */}
             <View style={{ marginHorizontal: cardPadding, marginTop: cardPadding }}>
               {/* Adult 선택 */}
               <View className="bg-stone-50 border border-stone-200 rounded-lg mb-4" style={{ padding: cardPadding }}>
                 <View className="flex-row items-center justify-between">
                   <Text 
                     className="text-neutral-900"
                     style={{ fontSize: templeTitleSize }}
                   >
                     Adult
                   </Text>
                   <View className="flex-row items-center">
                     <TouchableOpacity
                       onPress={() => handleParticipantsChange('adults', tempParticipants.adults - 1)}
                       className="w-8 h-8 border border-stone-300 rounded-full items-center justify-center"
                     >
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeTitleSize }}
                       >
                         -
                       </Text>
                     </TouchableOpacity>
                     <Text 
                       className="font-semibold text-neutral-900 mx-4"
                       style={{ fontSize: templeTitleSize }}
                     >
                       {tempParticipants.adults}
                     </Text>
                     <TouchableOpacity
                       onPress={() => handleParticipantsChange('adults', tempParticipants.adults + 1)}
                       className="w-8 h-8 border border-stone-300 rounded-full items-center justify-center"
                     >
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeTitleSize }}
                       >
                         +
                       </Text>
                     </TouchableOpacity>
                   </View>
                 </View>
                 <Text 
                   className="text-neutral-500 mt-2"
                   style={{ fontSize: templeDistanceSize }}
                 >
                   ₩{(selectedProgram.price || 0).toLocaleString()}
                 </Text>
               </View>

               {/* Teenager 선택 */}
               <View className="bg-stone-50 border border-stone-200 rounded-lg mb-4" style={{ padding: cardPadding }}>
                 <View className="flex-row items-center justify-between">
                   <Text 
                     className="text-neutral-900"
                     style={{ fontSize: templeTitleSize }}
                   >
                     Teenager
                   </Text>
                   <View className="flex-row items-center">
                     <TouchableOpacity
                       onPress={() => handleParticipantsChange('teenagers', tempParticipants.teenagers - 1)}
                       className="w-8 h-8 border border-stone-300 rounded-full items-center justify-center"
                     >
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeTitleSize }}
                       >
                         -
                       </Text>
                     </TouchableOpacity>
                     <Text 
                       className="font-semibold text-neutral-900 mx-4"
                       style={{ fontSize: templeTitleSize }}
                     >
                       {tempParticipants.teenagers}
                     </Text>
                     <TouchableOpacity
                       onPress={() => handleParticipantsChange('teenagers', tempParticipants.teenagers + 1)}
                       className="w-8 h-8 border border-stone-300 rounded-full items-center justify-center"
                     >
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeTitleSize }}
                       >
                         +
                       </Text>
                     </TouchableOpacity>
                   </View>
                 </View>
                 <Text 
                   className="text-neutral-500 mt-2"
                   style={{ fontSize: templeDistanceSize }}
                 >
                   ₩{(() => {
                     const basicTemple = TEMPLES_DATA.find((item) => item.id === temple?.id);
                     const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                     if (programDetail?.pricing?.teenager) {
                       return programDetail.pricing.teenager.toLocaleString();
                     }
                     return Math.floor((selectedProgram.price || 0) * 0.9).toLocaleString();
                   })()}
                 </Text>
               </View>

               {/* Child 선택 */}
               <View className="bg-stone-50 border border-stone-200 rounded-lg mb-4" style={{ padding: cardPadding }}>
                 <View className="flex-row items-center justify-between">
                   <Text 
                     className="text-neutral-900"
                     style={{ fontSize: templeTitleSize }}
                   >
                     Child
                   </Text>
                   <View className="flex-row items-center">
                     <TouchableOpacity
                       onPress={() => handleParticipantsChange('children', tempParticipants.children - 1)}
                       className="w-8 h-8 border border-stone-300 rounded-full items-center justify-center"
                     >
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeTitleSize }}
                       >
                         -
                       </Text>
                     </TouchableOpacity>
                     <Text 
                       className="font-semibold text-neutral-900 mx-4"
                       style={{ fontSize: templeTitleSize }}
                     >
                       {tempParticipants.children}
                     </Text>
                     <TouchableOpacity
                       onPress={() => handleParticipantsChange('children', tempParticipants.children + 1)}
                       className="w-8 h-8 border border-stone-300 rounded-full items-center justify-center"
                     >
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeTitleSize }}
                       >
                         +
                       </Text>
                     </TouchableOpacity>
                   </View>
                 </View>
                 <Text 
                   className="text-neutral-500 mt-2"
                   style={{ fontSize: templeDistanceSize }}
                 >
                   ₩{(() => {
                     const basicTemple = TEMPLES_DATA.find((item) => item.id === temple?.id);
                     const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                     if (programDetail?.pricing?.child) {
                       return programDetail.pricing.child.toLocaleString();
                     }
                     return Math.floor((selectedProgram.price || 0) * 0.8).toLocaleString();
                   })()}
                 </Text>
               </View>

               {/* Preschool 선택 */}
               <View className="bg-stone-50 border border-stone-200 rounded-lg mb-4" style={{ padding: cardPadding }}>
                 <View className="flex-row items-center justify-between">
                   <Text 
                     className="text-neutral-900"
                     style={{ fontSize: templeTitleSize }}
                   >
                     Preschool
                   </Text>
                   <View className="flex-row items-center">
                     <TouchableOpacity
                       onPress={() => handleParticipantsChange('preschool', tempParticipants.preschool - 1)}
                       className="w-8 h-8 border border-stone-300 rounded-full items-center justify-center"
                     >
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeTitleSize }}
                       >
                         -
                       </Text>
                     </TouchableOpacity>
                     <Text 
                       className="font-semibold text-neutral-900 mx-4"
                       style={{ fontSize: templeTitleSize }}
                     >
                       {tempParticipants.preschool}
                     </Text>
                     <TouchableOpacity
                       onPress={() => handleParticipantsChange('preschool', tempParticipants.preschool + 1)}
                       className="w-8 h-8 border border-stone-300 rounded-full items-center justify-center"
                     >
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeTitleSize }}
                       >
                         +
                       </Text>
                     </TouchableOpacity>
                   </View>
                 </View>
                 <Text 
                   className="text-neutral-500 mt-2"
                   style={{ fontSize: templeDistanceSize }}
                 >
                   ₩{(() => {
                     const basicTemple = TEMPLES_DATA.find((item) => item.id === temple?.id);
                     const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                     if (programDetail?.pricing?.preschool) {
                       return programDetail.pricing.preschool.toLocaleString();
                     }
                     return Math.floor((selectedProgram.price || 0) * 0.7).toLocaleString();
                   })()}
                 </Text>
               </View>
             </View>

             {/* 토탈 금액 계산 */}
             <View className="bg-stone-50 rounded-lg border border-stone-200" style={{ marginHorizontal: cardPadding, marginTop: cardPadding, padding: cardPadding }}>
               <View className="flex-row justify-between items-center mb-2">
                 <Text 
                   className="font-semibold text-neutral-900"
                   style={{ fontSize: programTitleSize }}
                 >
                   Total Amount
                 </Text>
                 <Text 
                   className="font-bold text-orange-600"
                   style={{ fontSize: totalPriceFontSize }}
                 >
                   ₩{(() => {
                     // TEMPLES_DATA에서 정확한 가격 가져오기
                     const basicTemple = TEMPLES_DATA.find((item) => item.id === temple?.id);
                     const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                     
                     if (programDetail?.pricing) {
                       // 정확한 가격 사용
                       const total = (tempParticipants.adults * (programDetail.pricing.adult || 0)) + 
                                   (tempParticipants.teenagers * (programDetail.pricing.teenager || 0)) + 
                                   (tempParticipants.children * (programDetail.pricing.child || 0)) + 
                                   (tempParticipants.preschool * (programDetail.pricing.preschool || 0));
                       return total.toLocaleString();
                     } else {
                       // fallback: 기본 가격 사용
                       const adultPrice = selectedProgram.price || 0;
                       const total = (tempParticipants.adults * adultPrice) + 
                                   (tempParticipants.teenagers * Math.floor(adultPrice * 0.9)) + 
                                   (tempParticipants.children * Math.floor(adultPrice * 0.8)) + 
                                   (tempParticipants.preschool * Math.floor(adultPrice * 0.7));
                       return total.toLocaleString();
                     }
                   })()}
                 </Text>
               </View>
               {(() => {
                 const basicTemple = TEMPLES_DATA.find((item) => item.id === temple?.id);
                 const programDetail = basicTemple?.programDetails?.[selectedProgram.title];
                 
                 if (programDetail?.pricing) {
                   // 정확한 가격으로 계산식 표시
                   return (
                     <>
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeDistanceSize }}
                       >
                         Adult: ₩{programDetail.pricing.adult.toLocaleString()} × {tempParticipants.adults} = ₩{(programDetail.pricing.adult * tempParticipants.adults).toLocaleString()}
                       </Text>
                       {tempParticipants.teenagers > 0 && (
                         <Text 
                           className="text-neutral-600"
                           style={{ fontSize: templeDistanceSize }}
                         >
                           Teenager: ₩{programDetail.pricing.teenager.toLocaleString()} × {tempParticipants.teenagers} = ₩{(programDetail.pricing.teenager * tempParticipants.teenagers).toLocaleString()}
                         </Text>
                       )}
                       {tempParticipants.children > 0 && (
                         <Text 
                           className="text-neutral-600"
                           style={{ fontSize: templeDistanceSize }}
                         >
                           Child: ₩{programDetail.pricing.child.toLocaleString()} × {tempParticipants.children} = ₩{(programDetail.pricing.child * tempParticipants.children).toLocaleString()}
                         </Text>
                       )}
                       {tempParticipants.preschool > 0 && (
                         <Text 
                           className="text-neutral-600"
                           style={{ fontSize: templeDistanceSize }}
                         >
                           Preschool: ₩{programDetail.pricing.preschool.toLocaleString()} × {tempParticipants.preschool} = ₩{(programDetail.pricing.preschool * tempParticipants.preschool).toLocaleString()}
                         </Text>
                       )}
                     </>
                   );
                 } else {
                   // fallback: 기본 가격으로 계산식 표시
                   return (
                     <>
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeDistanceSize }}
                       >
                         Adult: ₩{(selectedProgram.price || 0).toLocaleString()} × {tempParticipants.adults} = ₩{((selectedProgram.price || 0) * tempParticipants.adults).toLocaleString()}
                       </Text>
                       <Text 
                         className="text-neutral-600"
                         style={{ fontSize: templeDistanceSize }}
                       >
                         Teenager/Child/Preschool: ₩{Math.floor((selectedProgram.price || 0) * 0.7).toLocaleString()} × {tempParticipants.teenagers + tempParticipants.children + tempParticipants.preschool} = ₩{Math.floor((selectedProgram.price || 0) * 0.7 * (tempParticipants.teenagers + tempParticipants.children + tempParticipants.preschool)).toLocaleString()}
                       </Text>
                     </>
                   );
                 }
               })()}
             </View>

             {/* 하단 버튼 */}
             <View className="border-t border-stone-200" style={{ padding: cardPadding, marginTop: cardPadding }}>
               <TouchableOpacity
                 onPress={handleParticipantsModalConfirm}
                 className={`w-full rounded-2xl ${
                   (tempParticipants.adults + tempParticipants.teenagers + tempParticipants.children + tempParticipants.preschool) > 0 ? 'bg-sage-600' : 'bg-gray-400'
                 }`}
                 style={{ paddingVertical: buttonPadding * 2 }}
               >
                 <Text 
                   className="text-white text-center font-semibold"
                   style={{ fontSize: buttonFontSize }}
                 >
                   Confirm Participants
                 </Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>

       {/* 예약 완료 모달 */}
       <Modal
         visible={showReservationCompleteModal}
         transparent={true}
         animationType="fade"
         onRequestClose={() => setShowReservationCompleteModal(false)}
       >
         <View className="flex-1 bg-black/50 justify-center items-center px-6">
           <View className="bg-stone-50 rounded-2xl p-6 w-full max-w-sm border border-stone-200">
             {/* 모달 헤더 */}
             <View className="items-center mb-6">
               <View className="w-16 h-16 bg-sage-200 rounded-full items-center justify-center mb-3">
                 <Ionicons name="checkmark-circle" size={32} color="#4A5D23" />
               </View>
               <Text 
                 className="font-bold text-sage-800"
                 style={{ fontSize: programTitleSize }}
               >
                 Reservation Complete!
               </Text>
               <Text 
                 className="text-stone-700 text-center mt-2"
                 style={{ fontSize: templeDescSize }}
               >
                 Your reservation has been successfully completed
               </Text>
             </View>

             {/* 버튼들 */}
             <View className="space-y-3">
               <TouchableOpacity 
                 className="w-full bg-sage-600 py-4 rounded-xl"
                 onPress={() => {
                   setShowReservationCompleteModal(false);
                   navigation.getParent()?.navigate('Main', { screen: 'Home' });
                 }}
               >
                 <Text className="text-white font-semibold text-center">Go to Home</Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
     </ScrollView>
   </View>
 );
};

export default ReservationConfirmScreen;
