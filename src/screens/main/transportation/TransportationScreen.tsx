import React, { useState, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../../constants/colors';

const TAXI_DATA = [
  {
    id: '1',
    region: 'Gyeongbuk',
    city: 'Andong',
    title: 'Andong Tour Taxi',
    desc: 'Cultural heritage tour with professional guide',
    price: 'From ₩50,000',
    website: 'http://andongtourtaxi.com',
    phone: null,
    distance: 15,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
  },
  {
    id: '2',
    region: 'Gyeongbuk',
    city: 'Yeongcheon',
    title: 'Yeongcheon City Taxi',
    desc: 'Official city tour service with fixed rates',
    price: 'From ₩60,000',
    website: 'https://www.yc.go.kr/tour/contents.do?mId=0607000000',
    phone: null,
    distance: 25,
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop',
  },
  {
    id: '3',
    region: 'Gyeongbuk',
    city: 'Ulleungdo',
    title: 'Ulleungdo Island Tour',
    desc: '2D1N island tour package with marine cruise',
    price: 'Package Deal',
    website: 'https://experiences.myrealtrip.com/products/3884095',
    phone: null,
    distance: 180,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
  },
  {
    id: '4',
    region: 'Gyeongbuk',
    city: 'Gyeongju',
    title: 'Gyeongju Heritage Taxi',
    desc: 'UNESCO World Heritage sites tour',
    price: 'Contact Required',
    website: 'http://www.gjtaxitour.com',
    phone: '0507-1307-8553',
    distance: 35,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
  },
  {
    id: '5',
    region: 'Gyeongbuk',
    city: 'Yeongju',
    title: 'Yeongju Mountain Tour',
    desc: 'Mountain temples and scenic routes',
    price: 'Subsidized',
    website: 'https://www.yeongju.go.kr/tour/contents.do?mId=0401000000',
    phone: '054-639-6603',
    distance: 45,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
  },
  {
    id: '6',
    region: 'Gyeongbuk',
    city: 'Gimcheon',
    title: 'Gimcheon Cultural Tour',
    desc: 'Cultural guide with commentary service',
    price: 'Contact Required',
    website: null,
    phone: '054-435-2253',
    distance: 55,
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop',
  },
  {
    id: '7',
    region: 'Gyeongbuk',
    city: 'Yeongdeok',
    title: 'Yeongdeok Coastal Tour',
    desc: 'East Sea coastline and crab markets',
    price: 'Contact Required',
    website: 'https://ydtaxi.imweb.me/BookNow',
    phone: null,
    distance: 85,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
  },
  {
    id: '8',
    region: 'Gyeongbuk',
    city: 'Pohang',
    title: 'Pohang Steel City Tour',
    desc: 'Industrial heritage and coastal beauty',
    price: '3~8 Hour Packages',
    website: 'https://mfnd.hanatour.com/product-detail/daegu-kr/MHJ-PRD02B0DTGME',
    phone: null,
    distance: 65,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
  },
];

const regions = ['All', 'Gyeongbuk', 'Gyeongnam', 'Busan', 'Daegu'];

// Date Picker Component
const DatePickerModal = memo<{
  visible: boolean;
  onClose: () => void;
  onSelect: (startDate: string, endDate: string, guests: number) => void;
  currentStart: string;
  currentEnd: string;
  currentGuests: number;
}>(({ visible, onClose, onSelect, currentStart, currentEnd, currentGuests }) => {
  const [startDate, setStartDate] = useState(currentStart);
  const [endDate, setEndDate] = useState(currentEnd);
  const [guests, setGuests] = useState(currentGuests);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0'));
  
  const handleConfirm = () => {
    onSelect(startDate, endDate, guests);
    onClose();
  };
  
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-neutral-900">Select Date & Guests</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {/* Start Date */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-neutral-700 mb-2">Check-in Date</Text>
            <View className="flex-row">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                {months.map((month, idx) => (
                  <TouchableOpacity
                    key={month}
                    className={`px-3 py-2 mr-2 rounded-lg ${
                      startDate.split('.')[0] === (idx + 1).toString().padStart(2, '0') ? 'bg-sage-600' : 'bg-stone-100'
                    }`}
                    onPress={() => setStartDate(`${(idx + 1).toString().padStart(2, '0')}.${startDate.split('.')[1] || '10'}`)}
                  >
                    <Text className={`text-sm font-medium ${
                      startDate.split('.')[0] === (idx + 1).toString().padStart(2, '0') ? 'text-white' : 'text-neutral-600'
                    }`}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View className="flex-row mt-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                {days.map(day => (
                  <TouchableOpacity
                    key={day}
                    className={`px-3 py-2 mr-2 rounded-lg ${
                      startDate.split('.')[1] === day ? 'bg-sage-600' : 'bg-stone-100'
                    }`}
                    onPress={() => setStartDate(`${startDate.split('.')[0] || '08'}.${day}`)}
                  >
                    <Text className={`text-sm font-medium ${
                      startDate.split('.')[1] === day ? 'text-white' : 'text-neutral-600'
                    }`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          
          {/* End Date */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-neutral-700 mb-2">Check-out Date</Text>
            <View className="flex-row">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                {months.map((month, idx) => (
                  <TouchableOpacity
                    key={month}
                    className={`px-3 py-2 mr-2 rounded-lg ${
                      endDate.split('.')[0] === (idx + 1).toString().padStart(2, '0') ? 'bg-sage-600' : 'bg-stone-100'
                    }`}
                    onPress={() => setEndDate(`${(idx + 1).toString().padStart(2, '0')}.${endDate.split('.')[1] || '11'}`)}
                  >
                    <Text className={`text-sm font-medium ${
                      endDate.split('.')[0] === (idx + 1).toString().padStart(2, '0') ? 'text-white' : 'text-neutral-600'
                    }`}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View className="flex-row mt-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                {days.map(day => (
                  <TouchableOpacity
                    key={day}
                    className={`px-3 py-2 mr-2 rounded-lg ${
                      endDate.split('.')[1] === day ? 'bg-sage-600' : 'bg-stone-100'
                    }`}
                    onPress={() => setEndDate(`${endDate.split('.')[0] || '08'}.${day}`)}
                  >
                    <Text className={`text-sm font-medium ${
                      endDate.split('.')[1] === day ? 'text-white' : 'text-neutral-600'
                    }`}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          
          {/* Guests */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-neutral-700 mb-2">Guests</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="w-10 h-10 bg-stone-100 rounded-full items-center justify-center"
                onPress={() => setGuests(Math.max(1, guests - 1))}
              >
                <Ionicons name="remove" size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-neutral-900 mx-4 min-w-[40px] text-center">
                {guests}명
              </Text>
              <TouchableOpacity
                className="w-10 h-10 bg-stone-100 rounded-full items-center justify-center"
                onPress={() => setGuests(guests + 1)}
              >
                <Ionicons name="add" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Confirm Button */}
          <TouchableOpacity
            className="bg-sage-600 rounded-2xl py-4 items-center"
            onPress={handleConfirm}
          >
            <Text className="text-white font-bold text-lg">Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

// Simple Taxi Card - Horizontal Layout
const TaxiCard = memo<{
  item: typeof TAXI_DATA[0];
}>(({ item }) => {
  const handlePress = useCallback(() => {
    Alert.alert(
      '서비스 준비 중',
      '택시 예약 서비스는 준비 중입니다.\n곧 만나보실 수 있습니다!',
      [{ text: '확인' }]
    );
  }, []);

  return (
    <TouchableOpacity
      className="bg-white mb-1 border-b border-stone-200 flex-row items-center p-6"
      onPress={handlePress}
    >
      {/* Taxi Image */}
      <View className="w-32 h-32 rounded-xl bg-stone-100 overflow-hidden mr-5">
        <Image 
          source={{ uri: item.imageUrl }} 
          className="w-full h-full" 
          resizeMode="cover"
        />
      </View>
      
      {/* Taxi Info */}
      <View className="flex-1 justify-between" style={{ minHeight: 120 }}>
        <View>
          <Text className="text-lg font-bold text-neutral-900 mb-2">
            {item.title}
          </Text>
          
          <Text className="text-base text-neutral-600 mb-1">
            {item.desc}
          </Text>
          
          <Text className="text-sm text-neutral-500">
            {item.city} • {item.distance}km
          </Text>
        </View>
        
        {/* Price at bottom right */}
        <View className="self-end mt-3">
          <Text className="text-lg font-medium text-black">
            {item.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const TransportationScreen = () => {
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'distance'>('name');
  
  // Sort and filter data
  const filteredAndSortedData = TAXI_DATA
    .filter(item => selectedRegion === 'All' || item.region === selectedRegion)
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distance - b.distance;
      return a.title.localeCompare(b.title);
    });
  
  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      {/* Header */}
      <View className="px-5 py-4 bg-white">
        <Text className="text-2xl font-bold text-sage-600 text-center">
          Tour Taxi
        </Text>
      </View>
      
      {/* Controls */}
      <View className="px-5 py-3 bg-white border-b border-stone-200">
        <View className="flex-row items-center justify-between">
          {/* Region Filter - Left */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-1 mr-4"
          >
            {regions.map(region => (
              <TouchableOpacity
                key={region}
                className={`px-3 py-2 mr-2 rounded-full ${
                  selectedRegion === region 
                    ? 'bg-sage-600' 
                    : 'bg-stone-100'
                }`}
                onPress={() => setSelectedRegion(region)}
              >
                <Text className={`text-sm font-semibold ${
                  selectedRegion === region ? 'text-white' : 'text-neutral-600'
                }`}>
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Sort Button - Right */}
          <TouchableOpacity 
            className="flex-row items-center px-3 py-2 bg-sage-50 rounded-2xl border border-sage-200 active:bg-sage-100"
            onPress={() => setSortBy(sortBy === 'name' ? 'distance' : 'name')}
          >
            <Ionicons name="swap-vertical" size={16} color="#4A5D23" />
            <Text className="text-sm font-medium text-sage-600 ml-1">
              {sortBy === 'name' ? '이름순' : '거리순'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Taxi List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {filteredAndSortedData.map(item => (
          <TaxiCard key={item.id} item={item} />
        ))}
        
        {filteredAndSortedData.length === 0 && (
          <View className="items-center justify-center py-10">
            <Text className="text-neutral-500">No taxis available in this region</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransportationScreen;