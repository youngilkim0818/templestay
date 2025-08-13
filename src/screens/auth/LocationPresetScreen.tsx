import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const POPULAR_LOCATIONS = [
  { id: 1, name: 'Gyeongju', description: 'Historical city with Bulguksa and Seokguram' },
  { id: 2, name: 'Andong', description: 'Traditional culture and Hahoe Village' },
  { id: 3, name: 'Yeongju', description: 'Beautiful scenery of Sobaeksan and Buseoksa' },
  { id: 4, name: 'Pohang', description: 'Templestay with ocean views' },
];

const LocationPresetScreen = ({ navigation }: any) => {
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const handleCurrentLocation = () => {
    Alert.alert(
      'Use Current Location',
      'We will use location services to recommend nearby temples.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Allow', 
          onPress: () => {
            setUseCurrentLocation(true);
            setSelectedLocation(null);
          }
        }
      ]
    );
  };

  const handleNext = () => {
    if (useCurrentLocation || selectedLocation || searchText.trim()) {
      navigation.navigate('TemplePreference');
    } else {
      Alert.alert('Select Location', 'Please select a location or search.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* 상단 진행바 */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
        <View className="flex-1 items-center mx-6">
          <View className="w-full h-2 bg-stone-200 rounded-full">
            <View className="w-3/4 h-full bg-sage-600 rounded-full" />
          </View>
          <Text className="text-xs font-semibold text-sage-600 mt-2">3 / 4</Text>
        </View>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-5">
        {/* 타이틀 섹션 */}
        <View className="py-8">
          <Text className="text-3xl font-light text-sage-600 leading-10 mb-4">
            Select Your Location
          </Text>
          <Text className="text-base text-neutral-600 leading-6">
            We'll recommend the perfect{'\n'}templestay experience for you
          </Text>
        </View>

        {/* 현재 위치 사용 버튼 */}
        <View className="mb-8">
          <TouchableOpacity 
            className={`rounded-2xl p-4 border-2 ${
              useCurrentLocation 
                ? 'bg-sage-600 border-sage-600' 
                : 'bg-white border-stone-200 active:bg-stone-50'
            }`}
            onPress={handleCurrentLocation}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name="location" 
                size={24} 
                color={useCurrentLocation ? '#FFFFFF' : '#4A5D23'} 
              />
              <View className="flex-1 ml-4">
                <Text className={`text-base font-semibold mb-1 ${
                  useCurrentLocation ? 'text-white' : 'text-neutral-900'
                }`}>
                  Use Current Location
                </Text>
                <Text className={`text-sm ${
                  useCurrentLocation ? 'text-sage-100' : 'text-neutral-600'
                }`}>
                  Automatically find nearby temples
                </Text>
              </View>
              {useCurrentLocation && (
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-px bg-stone-200" />
          <Text className="text-sm font-medium text-neutral-500 mx-4">OR</Text>
          <View className="flex-1 h-px bg-stone-200" />
        </View>

        {/* 위치 검색 */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-sage-600 mb-4">Search Location</Text>
          <View className="flex-row items-center bg-white rounded-xl p-4 border border-stone-200">
            <Ionicons name="search" size={20} color="#9AA0A6" />
            <TextInput
              className="flex-1 text-base text-neutral-900 ml-3"
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search city name (e.g. Gyeongju)"
              placeholderTextColor="#9AA0A6"
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#9AA0A6" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 인기 지역 */}
        <View className="flex-1">
          <Text className="text-lg font-semibold text-sage-600 mb-4">Popular Templestay Regions</Text>
          <View className="space-y-3">
            {POPULAR_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location.id}
                className={`flex-row items-center p-4 rounded-xl border ${
                  selectedLocation === location.id 
                    ? 'bg-sage-50 border-sage-600'
                    : useCurrentLocation
                    ? 'bg-white border-stone-200 opacity-50'
                    : 'bg-white border-stone-200 active:bg-stone-50'
                }`}
                onPress={() => {
                  if (!useCurrentLocation) {
                    setSelectedLocation(location.id);
                  }
                }}
                disabled={useCurrentLocation}
              >
                <View className="w-12 h-12 rounded-xl bg-stone-100 justify-center items-center mr-4">
                  <Ionicons name="location-outline" size={24} color="#4A5D23" />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-semibold mb-1 ${
                    selectedLocation === location.id ? 'text-sage-600' : 'text-neutral-900'
                  }`}>
                    {location.name}
                  </Text>
                  <Text className="text-sm text-neutral-600">{location.description}</Text>
                </View>
                {selectedLocation === location.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#4A5D23" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 하단 버튼 */}
      <View className="p-5 border-t border-stone-200 bg-white">
        <TouchableOpacity 
          className={`flex-row items-center justify-center rounded-2xl py-4 px-6 ${
            (useCurrentLocation || selectedLocation || searchText.trim()) 
              ? 'bg-sage-600 active:bg-sage-700' 
              : 'bg-neutral-300'
          }`}
          onPress={handleNext}
        >
          <Text className={`text-lg font-semibold mr-2 ${
            (useCurrentLocation || selectedLocation || searchText.trim()) 
              ? 'text-white' 
              : 'text-neutral-500'
          }`}>
            Next
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={20} 
            color={(useCurrentLocation || selectedLocation || searchText.trim()) ? '#FFFFFF' : '#9AA0A6'} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// StyleSheet removed - using NativeWind classes

export default LocationPresetScreen; 