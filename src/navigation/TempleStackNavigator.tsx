import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TempleListScreen from '../screens/main/temples/TempleListScreen';
// PopularTemplesScreen은 삭제되었으며, RecommendTemplesScreen으로 통합됨
import RegionTemplesScreen from '../screens/main/temples/RegionTemplesScreen';
import DistanceTemplesScreen from '../screens/main/temples/DistanceTemplesScreen';
import ReservationScreen from '../screens/main/reservation/ReservationScreen';
import ReservationConfirmScreen from '../screens/main/reservation/ReservationConfirmScreen';
import ReservationPeopleScreen from '../screens/main/reservation/ReservationPeopleScreen';
import ReservationDateScreen from '../screens/main/reservation/ReservationDateScreen';
import ReservationPaymentScreen from '../screens/main/reservation/ReservationPaymentScreen';
import ReservationDetailScreen from '../screens/main/ReservationDetailScreen';
import RecommendTemplesScreen from '../screens/main/temples/RecommendTemplesScreen';
import { Reservation } from '../types';

export type TempleStackParamList = {
  TempleList: undefined;
  PopularTemples: undefined;
  RegionTemples: undefined;
  DistanceTemples: undefined;
  RecommendTemples: { boxType: 'popular' | 'region' | 'distance' | 'oneday' };
  Reservation: { templeId: string };
  ReservationConfirm: { reservationDetails: Reservation };
  ReservationDetail: { templeId: string };
  ReservationPeople: undefined;
  ReservationDate: undefined;
  ReservationPayment: undefined;
};

const Stack = createNativeStackNavigator<TempleStackParamList>();

const TempleStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TempleList" 
        component={TempleListScreen}
        options={{ title: '' }}
      />
      <Stack.Screen 
        name="PopularTemples" 
        component={RecommendTemplesScreen}
        options={{ title: '인기 사찰', headerShown: false }}
        initialParams={{ boxType: 'popular' }}
      />
      <Stack.Screen 
        name="RegionTemples" 
        component={RegionTemplesScreen}
        options={{ title: '지역별 사찰' }}
      />
      <Stack.Screen 
        name="DistanceTemples" 
        component={DistanceTemplesScreen}
        options={{ title: '가까운 사찰' }}
      />
      <Stack.Screen 
        name="RecommendTemples" 
        component={RecommendTemplesScreen}
        options={{ title: '사찰 추천', headerShown: false }}
      />
      <Stack.Screen 
        name="Reservation" 
        component={ReservationScreen} 
        options={{ title: '템플스테이 예약' }}
      />
      <Stack.Screen 
        name="ReservationConfirm" 
        component={ReservationConfirmScreen} 
        options={{ title: '예약 완료' }}
      />
      <Stack.Screen 
        name="ReservationDetail" 
        component={ReservationDetailScreen} 
        options={{ title: '상세 예약페이지', headerShown: true }}
      />
      <Stack.Screen 
        name="ReservationPeople" 
        component={ReservationPeopleScreen} 
        options={{ title: '인원 선택', headerShown: false }}
      />
      <Stack.Screen 
        name="ReservationDate" 
        component={ReservationDateScreen} 
        options={{ title: '날짜/시간 선택', headerShown: false }}
      />
      <Stack.Screen 
        name="ReservationPayment" 
        component={ReservationPaymentScreen} 
        options={{ title: '결제', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default TempleStackNavigator; 