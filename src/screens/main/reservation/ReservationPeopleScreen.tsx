import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TempleStackParamList } from '../../../navigation/TempleStackNavigator';
import { COLORS } from '../../../constants/colors';
import useUserStore from '../../../store/userStore';

// Styled components for NativeWind

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<TempleStackParamList, 'ReservationPeople'>;
};

const PEOPLE_OPTIONS = [
  { 
    label: 'Solo Travel', 
    value: 1, 

    description: 'My own quiet time'
  },
  { 
    label: 'Couple Travel', 
    value: 2, 

    description: 'Peaceful time together'
  },
  { 
    label: 'Family Travel', 
    value: 3, 

    description: 'Special experience with family'
  },
  { 
    label: 'Group Travel', 
    value: 4, 

    description: 'Group experience for 4+ people'
  },
];

const ReservationPeopleScreen = ({ navigation }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) {
      // 비로그인 시 즉시 로그인 화면으로 이동
      navigation.getParent()?.navigate('SnsLogin');
    }
  }, [isLoggedIn]);

  const handleNext = () => {
    if (selected !== null) {
      navigation.navigate('ReservationDate');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header - ZEN-TECH Style */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-neutral-900">
          Make Reservation
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Title Section - ZEN-TECH Style */}
        <View className="pt-8 pb-10">
          <Text className="text-3xl font-light text-sage-600 leading-10 mb-4">
            Select the number of{"\n"}participants
          </Text>
          <Text className="text-base text-neutral-600 leading-6">
            Temple stay programs are prepared{"\n"}differently based on group size
          </Text>
        </View>

        {/* People Selection Grid - ZEN-TECH Style */}
        <View className="flex-row flex-wrap justify-between mb-8">
          {PEOPLE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`w-[48%] bg-white rounded-2xl p-5 mb-4 items-center border-2 relative ${
                selected === option.value 
                  ? 'border-sage-600 bg-sage-50 scale-[1.02]' 
                  : 'border-stone-200 active:bg-stone-50'
              }`}
              onPress={() => setSelected(option.value)}
              activeOpacity={0.7}
            >
              <View className="mb-4 w-12 h-12 rounded-2xl bg-sage-100 justify-center items-center">
                <Ionicons name="people-outline" size={24} color="#4A5D23" />
              </View>
              
              <Text className={`text-lg font-semibold mb-2 text-center ${
                selected === option.value ? 'text-sage-600' : 'text-neutral-900'
              }`}>
                {option.label}
              </Text>
              
              <Text className={`text-sm text-center leading-5 ${
                selected === option.value ? 'text-sage-600 font-medium' : 'text-neutral-600'
              }`}>
                {option.description}
              </Text>
              
              {/* Selection Checkmark */}
              {selected === option.value && (
                <View className="absolute top-3 right-3 bg-sage-600 rounded-xl w-6 h-6 justify-center items-center">
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Message - ZEN-TECH Style */}
        <View className="mb-8">
          <View className="flex-row items-center bg-stone-50 rounded-2xl p-4 border border-stone-200">
            <Ionicons name="information-circle-outline" size={20} color="#4A5D23" />
            <Text className="text-sm text-sage-600 ml-3 flex-1 leading-5 font-medium">
              We recommend the optimal program based on your group size
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button - ZEN-TECH Style */}
      <View className="p-5 border-t border-stone-200 bg-white">
        <TouchableOpacity 
          className={`flex-row items-center justify-center rounded-2xl py-4 px-6 ${
            selected === null 
              ? 'bg-neutral-300' 
              : 'bg-sage-600 active:bg-sage-700'
          }`}
          disabled={selected === null} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text className={`text-lg font-semibold ${
            selected === null ? 'text-neutral-500' : 'text-white'
          }`}>
            Continue to Next Step
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={selected === null ? '#9AA0A6' : '#FFFFFF'} 
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// StyleSheet removed - now using NativeWind classes

export default ReservationPeopleScreen; 