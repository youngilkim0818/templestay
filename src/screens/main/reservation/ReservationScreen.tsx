import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Switch } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { TempleStackParamList } from '../../../navigation/TempleStackNavigator';
import { TempleService } from '../../../services/templeService';
import { ReservationService } from '../../../services/reservationService';
import { Temple } from '../../../types';
import CustomInput from '../../../components/common/Input';
import CustomButton from '../../../components/common/Button';
import { COLORS } from '../../../constants/colors';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import useUserStore from '../../../store/userStore';

// Styled components for NativeWind


type ReservationScreenRouteProp = RouteProp<TempleStackParamList, 'Reservation'>;

interface Props {
  route: ReservationScreenRouteProp;
  navigation: any;
}

const ReservationScreen = ({ route, navigation }: Props) => {
  const { t } = useTranslation();
  const { templeId } = route.params;
  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [hasAllergies, setHasAllergies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTempleData();
  }, [templeId]);

  useEffect(() => {
    if (selectedDate && temple) {
      loadAvailableTimes();
    }
  }, [selectedDate, temple]);

  // Auth guard: require login before proceeding with reservation flow
  useEffect(() => {
    if (!isLoggedIn) {
      // 즉시 로그인 화면으로 이동(Top-level navigator)
      navigation.getParent()?.navigate('SnsLogin');
    }
  }, [isLoggedIn, navigation]);

  const loadTempleData = async () => {
    try {
      setLoading(true);
      const templeData = await TempleService.getTempleById(templeId);
      setTemple(templeData);
    } catch (error) {
      console.error('Failed to load temple:', error);
      Alert.alert(t('common.error'), t('temples.detailsTitle'));
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTimes = async () => {
    try {
      const times = await ReservationService.getAvailableTimeSlots(templeId, selectedDate);
      setAvailableTimes(times);
    } catch (error) {
      console.error('Failed to load available times:', error);
      setAvailableTimes(temple?.available_times || []);
    }
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedTime || !name || !phone || !email) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (!user) {
      Alert.alert(t('auth.login'), t('reservation.guestInfo'));
      return;
    }

    setSubmitting(true);
    try {
      const reservationDetails = {
        userId: user.id,
        templeId: temple!.id,
        templeName: temple!.name,
        reservationDate: selectedDate,
        reservationTime: selectedTime,
        userName: name,
        userPhone: phone,
        userEmail: email,
        hasAllergies,
      };

      const reservation = await ReservationService.createReservation(reservationDetails);
      
      Alert.alert(t('reservation.reservationComplete'), t('reservation.reservationSuccess'), [
        {
          text: t('common.confirm'),
          onPress: () => navigation.navigate('Main', { screen: 'MyPage' })
        }
      ]);
    } catch (error: any) {
      Alert.alert(t('reservation.reservationFailed'), error.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-stone-100 justify-center items-center p-4">
        <LoadingSpinner />
      </View>
    );
  }

  if (!temple) {
    return (
      <View className="flex-1 bg-stone-100 justify-center items-center p-4">
        <Text className="text-lg text-neutral-600">{t('temples.detailsTitle')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-stone-100">
      <View className="p-6">
        {/* Header - ZEN-TECH Style */}
        <Text className="text-3xl font-light text-neutral-900 text-center mb-8 mt-4">
          {temple.name} {t('reservation.booking')}
        </Text>
        
        {/* Step 1: Date Selection */}
        <Text className="text-xl font-semibold text-sage-600 mb-4">
          1. {t('reservation.selectDate')}
        </Text>
        <View className="bg-white rounded-2xl p-4 mb-6">
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setSelectedTime(''); // 날짜 변경 시 시간 초기화
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#4A5D23' }, // sage-600
            }}
            current={selectedDate || '2025-01-01'}
            minDate={'2025-01-01'}
            maxDate={'2025-12-31'}
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

        {/* Step 2: Time Selection */}
        <Text className="text-xl font-semibold text-sage-600 mb-4">
          2. {t('reservation.selectTime')}
        </Text>
        <View className="flex-row flex-wrap justify-center mb-6">
          {availableTimes.map((time) => (
            <TouchableOpacity
              key={time}
              className={`px-5 py-3 m-2 rounded-xl border-2 min-w-20 ${
                selectedTime === time 
                  ? 'bg-sage-600 border-sage-600' 
                  : 'bg-white border-stone-200 active:bg-stone-50'
              }`}
              onPress={() => setSelectedTime(time)}
            >
              <Text className={`text-center font-semibold ${
                selectedTime === time ? 'text-white' : 'text-sage-600'
              }`}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Step 3: Guest Information */}
        <Text className="text-xl font-semibold text-sage-600 mb-4">
          3. {t('reservation.guestInfo')}
        </Text>
        <View className="mb-6">
          <CustomInput 
            placeholder={t('onboarding.profile.name')} 
            value={name} 
            onChangeText={setName} 
          />
          <CustomInput 
            placeholder={t('reservation.phoneNumber')} 
            value={phone} 
            onChangeText={setPhone} 
            keyboardType="phone-pad" 
          />
          <CustomInput 
            placeholder={t('reservation.email')} 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
          />
        </View>

        {/* Special Requests */}
        <View className="bg-white rounded-2xl p-4 mb-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-medium text-neutral-700">
              {t('reservation.specialRequests')}
            </Text>
            <Switch 
              value={hasAllergies} 
              onValueChange={setHasAllergies}
              trackColor={{ false: '#E8EAED', true: '#4A5D23' }}
              thumbColor={hasAllergies ? '#ffffff' : '#ffffff'}
            />
          </View>
        </View>

        {/* Confirm Button */}
        <CustomButton 
          title={submitting ? t('common.loading') : t('reservation.confirmReservation')} 
          onPress={handleReservation} 
          disabled={submitting}
          className="mb-8"
        />
      </View>
    </ScrollView>
  );
};

// StyleSheet removed - now using NativeWind classes

export default ReservationScreen; 