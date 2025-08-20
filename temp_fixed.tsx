import React, { useMemo, useCallback, memo, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Dimensions, Alert, Modal } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TempleStackParamList } from '../../navigation/TempleStackNavigator';
import { TEMPLES_DATA, getTempleByIdWithImages } from '../../data/temple-data';
import { TempleService } from '../../services/templeService';
import { Temple } from '../../types';
import { TourApiService, TourAttraction, formatApiDistance, calculateDistanceFromApi } from '../../services/tourApiService';
import { COLORS } from '../../constants/colors';

import { enrichTempleWithImages } from '../../services/templeImageService';

const { width } = Dimensions.get('window');

// ?ÑÎ°úÍ∑∏Îû® ?úÎ™©Í≥??§Î™Ö Î≤àÏó≠ ?®Ïàò
const translateProgramTitle = (title: string): string => {
  if (title.includes('?ùÍµ¥??)) return 'Seokguram Temple Stay';
  if (title.includes('Íµ?ïÖÎ¨∏ÌôîÍ≥µÏó∞')) return 'Traditional Korean Music Performance';
  if (title.includes('?¨Ìï≠??)) return 'Pohang Station Temple Stay';
  if (title.includes('Î∂àÍµ≠??)) return 'Bulguksa Temple Stay';
  if (title.includes('?†Î¨¥??)) return 'Seonmudo Training';
  if (title.includes('Î™ÖÏÉÅ')) return 'Meditation Program';
  if (title.includes('?¥Ïãù')) return 'Rest & Relaxation';
  if (title.includes('Ï≤¥Ìóò')) return 'Cultural Experience';
  return title;
};

const translateProgramDescription = (description: string): string => {
  if (description.includes('?ùÍµ¥??)) return 'Experience the spiritual atmosphere of Seokguram, a UNESCO World Heritage site';
  if (description.includes('Íµ?ïÖÎ¨∏ÌôîÍ≥µÏó∞')) return 'Immerse yourself in traditional Korean music and cultural performances';
  if (description.includes('?¨Ìï≠??)) return 'Discover the peaceful temple life near Pohang Station';
  if (description.includes('Î∂àÍµ≠??)) return 'Experience the grandeur of Bulguksa Temple, a masterpiece of Buddhist architecture';
  if (description.includes('?†Î¨¥??)) return 'Learn the ancient martial art of Seonmudo for mind and body harmony';
  if (description.includes('Î™ÖÏÉÅ')) return 'Deep meditation practice in the serene temple environment';
  if (description.includes('?¥Ïãù')) return 'Peaceful rest and relaxation in the temple grounds';
  if (description.includes('Ï≤¥Ìóò')) return 'Hands-on cultural experiences and temple activities';
  return description;
};

const ImageGallery = memo<{
  images: string[];
  mainImage: string;
}>(({ images, mainImage }) => {
  return (
    <View className="w-full h-80 rounded-t-3xl overflow-hidden">
      <Image source={{ uri: mainImage } as any} className="w-full h-full" resizeMode="cover" />
    </View>
  );
});

const ProgramCard = memo<{
  program: any;
  onReservePress: () => void;
}>(({ program, onReservePress }) => {
  return (
    <View className="bg-stone-50 rounded-xl p-3 border border-stone-200 mb-3">
      <Text className="text-lg font-semibold text-sage-600 mb-1">{program.title}</Text>
      <Text className="text-sm text-neutral-600 mb-2" numberOfLines={2}>{program.description}</Text>
      <Text className="text-base font-bold text-neutral-900">??program.price?.toLocaleString()}</Text>
    </View>
  );
});

const AttractionCard = memo<{
  attraction: TourAttraction | { name: string; distance: string; description: string; };
  templeLocation?: { latitude: number; longitude: number };
}>(({ attraction, templeLocation }) => {
  const isTourAttraction = 'contentid' in attraction;
  
  const displayName = isTourAttraction ? attraction.title : attraction.name;
  const displayDistance = isTourAttraction && templeLocation 
    ? formatApiDistance(calculateDistanceFromApi(templeLocation.latitude, templeLocation.longitude, attraction.mapy, attraction.mapx))
    : (attraction as any).distance;
  const displayDescription = isTourAttraction 
    ? `${attraction.addr1} ${attraction.addr2 || ''}`.trim()
    : (attraction as any).description;

  return (
    <View className="bg-white rounded-2xl p-4 mr-3 w-72 border border-stone-200">
      {/* ?¨ÏßÑ???àÏúºÎ©??§Ï†ú ?¨ÏßÑ ?úÏãú, ?ÜÏúºÎ©??ÑÏãú ?¨ÏßÑÏπ??úÏãú */}
        <View className="w-full h-28 rounded-xl mb-3 bg-stone-100 overflow-hidden">
        {isTourAttraction && attraction.firstimage ? (
          <Image source={{ uri: attraction.firstimage }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-stone-200">
            <Text className="text-4xl">?èûÔ∏?/Text>
            <Text className="text-xs text-stone-500 mt-1">Photo</Text>
        </View>
      )}
      </View>
      <Text className="text-lg font-bold text-sage-600 mb-1" numberOfLines={1}>
        {displayName}
      </Text>
      <Text className="text-sm text-neutral-600 mb-2" numberOfLines={2}>
        {displayDescription || 'Ï£ºÏÜå ?ïÎ≥¥ ?ÜÏùå'}
      </Text>
      <Text className="text-sm font-semibold text-neutral-700">
        {displayDistance || 'Í±∞Î¶¨ ?ïÎ≥¥ ?ÜÏùå'}
      </Text>
    </View>
  );
});

// Í∞ÑÎã®??Ï∫òÎ¶∞??Ïª¥Ìè¨?åÌä∏
const SimpleCalendar = memo<{
  selectedDate: Date[];
  currentMonth: Date;
  selectedProgram: any;
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}>(({ selectedDate, currentMonth, selectedProgram, onDateSelect, onMonthChange }) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    // ?¥Ï†Ñ ?¨Ïùò ÎßàÏ?Îß??†Îì§ (Îπ?Ïπ∏ÏúºÎ°?Ï±ÑÏ?)
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    // ?ÑÏû¨ ?¨Ïùò ?†Îì§
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // 7??Î∞∞ÏàòÎ°?ÎßûÏ∂îÍ∏??ÑÌï¥ ÎßàÏ?ÎßâÏóê Îπ?Ïπ?Ï∂îÍ?
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 0; i < remainingDays; i++) {
        days.push(null);
      }
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View className="bg-white p-2 border border-stone-200">
      {/* ???§ÎπÑÍ≤åÏù¥??*/}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => onMonthChange('prev')} className="p-1">
          <Ionicons name="chevron-back" size={16} color="#616351" />
        </TouchableOpacity>
        <Text className="text-sm font-semibold text-neutral-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => onMonthChange('next')} className="p-1">
          <Ionicons name="chevron-forward" size={16} color="#616351" />
        </TouchableOpacity>
      </View>

      {/* Î∂ÑÎ¶¨??*/}
      <View className="h-px bg-stone-200 mb-4" />

                  {/* ?îÏùº ?§Îçî */}
            <View className="flex-row mb-4">
              {dayNames.map((day, index) => (
                                  <View key={day} className="flex-1 items-center px-0.5">
                    <Text className={`text-xs font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-neutral-600'}`} numberOfLines={1}>
                      {day}
                    </Text>
                  </View>
              ))}
            </View>

      {/* ?†Ïßú Í∑∏Î¶¨??- 7?¥Î°ú ?ïÌôï?òÍ≤å Î∞∞Ïπò */}
      <View className="items-center">
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
          <View key={weekIndex} className="flex-row mb-0">
            {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
              const today = new Date();
              const isPastDate = day && day < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              
              // ?ÑÎ°úÍ∑∏Îû®Î≥??àÏïΩ Í∞Ä???†Ïßú ?ïÏù∏
              let isReservationAvailable = true;
              if (day && selectedProgram) {
                const daysUntilProgram = Math.ceil((day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (selectedProgram.title.includes('?ùÍµ¥??)) {
                  // 3Î≤??ÑÎ°úÍ∑∏Îû®: 3???ÑÍπåÏßÄ ?àÏïΩ Í∞Ä??(?§Îäò, ?¥Ïùº, Î™®Î†à Îπ®Í∞Ñ??
                  isReservationAvailable = daysUntilProgram >= 3;
                } else if (selectedProgram.title.includes('Íµ?ïÖÎ¨∏ÌôîÍ≥µÏó∞')) {
                  // 2Î≤??ÑÎ°úÍ∑∏Îû®: 1???ÑÍπåÏßÄ ?àÏïΩ Í∞Ä??(?§ÎäòÎß?Îπ®Í∞Ñ??
                  isReservationAvailable = daysUntilProgram >= 1;
                } else {
                  // 1Î≤??ÑÎ°úÍ∑∏Îû®: 3???ÑÍπåÏßÄ ?àÏïΩ Í∞Ä??(?§Îäò, ?¥Ïùº, Î™®Î†à Îπ®Í∞Ñ??
                  isReservationAvailable = daysUntilProgram >= 3;
                }
              }
              
              return (
                <View key={dayIndex} className="w-6 h-6 items-center justify-center m-0.5">
                  {day ? (
                    isPastDate ? (
                      // ÏßÄ???†Ïßú - ?åÏÉâ Ï≤òÎ¶¨, ?∞Ïπò Î∂àÍ?
                      <View className="w-6 h-6 items-center justify-center rounded-full bg-stone-200">
                        <Text className="text-xs font-medium text-stone-400">
                          {day.getDate()}
                        </Text>
                      </View>
                    ) : !isReservationAvailable ? (
                      // ?àÏïΩ Î∂àÍ??•Ìïú ?†Ïßú - Îπ®Í∞Ñ??Ï≤òÎ¶¨, ?∞Ïπò Î∂àÍ?
                      <View className="w-6 h-6 items-center justify-center rounded-full bg-red-200">
                        <Text className="text-xs font-medium text-red-600">
                          {day.getDate()}
                        </Text>
                      </View>
                    ) : (
                      // ?àÏïΩ Í∞Ä?•Ìïú ?†Ïßú - ?∞Ïπò Í∞Ä??
                      <TouchableOpacity
                        onPress={() => onDateSelect(day)}
                        className={`w-6 h-6 items-center justify-center rounded-full ${
                          selectedDate.some(selected => day.toDateString() === selected.toDateString())
                            ? 'bg-sage-600'
                            : 'bg-stone-50'
                        }`}
                      >
                        <Text className={`text-xs font-medium ${
                          selectedDate.some(selected => day.toDateString() === selected.toDateString())
                            ? 'text-white'
                            : 'text-neutral-700'
                        }`}>
                          {day.getDate()}
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    <View className="w-6 h-6" />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

const ReservationDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TempleStackParamList>>();
  const route = useRoute<RouteProp<TempleStackParamList, 'ReservationDetail'>>();
  const params: any = route.params;
  const templeId = params?.templeId || params?.params?.templeId;
  const templeData = params?.templeData || params?.params?.templeData;
  
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [attractions, setAttractions] = useState<TourAttraction[]>([]);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [adultCount, setAdultCount] = useState(0);
  const [teenagerCount, setTeenagerCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [preschoolCount, setPreschoolCount] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showReservationModal, setShowReservationModal] = useState(false);

  useEffect(() => {
    const loadTempleWithImages = async () => {
      if (!templeId) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('?èõÔ∏??¨Ï∞∞ ?ÅÏÑ∏ ?∞Ïù¥??Î°úÎî©:', templeId);
        
        let templeToUse: Temple;
        
        // templeDataÍ∞Ä ?àÏúºÎ©??∞ÏÑ† ?¨Ïö©, ?ÜÏúºÎ©?TEMPLES_DATA?êÏÑú Ï∞æÍ∏∞
        if (templeData) {
          templeToUse = templeData;
          console.log('???ÑÎã¨Î∞õÏ? ?¨Ï∞∞ ?∞Ïù¥???¨Ïö©:', templeData.name);
        } else {
          const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
          if (!basicTemple) {
            console.log('???¨Ï∞∞ ?∞Ïù¥?∞Î? Ï∞æÏùÑ ???ÜÏùå');
            setTemple(null);
            setLoading(false);
            return;
          }
          templeToUse = basicTemple;
          console.log('??TEMPLES_DATA?êÏÑú ?¨Ï∞∞ ?∞Ïù¥??Î°úÎìú ?ÑÎ£å:', basicTemple.name);
        }
        
        // TempleImageServiceÎ•??¨Ïö©?òÏó¨ ?¥Î?ÏßÄ?Ä ?§Î™Ö Î≥¥Í∞ï
        try {
          const enrichedTemple = await enrichTempleWithImages(templeToUse);
          console.log('??TempleImageServiceÎ•??µÌïú ?∞Ïù¥??Î≥¥Í∞ï ?ÑÎ£å');
          console.log('?îç Î≥¥Í∞ï???¨Ï∞∞ ?∞Ïù¥??templestay:', enrichedTemple.templestay);
          
          // Í∏∞Î≥∏ ?¨Ï∞∞ ?ïÎ≥¥ ?§Ï†ï (Î≥¥Í∞ï???∞Ïù¥??
          setTemple(enrichedTemple);
          
          // Supabase?êÏÑú ?ÑÎ°úÍ∑∏Îû® ÏµúÏã†??(?àÏúºÎ©???ñ¥?∞Í∏∞)
          try {
            const programs = await TempleService.getTemplePrograms(String(templeToUse.id));
            if (programs && programs.length > 0) {
              setTemple({ ...enrichedTemple, programs });
              console.log(`???ÑÎ°úÍ∑∏Îû® ${programs.length}Í∞?Î°úÎìú`);
            } else {
              console.log('?†Ô∏è Supabase?êÏÑú ?ÑÎ°úÍ∑∏Îû® ?ïÎ≥¥Î•?Ï∞æÏùÑ ???ÜÏùå, Í∏∞Î≥∏ ?∞Ïù¥???¨Ïö©');
            }
          } catch (error) {
            console.log('?†Ô∏è Supabase ?ÑÎ°úÍ∑∏Îû® Î°úÎî© ?§Ìå®, Í∏∞Î≥∏ ?∞Ïù¥???¨Ïö©:', error);
          }
        } catch (error) {
          console.log('?†Ô∏è TempleImageService Î≥¥Í∞ï ?§Ìå®, Í∏∞Î≥∏ ?∞Ïù¥???¨Ïö©:', error);
          setTemple(templeToUse);
        }
        
      } catch (error) {
        console.error('???¨Ï∞∞ ?∞Ïù¥??Î°úÎìú ?§Ìå®:', error);
        // ?êÎü¨ Î∞úÏÉù ?úÏóê??Í∏∞Î≥∏ ?∞Ïù¥???¨Ïö© ?úÎèÑ
        if (templeData) {
          setTemple(templeData);
          console.log('???êÎü¨ ???ÑÎã¨Î∞õÏ? ?∞Ïù¥???¨Ïö©:', templeData.name);
        } else {
          const basicTemple = TEMPLES_DATA.find((item) => item.id === templeId);
          if (basicTemple) {
            setTemple(basicTemple);
            console.log('???êÎü¨ ??TEMPLES_DATA ?¨Ïö©:', basicTemple.name);
          } else {
            setTemple(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadTempleWithImages();
  }, [templeId, templeData]);

  // Load attractions based on area code when temple data is available
  useEffect(() => {
    const loadAttractionsByArea = async () => {
      if (temple && typeof temple.areaCd === 'number') {
        setAttractionsLoading(true);
        try {
          console.log(`?èûÔ∏?ÏßÄ??Ωî??Í∏∞Î∞ò Ï£ºÎ? Í¥ÄÍ¥ëÏ? Í≤Ä???úÏûë: areaCd=${temple.areaCd}, sigunguCd=${temple.sigunguCd}`);

          // 1. ?úÍµ∞Íµ??®ÏúÑÎ°??ïÌôï?òÍ≤å Í≤Ä??
          let nearbyAttractions: TourAttraction[] = await TourApiService.getHubAttractionsByAreaWithFallback(
            temple.areaCd,
            temple.sigunguCd,
            6,
            20
          );

          // 2. Í≤∞Í≥ºÍ∞Ä ?ÜÏúºÎ©?Í¥ëÏó≠ ?®ÏúÑÎ°??¨Í???
          if (nearbyAttractions.length === 0) {
            console.log(`?†Ô∏è Ï£ºÎ? Í¥ÄÍ¥ëÏ? ?ïÎ≥¥ ?ÜÏùå. Í¥ëÏó≠ ?®ÏúÑÎ°??¨Í???(areaCd: ${temple.areaCd})`);
            nearbyAttractions = await TourApiService.getAttractionsByArea(temple.areaCd);
          }

          // 3. Í∑∏Îûò??Í≤∞Í≥ºÍ∞Ä ?ÜÏúºÎ©?ÏßÄ??™Ö?ºÎ°ú ?§Ïõå??Í≤Ä??
          if (nearbyAttractions.length === 0) {
            console.log(`?†Ô∏è Í¥ëÏó≠ Í≤Ä???§Ìå®. ÏßÄ??™Ö ?§Ïõå??Í≤Ä???úÎèÑ (region: ${temple.region})`);
            nearbyAttractions = await TourApiService.searchAttractions(temple.region);
          }
          
          const filteredAttractions = (nearbyAttractions || [])
            .filter(attraction => !attraction.title.includes(temple.name))
            .slice(0, 5);

          // 3) ?¥Î?ÏßÄ Î≥¥Í∞ï: firstimageÍ∞Ä ?ÜÏúºÎ©??¨ÏßÑÍ∞§Îü¨Î¶¨Ïóê??1???òÏßë
          const enriched = await Promise.all(
            filteredAttractions.map(async (a) => {
              if (!a.firstimage) {
                try {
                  const photos = await TourApiService.getGalleryDetailByTitle(a.title, 1, 1);
                  if (photos && photos.length > 0 && photos[0].galWebImageUrl) {
                    const safeUrl = photos[0].galWebImageUrl.startsWith('http://')
                      ? photos[0].galWebImageUrl.replace('http://', 'https://')
                      : photos[0].galWebImageUrl;
                    return { ...a, firstimage: safeUrl } as TourAttraction;
                  }
                } catch {}
              }
              return a;
            })
          );
          
          if (enriched.length > 0) {
            setAttractions(enriched);
            console.log(`??Ï£ºÎ? Í¥ÄÍ¥ëÏ? ${enriched.length}Í∞?Î°úÎìú ?ÑÎ£å (?¥Î?ÏßÄ Î≥¥Í∞ï ?¨Ìï®)`);
          } else {
            console.log('?†Ô∏è Ï£ºÎ? Í¥ÄÍ¥ëÏ? ?ÜÏùå ??fallback ?¨Ïö©');
            setAttractions([]);
          }
        } catch (error) {
          console.error('??Ï£ºÎ? Í¥ÄÍ¥ëÏ? Î°úÎìú ?§Ìå®:', error);
          setAttractions([]);
        } finally {
          setAttractionsLoading(false);
        }
      }
    };

    loadAttractionsByArea();
  }, [temple]);
  
  const handleReservePress = useCallback(() => {
    navigation.navigate('ReservationPeople');
  }, [navigation]);
  
  const handleFavoritePress = useCallback(() => {
    // Favorite logic
  }, []);
  
  const handleDateSelect = useCallback((date: Date) => {
    if (!selectedProgram) {
      setErrorMessage('Please select a program first.');
      return;
    }
    
    // ?ÑÎ°úÍ∑∏Îû®Î≥??àÏïΩ Í∞Ä???†Ïßú Í≥ÑÏÇ∞
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilProgram = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let isReservationAvailable = false;
    
    if (selectedProgram.title.includes('?ùÍµ¥??)) {
      // 3Î≤??ÑÎ°úÍ∑∏Îû®: ?ùÍµ¥??- ?πÏùº ?àÏïΩ Í∞Ä??
      isReservationAvailable = daysUntilProgram >= 0;
    } else if (selectedProgram.title.includes('Íµ?ïÖÎ¨∏ÌôîÍ≥µÏó∞')) {
      // 2Î≤??ÑÎ°úÍ∑∏Îû®: Íµ?ïÖÎ¨∏ÌôîÍ≥µÏó∞ - 1???ÑÍπåÏßÄ ?àÏïΩ Í∞Ä??
      isReservationAvailable = daysUntilProgram >= 1;
    } else {
      // 1Î≤??ÑÎ°úÍ∑∏Îû®: 3???ÑÍπåÏßÄ ?àÏïΩ Í∞Ä??(?§Îäò, ?¥Ïùº, Î™®Î†à Îπ®Í∞Ñ??
      isReservationAvailable = daysUntilProgram >= 3;
    }
    
    // ?àÏïΩ Î∂àÍ??•Ìïú ?†Ïßú???†ÌÉù?????ÜÏùå
    if (!isReservationAvailable) {
      console.log('?ìÖ ?àÏïΩ Î∂àÍ??•Ìïú ?†Ïßú:', date.toDateString());
      return;
    }
    
    // 2?ºÏßúÎ¶??ÑÎ°úÍ∑∏Îû®?¥Î?Î°??†ÌÉù???†Ïßú?Ä ?§Ïùå?†ÏùÑ ?¨Ìï®
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    // ?¥Î? ?†ÌÉù???†Ïßú Î≤îÏúÑ???¨Ìï®?òÏñ¥ ?àÎäîÏßÄ ?ïÏù∏
    const isDateInRange = selectedDate.some(selected => 
      selected.toDateString() === date.toDateString() || 
      selected.toDateString() === nextDay.toDateString()
    );
    
    if (isDateInRange) {
      // ?†ÌÉù???†Ïßú Î≤îÏúÑÎ•??§Ïãú ?∞Ïπò?òÎ©¥ ?†ÌÉù ?¥Ï†ú
      setSelectedDate([]);
      console.log('?ìÖ ?†Ïßú ?†ÌÉù ?¥Ï†ú');
    } else {
      // ?àÎ°ú???†Ïßú Î≤îÏúÑ ?†ÌÉù
      setSelectedDate([date, nextDay]);
      console.log('?ìÖ ?†ÌÉù???†Ïßú Î≤îÏúÑ:', date.toDateString(), '~', nextDay.toDateString());
    }
    
    // ?†Ïßú Í¥Ä??Í≤ΩÍ≥†Î¨?Ï¥àÍ∏∞??
            if (errorMessage === 'Please select a date.') {
      setErrorMessage('');
    }
  }, [selectedDate, selectedProgram, errorMessage]);
  
  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  }, []);

  // ?ÑÎ°úÍ∑∏Îû® ?†ÌÉù ?∏Îì§??
  const handleProgramSelect = useCallback((program: any) => {
    if (selectedProgram && selectedProgram.title === program.title) {
      // Í∞ôÏ? ?ÑÎ°úÍ∑∏Îû®???§Ïãú ?¥Î¶≠?òÎ©¥ ?†ÌÉù ?¥Ï†ú
      setSelectedProgram(null);
      console.log('?ìã ?ÑÎ°úÍ∑∏Îû® ?†ÌÉù ?¥Ï†ú:', program.title);
    } else {
      // ?àÎ°ú???ÑÎ°úÍ∑∏Îû® ?†ÌÉù
      setSelectedProgram(program);
      console.log('?ìã ?†ÌÉù???ÑÎ°úÍ∑∏Îû®:', program);
      console.log('?ìã ?†ÌÉù???ÑÎ°úÍ∑∏Îû® ?úÎ™©:', program.title);
      console.log('?ìã ?†ÌÉù???ÑÎ°úÍ∑∏Îû® ?§Î™Ö:', program.description);
    }
    
    // ?ÑÎ°úÍ∑∏Îû® Í¥Ä??Í≤ΩÍ≥†Î¨?Ï¥àÍ∏∞??
            if (errorMessage === 'Please select a program.') {
      setErrorMessage('');
    }
  }, [selectedProgram, errorMessage]);

  // Ï¥?Í∏àÏï° Í≥ÑÏÇ∞ (?†ÌÉù???ÑÎ°úÍ∑∏Îû® Í∞ÄÍ≤?Í∏∞Ï?)
  const totalAmount = useMemo(() => {
    if (!selectedProgram) {
      // ?ÑÎ°úÍ∑∏Îû®???†ÌÉù?òÏ? ?äÏ? Í≤ΩÏö∞ Í∏∞Î≥∏ Í∞ÄÍ≤??¨Ïö©
      return (adultCount * 120000) + (teenagerCount * 80000) + (childCount * 60000) + (preschoolCount * 40000);
    }
    
    // ?†ÌÉù???ÑÎ°úÍ∑∏Îû®???§Ï†ú Í∞ÄÍ≤??¨Ïö©
    const programPricing = temple?.programDetails?.[selectedProgram.title]?.pricing;
    
    if (programPricing) {
      return (adultCount * (programPricing.adult || 0)) + 
              (teenagerCount * (programPricing.teenager || 0)) + 
              (childCount * (programPricing.child || 0)) + 
             (preschoolCount * (programPricing.preschool || 0));
    }
    
    // programDetailsÍ∞Ä ?ÜÎäî Í≤ΩÏö∞ fallback Í∞ÄÍ≤??¨Ïö©
    return (adultCount * 120000) + (teenagerCount * 110000) + (childCount * 100000) + (preschoolCount * 90000);
  }, [selectedProgram, adultCount, teenagerCount, childCount, preschoolCount, temple?.programDetails]);

  // ?àÏïΩ Ï≤òÎ¶¨ ?®Ïàò
  const handleReservation = useCallback(() => {
    if (!selectedProgram) {
      setErrorMessage('Please select a program.');
      return;
    }
    
    // ?êÎü¨ Î©îÏãúÏßÄ Ï¥àÍ∏∞??
    setErrorMessage('');
    
         // ?àÏïΩ ?ïÏ†ï ?òÏù¥ÏßÄÎ°??¥Îèô
     if (temple) {
       navigation.navigate('ReservationConfirm', {
         temple,
         selectedProgram,
         selectedDate: [], // Îπ?Î∞∞Ïó¥Î°?Ï¥àÍ∏∞??
         participants: {
           adults: 0, // 0?ºÎ°ú Ï¥àÍ∏∞??
           teenagers: 0,
           children: 0,
           preschool: 0,
         },
         totalAmount: 0
       });
     }
  }, [selectedProgram, navigation, temple]);


  
  const fallbackAttractions = useMemo(() => [
    { name: 'Seoraksan National Park', distance: '?öó 1.5km ??20 min walk', description: 'A beautiful natural landscape and a place to experience the tranquility of the temple.' },
    { name: 'Bulguksa Grotto', distance: '?öó 2.3km ??30 min walk', description: 'A historically significant site designated as a UNESCO World Heritage site.' }
  ], []);

  if (loading || !temple) {
    return (
      <View className="flex-1 justify-center items-center bg-stone-100">
        <ActivityIndicator size="large" color={COLORS.brand.sage} />
        <Text className="mt-3 text-neutral-600">Loading details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-stone-100">
      {/* ?ÑÏ≤¥ ?¨ÏßÑÏπ?*/}
      <View className="relative h-80 bg-stone-200">
        {temple.imageUrl ? (
          <Image 
            source={temple.imageUrl} 
            className="w-full h-full" 
            resizeMode="cover"
            onError={(error) => {
              console.log('Image loading error:', error);
              console.log('temple.imageUrl:', temple.imageUrl);
              console.log('temple.name:', temple.name);
            }}
            onLoad={() => console.log('Image loaded successfully:', temple.imageUrl)}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl">?èØ</Text>
            <Text className="text-sm text-neutral-500 mt-2">Could not load image</Text>
            <Text className="text-xs text-neutral-400 mt-1">imageUrl: {JSON.stringify(temple.imageUrl)}</Text>
            <Text className="text-xs text-neutral-400 mt-1">temple.name: {temple.name}</Text>
          </View>
        )}
      </View>

      {/* Î≥∏Î¨∏ */}
      <View className="bg-white -mt-5 rounded-t-1xl px-5 pt-6 pb-10">
        {/* ?ÅÎã®: ?úÎ™©/Ï£ºÏÜå + Ï∫òÎ¶∞??+ ?∏Ïõê?†ÌÉù */}
        <View className="mb-6">
          {/* ?úÎ™©Í≥?Ï£ºÏÜå */}
          <View className="mb-4">
        <Text className="text-2xl font-bold text-neutral-900 mb-2">{temple.name.replace(/Temple/g, '').trim()}</Text>
            <Text className="text-neutral-700 mb-2">{temple.address}</Text>

          </View>

        {/* ?úÌîå?§ÌÖå???ÑÎ°úÍ∑∏Îû® */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-3">Templestay Programs</Text>
          {(() => {
            const programs: any[] = (temple as any).programs && (temple as any).programs.length > 0
              ? (temple as any).programs
              : ((temple as any).templestay || []);
            if (!programs || programs.length === 0) {
              return (
                <Text className="text-neutral-600">No programs registered.</Text>
              );
            }
            return programs.slice(0, 3).map((program: any, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => handleProgramSelect(program)}
                  className={`mb-3 p-3 border ${
                    selectedProgram && selectedProgram.title === program.title
                      ? 'bg-sage-50 border-sage-400'
                      : 'bg-white border-stone-200'
                  }`}
                >
                   <Text className="text-lg font-semibold text-sage-600 mb-1">{translateProgramTitle(program.title)}</Text>
                   <Text className="text-sm text-neutral-600 mb-2" numberOfLines={2}>{translateProgramDescription(program.description)}</Text>
                  <Text className="text-base font-bold text-neutral-900">??program.price?.toLocaleString()}</Text>
                  {selectedProgram && selectedProgram.title === program.title && (
                    <View className="mt-2 flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#059669" />
                      <Text className="text-sm text-sage-600 ml-1">Selected</Text>
              </View>
                  )}
                </TouchableOpacity>
            ));
          })()}
        </View>

          {/* ?†ÌÉù???ÑÎ°úÍ∑∏Îû® ?ïÎ≥¥ (?ÑÎ°úÍ∑∏Îû®???†ÌÉù?àÏùÑ ?åÎßå ?úÏãú) */}
          {selectedProgram && (
            <View className="mb-6">
              {/* Ï∞∏Í?ÎπÑÏö© ?πÏÖò */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Text className="text-stone-700 font-bold text-sm">??/Text>
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">Participation Fee</Text>
                </View>
                
                {/* Í∞ÄÍ≤©Ìëú */}
                <View className="bg-stone-100 border border-stone-200 rounded p-3 mb-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-neutral-700">Adult</Text>
                    <Text className="text-sm font-semibold text-neutral-700">Teenager</Text>
                    <Text className="text-sm font-semibold text-neutral-700">Child</Text>
                    <Text className="text-sm font-semibold text-neutral-700">Preschool</Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-base font-bold text-neutral-900">
                      {temple.programDetails?.[selectedProgram.title]?.pricing?.adult?.toLocaleString() || 
                       (translateProgramTitle(selectedProgram.title).includes('Seokguram') ? '150,000' : 
                        translateProgramTitle(selectedProgram.title).includes('Traditional Korean Music Performance') ? '130,000' : '120,000')}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {temple.programDetails?.[selectedProgram.title]?.pricing?.teenager?.toLocaleString() || 
                       (translateProgramTitle(selectedProgram.title).includes('Seokguram') ? '140,000' : 
                        translateProgramTitle(selectedProgram.title).includes('Traditional Korean Music Performance') ? '120,000' : '110,000')}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {temple.programDetails?.[selectedProgram.title]?.pricing?.child?.toLocaleString() || 
                       (translateProgramTitle(selectedProgram.title).includes('Seokguram') ? '130,000' : 
                        translateProgramTitle(selectedProgram.title).includes('Traditional Korean Music Performance') ? '110,000' : '100,000')}
                    </Text>
                    <Text className="text-base font-bold text-neutral-900">
                      {temple.programDetails?.[selectedProgram.title]?.pricing?.preschool?.toLocaleString() || 
                       (translateProgramTitle(selectedProgram.title).includes('Seokguram') ? '120,000' : 
                        translateProgramTitle(selectedProgram.title).includes('Traditional Korean Music Performance') ? '100,000' : '90,000')}
                    </Text>
                  </View>
                </View>
                
                {/* ?àÏïΩ ?àÎÇ¥ */}
                <Text className="text-sm text-red-500">
                  ??{temple.programDetails?.[selectedProgram.title]?.reservationNotice || 
                     (translateProgramTitle(selectedProgram.title).includes('Seokguram') ? 'Reservations available until 3 days before program start date' : 
                      translateProgramTitle(selectedProgram.title).includes('Traditional Korean Music Performance') ? 'Reservations available until 1 day before program start date' : 
                      'Reservations available until 3 days before program start date')}
                </Text>
              </View>

              {/* ?ÑÎ°úÍ∑∏Îû® ?åÍ∞ú ?πÏÖò */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="calendar" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">Program Introduction</Text>
                </View>
                
                <View className="space-y-3">
                    <Text className="text-sm text-neutral-700 leading-5">
                      {temple.programDetails?.[selectedProgram.title]?.description || translateProgramDescription(selectedProgram.description) || 'Loading program details...'}
                    </Text>
                    
                    {/* Ï∂îÍ? ?ïÎ≥¥ */}
                    <View className="space-y-2">
                      {temple.programDetails?.[selectedProgram.title]?.additionalInfo ? (
                        temple.programDetails[selectedProgram.title].additionalInfo?.map((info: string, index: number) => (
                          <Text key={index} className="text-sm text-neutral-700">
                            ??{info}
                          </Text>
                        ))
                      ) : (
                        <>
                          <Text className="text-sm text-neutral-700">
                            ??Reservations may be cancelled if payment is not made within 7 days.
                          </Text>
                          <Text className="text-sm text-neutral-700">
                            ??Group programs require prior consultation and may be subject to change based on temple circumstances.
                          </Text>
                        </>
                      )}
                    </View>
                    
                    <Text className="text-sm text-neutral-500 text-center">***</Text>
                  </View>
              </View>

              {/* ?ºÎ∞ò Ï§ÄÎπÑÎ¨º ?πÏÖò */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="briefcase" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">Required Items</Text>
                </View>
                
                <Text className="text-sm text-neutral-700 leading-5">
                  {temple.commonDetails?.preparationItems || 'Personal toiletries, towel, spare clothes (outerwear), sneakers (comfortable shoes), socks, personal (insulated) water bottle. For winter participation: winter gear and ice cleats.'}
                </Text>
              </View>

              {/* ?òÎ∂àÍ∑úÏ†ï ?πÏÖò */}
              <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="megaphone" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">Refund Policy</Text>
                </View>
                
                <View className="space-y-2">
                  {temple.commonDetails?.refundPolicy ? (
                    temple.commonDetails.refundPolicy.map((policy, index) => (
                      <Text key={index} className="text-sm text-neutral-700">??{policy}</Text>
                    ))
                  ) : (
                    <>
                      <Text className="text-sm text-neutral-700">??100% refund 3 days before scheduled participation</Text>
                      <Text className="text-sm text-neutral-700">??50% refund 2 days before scheduled participation</Text>
                      <Text className="text-sm text-neutral-700">??No refund for same-day cancellation</Text>
                      <Text className="text-sm text-neutral-700">??Bank transfer fees deducted</Text>
                      <Text className="text-sm text-neutral-700">??No refund during travel week events</Text>
                    </>
                  )}
                </View>
              </View>

              {/* Ï≤?∑ú ?πÏÖò */}
                <View className="bg-stone-50 border border-stone-200 p-4 rounded-lg mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-stone-300 rounded-full items-center justify-center mr-3">
                    <Ionicons name="document-text" size={16} color="#78716c" />
                  </View>
                  <Text className="text-lg font-bold text-neutral-900">Temple Rules</Text>
                </View>
                
                <View className="space-y-2">
                  {temple.commonDetails?.templeRules ? (
                    temple.commonDetails.templeRules.map((rule, index) => (
                      <Text key={index} className="text-sm text-neutral-700">??{rule}</Text>
                    ))
                  ) : (
                    <>
                      <Text className="text-sm text-neutral-700">??Please refrain from drinking and smoking within the temple grounds.</Text>
                      <Text className="text-sm text-neutral-700">??Please refrain from loud behavior and noise.</Text>
                    </>
                  )}
                </View>
              </View>

                {/* ?àÏïΩ?òÍ∏∞ Î≤ÑÌäº */}
                  <TouchableOpacity 
                  onPress={handleReservation}
                  className="w-full bg-sage-600 py-4 rounded-lg mb-6"
                >
                  <Text className="text-white font-semibold text-lg text-center">Make Reservation</Text>
                  </TouchableOpacity>


                </View>
          )}


        </View>


        {/* ?òÎã®: Í∑ºÏ≤ò Í¥ÄÍ¥ëÏ? Ï∂îÏ≤ú */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-neutral-900 mb-3">Nearby Attractions</Text>
          {attractionsLoading ? (
            <View className="py-6 items-center"><ActivityIndicator color={COLORS.brand.sage} /></View>
          ) : attractions.length > 0 ? (
            <FlatList<any>
              horizontal
              data={attractions}
              keyExtractor={(item: any) => item.contentid || `attr-${Math.random()}`}
              renderItem={({ item }: any) => (
                <AttractionCard 
                  attraction={item} 
                  templeLocation={temple ? { latitude: temple.latitude, longitude: temple.longitude } : undefined}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              // ?±Îä• ÏµúÏ†Å??
              removeClippedSubviews={true}
              maxToRenderPerBatch={3}
              updateCellsBatchingPeriod={100}
              initialNumToRender={3}
              windowSize={5}
            />
          ) : (
            <View className="bg-stone-50 border border-stone-200 rounded-lg p-6 items-center">
              <Text className="text-4xl mb-2">?èûÔ∏?/Text>
              <Text className="text-sm font-medium text-neutral-700 mb-1">Ï£ºÎ? Í¥ÄÍ¥ëÏ? ?ïÎ≥¥Î•?Î∂àÎü¨?????ÜÏäµ?àÎã§</Text>
              <Text className="text-xs text-neutral-500 text-center">
                ?ÑÏû¨ ??ÏßÄ??ùò Í¥ÄÍ¥ëÏ? ?ïÎ≥¥Í∞Ä ?úÍ≥µ?òÏ? ?äÏäµ?àÎã§
              </Text>
            </View>
          )}
        </View>
      </View>


    </ScrollView>
  );
};

export default ReservationDetailScreen;
