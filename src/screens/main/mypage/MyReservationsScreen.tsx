import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../../components/common/Button';
import { COLORS } from '../../../constants/colors';
import { Reservation } from '../../../types';
import { ReservationService } from '../../../services/reservationService';
import useUserStore from '../../../store/userStore';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

// Styled components for NativeWind

// 예약 카드 컴포넌트 분리
const ReservationCard = memo<{
  reservation: Reservation;
  onCancel: (id: string) => void;
}>(({ reservation, onCancel }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'confirmed':
        return { text: 'Confirmed', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { text: 'Unknown', color: 'text-neutral-600', bg: 'bg-neutral-50', border: 'border-neutral-200' };
    }
  };

  const statusInfo = getStatusInfo(reservation.status);

  return (
    <View className="bg-white rounded-2xl p-5 mb-4 border border-stone-200">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-xl font-bold text-sage-600 mb-1">
            🏯 {reservation.templeName || reservation.temples?.name || 'Temple Name'}
          </Text>
          <View className={`self-start px-3 py-1 rounded-xl ${statusInfo.bg} ${statusInfo.border} border`}>
            <Text className={`text-xs font-semibold ${statusInfo.color}`}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Reservation Details */}
      <View className="space-y-3 mb-5">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={18} color="#4A5D23" />
          <Text className="text-base text-neutral-700 ml-3 font-medium">
            {reservation.reservationDate || reservation.reservation_date || 'Date not set'}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={18} color="#4A5D23" />
          <Text className="text-base text-neutral-700 ml-3 font-medium">
            {reservation.reservationTime || reservation.reservation_time || 'Time not set'}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="person-outline" size={18} color="#4A5D23" />
          <Text className="text-base text-neutral-700 ml-3 font-medium">
            {reservation.userName || reservation.user_name || 'Guest'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {reservation.status !== 'cancelled' && (
        <View className="flex-row space-x-3">
          <TouchableOpacity 
            className="flex-1 py-3 rounded-xl bg-stone-100 border border-stone-200 active:bg-stone-200"
          >
            <Text className="text-center font-semibold text-neutral-700">
              View Details
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 py-3 rounded-xl bg-red-50 border border-red-200 active:bg-red-100"
            onPress={() => onCancel(reservation.id)}
          >
            <Text className="text-center font-semibold text-red-600">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const MyReservationsScreen = ({ navigation }: any) => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUserStore();

    useEffect(() => {
        if (user) {
            loadReservations();
        }
    }, [user]);

    const loadReservations = useCallback(async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            const userReservations = await ReservationService.getUserReservations(user.id);
            setReservations(userReservations);
        } catch (error) {
            console.error('Error loading reservations:', error);
            Alert.alert('Error', 'An error occurred while loading reservations.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleCancel = useCallback(async (id: string) => {
        Alert.alert(
            "Cancel Reservation",
            "Are you sure you want to cancel this reservation?",
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Yes", 
                    onPress: async () => {
                        try {
                            await ReservationService.cancelReservation(id);
                            Alert.alert('Success', 'Reservation has been cancelled.');
                            loadReservations();
                        } catch (error) {
                            Alert.alert('Error', 'An error occurred while cancelling reservation.');
                        }
                    },
                    style: "destructive" 
                },
            ]
        );
    }, [loadReservations]);

    const renderItem = useCallback(({ item }: { item: Reservation }) => (
        <ReservationCard reservation={item} onCancel={handleCancel} />
    ), [handleCancel]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-stone-100">
                <View className="flex-1 justify-center items-center">
                    <LoadingSpinner />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-stone-100">
            {/* Header (Unified: English + Chevron) */}
            <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
                    <Ionicons name="chevron-back" size={22} color="#1A1B1F" />
                    <Text className="text-base font-semibold text-neutral-900 ml-1">My Reservations</Text>
                </TouchableOpacity>
                <View className="w-6" />
            </View>

            {reservations.length > 0 ? (
                <FlatList
                    data={reservations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ 
                        padding: 20,
                        paddingBottom: 100 
                    }}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 items-center border border-stone-200">
                        <Ionicons name="calendar-outline" size={64} color="#9AA0A6" />
                        <Text className="text-xl font-semibold text-neutral-600 mt-6 mb-2 text-center">
                            No Reservations Found
                        </Text>
                        <Text className="text-base text-neutral-500 text-center mb-6">
                            Start your first templestay{'\n'}reservation today!
                        </Text>
                        <CustomButton 
                            title="Make Reservation" 
                            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                            className="bg-sage-600 rounded-2xl py-3 px-6"
                        />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default MyReservationsScreen;