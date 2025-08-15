import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import useUserStore from '../../../store/userStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';

// Styled components for NativeWind

const { width } = Dimensions.get('window');

// 날짜 카드 컴포넌트 분리 및 메모이제이션
const DateCard = memo<{
  day: any;
  isSelected: boolean;
  onPress: (fullDate: string) => void;
}>(({ day, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(day.fullDate);
  }, [day.fullDate, onPress]);

  return (
    <TouchableOpacity
      className={`w-[70px] h-[90px] bg-white rounded-2xl items-center justify-center mr-3 border-2 relative ${
        isSelected 
          ? 'border-sage-600 bg-sage-50 scale-105' 
          : day.isToday 
            ? 'border-coral-500' 
            : 'border-stone-200'
      }`}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {day.isToday && (
        <View className="absolute -top-2 bg-coral-500 rounded-lg px-2 py-0.5">
          <Text className="text-xs font-bold text-white">오늘</Text>
        </View>
      )}
      <Text className={`text-2xl font-bold mb-1 ${
        isSelected 
          ? 'text-sage-600' 
          : day.isWeekend 
            ? 'text-coral-500' 
            : 'text-neutral-900'
      }`}>
        {day.day}
      </Text>
      <Text className={`text-xs font-medium ${
        isSelected 
          ? 'text-sage-600' 
          : day.isWeekend 
            ? 'text-coral-500' 
            : 'text-neutral-600'
      }`}>
        {day.week}
      </Text>
      {isSelected && (
        <View className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-sage-600" />
      )}
    </TouchableOpacity>
  );
});

// 시간 카드 컴포넌트 분리 및 메모이제이션
const TimeCard = memo<{
  timeOption: any;
  period: string;
  isSelected: boolean;
  onPress: (timeKey: string) => void;
}>(({ timeOption, period, isSelected, onPress }) => {
  const timeKey = `${period}-${timeOption.time}`;
  
  const handlePress = useCallback(() => {
    if (timeOption.available) {
      onPress(timeKey);
    }
  }, [timeOption.available, timeKey, onPress]);

  const cardWidth = (width - 56) / 2; // 2개씩 배치, 여백 고려

  return (
    <TouchableOpacity
      className={`bg-white rounded-xl p-4 mb-3 items-center border-2 relative ${
        !timeOption.available 
          ? 'bg-stone-100 border-stone-200 opacity-60' 
          : isSelected 
            ? 'border-sage-600 bg-sage-50 scale-[1.02]' 
            : 'border-stone-200 active:bg-stone-50'
      }`}
      style={{ width: cardWidth }}
      onPress={handlePress}
      disabled={!timeOption.available}
      activeOpacity={0.7}
    >
      <Text className={`text-lg font-bold mb-1 ${
        !timeOption.available 
          ? 'text-neutral-400' 
          : isSelected 
            ? 'text-sage-600' 
            : 'text-neutral-900'
      }`}>
        {timeOption.time}
      </Text>
      <Text className={`text-xs text-center ${
        !timeOption.available 
          ? 'text-neutral-400' 
          : isSelected 
            ? 'text-sage-600 font-semibold' 
            : 'text-neutral-600'
      }`}>
        {timeOption.label}
      </Text>
      
      {!timeOption.available && (
        <View className="absolute top-2 right-2 bg-coral-500 rounded-md px-1.5 py-0.5">
          <Text className="text-xs font-bold text-white">마감</Text>
        </View>
      )}
      
      {isSelected && (
        <View className="absolute top-2 right-2 bg-sage-600 rounded-xl w-5 h-5 justify-center items-center">
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
});

// 2025년 캘린더로 고정

// 시간대별 옵션
const TIME_SLOTS = [
  {
    period: '오전',
    description: '새벽 예불과 함께 하는 고요한 시간',
    times: [
      { time: '06:00', label: '새벽 예불', available: true },
      { time: '08:00', label: '아침 공양', available: true },
      { time: '10:00', label: '명상 시간', available: true },
      { time: '11:00', label: '법문 청취', available: false }, // 예약 마감
    ]
  },
  {
    period: '오후',

    description: '사찰 체험과 자연 산책',
    times: [
      { time: '14:00', label: '사찰 체험', available: true },
      { time: '15:00', label: '차 명상', available: true },
      { time: '16:00', label: '자연 산책', available: true },
      { time: '17:00', label: '저녁 예불', available: true },
    ]
  }
];

type ReservationDateScreenProps = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any>;
};

const ReservationDateScreen = ({ navigation }: ReservationDateScreenProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>('2025-01-01');
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const handleNext = useCallback(() => {
    if (selectedDate && selectedTime) {
      navigation.navigate('ReservationConfirm', {
        reservationDetails: {
          date: selectedDate,
          time: selectedTime,
        }
      });
    }
  }, [selectedDate, selectedTime, navigation]);

  // 비로그인 접근 가드
  useEffect(() => {
    if (!isLoggedIn) {
      // 상위 네비게이터(루트)로 로그인 화면 이동
      (navigation as any).getParent()?.navigate('SnsLogin');
    }
  }, [isLoggedIn, navigation]);

  const handleDateSelect = useCallback((fullDate: string) => {
    setSelectedDate(fullDate);
  }, []);

  const handleTimeSelect = useCallback((timeKey: string) => {
    setSelectedTime(timeKey);
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const isDateTimeSelected = selectedDate && selectedTime;
  
  const selectedDay = useMemo(() => {
    if (!selectedDate) return undefined;
    const date = new Date(selectedDate);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return {
      month: monthNames[date.getMonth()],
      day: date.getDate().toString(),
      week: dayNames[date.getDay()],
    } as any;
  }, [selectedDate]);

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header - ZEN-TECH Style */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-neutral-900">예약하기</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title Section - ZEN-TECH Style */}
        <View className="pt-8 pb-8">
          <Text className="text-3xl font-light text-sage-600 leading-10 mb-4">
            Please select the temple stay{"\n"}date and time
          </Text>
          <Text className="text-base text-neutral-600 leading-6">
            마음의 평화를 위한{"\n"}특별한 시간을 예약하세요
          </Text>
        </View>

        {/* Date Selection - Calendar (2025 fixed) */}
        <View className="mb-8 bg-white rounded-2xl p-3 border border-stone-200">
          <Text className="text-xl font-bold text-sage-600 mb-2 px-1">날짜 선택</Text>
          <Calendar
            current={selectedDate || '2025-01-01'}
            minDate={'2025-01-01'}
            maxDate={'2025-12-31'}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#4A5D23' } } : {})
            }}
            enableSwipeMonths
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#4A5568',
              selectedDayBackgroundColor: '#4A5D23',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#FF6B6B',
              dayTextColor: '#1A1B1F',
              textDisabledColor: '#CBD5E0',
              arrowColor: '#4A5D23',
              monthTextColor: '#4A5D23',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600'
            }}
          />
        </View>

        {/* Time Selection - ZEN-TECH Style */}
        {selectedDate && (
          <View className="mb-8">
            <Text className="text-xl font-bold text-sage-600 mb-4">시간 선택</Text>
            
            {TIME_SLOTS.map((slot) => (
              <View key={slot.period} className="mb-6">
                <View className="mb-4">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-2xl bg-sage-100 justify-center items-center mr-3">
                      <Ionicons name="time-outline" size={20} color="#4A5D23" />
                    </View>
                    <View>
                      <Text className="text-lg font-bold text-sage-600 mb-1">{slot.period}</Text>
                      <Text className="text-sm text-neutral-600">{slot.description}</Text>
                    </View>
                  </View>
                </View>
                
                <View className="flex-row flex-wrap justify-between">
                  {slot.times.map((timeOption) => (
                    <TimeCard
                      key={`${slot.period}-${timeOption.time}`}
                      timeOption={timeOption}
                      period={slot.period}
                      isSelected={selectedTime === `${slot.period}-${timeOption.time}`}
                      onPress={handleTimeSelect}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Selection Summary - ZEN-TECH Style */}
        {isDateTimeSelected && (
          <View className="mb-8">
            <View className="bg-sage-50 rounded-2xl p-5 border border-sage-200">
              <Text className="text-base font-bold text-sage-600 mb-3">선택 내용</Text>
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={16} color="#4A5D23" />
                <Text className="text-sm text-sage-600 ml-2 font-medium">
                  {selectedDay?.month} {selectedDay?.day}일 ({selectedDay?.week})
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#4A5D23" />
                <Text className="text-sm text-sage-600 ml-2 font-medium">
                  {selectedTime?.replace('-', ' ')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button - ZEN-TECH Style */}
      <View className="p-5 border-t border-stone-200 bg-white">
        <TouchableOpacity 
          className={`flex-row items-center justify-center rounded-2xl py-4 px-6 ${
            !isDateTimeSelected 
              ? 'bg-neutral-300' 
              : 'bg-sage-600 active:bg-sage-700'
          }`}
          disabled={!isDateTimeSelected} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text className={`text-lg font-semibold ${
            !isDateTimeSelected ? 'text-neutral-500' : 'text-white'
          }`}>
            다음 단계로 이동
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={!isDateTimeSelected ? '#9AA0A6' : '#FFFFFF'} 
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// StyleSheet removed - now using NativeWind classes

export default ReservationDateScreen; 