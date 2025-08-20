import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TempleListScreen from '../screens/main/temples/TempleListScreen';
import DistanceTemplesScreen from '../screens/main/temples/DistanceTemplesScreen';
import RecommendTemplesScreen from '../screens/main/temples/RecommendTemplesScreen';
import ReservationConfirmScreen from '../screens/main/reservation/ReservationConfirmScreen';

import ReservationDetailScreen from '../screens/main/reservation/ReservationDetailScreen';

export type TempleStackParamList = {
  TempleList: undefined;
  DistanceTemples: undefined;
  RecommendTemples: { boxType: 'popular' | 'region' | 'distance' | 'oneday' };

  ReservationConfirm: { 
    temple: any; 
    selectedProgram: any; 
    selectedDate: string[]; 
    participants: { 
      adults: number; 
      teenagers: number; 
      children: number; 
      preschool: number; 
    }; 
    totalAmount: number; 
  };
  ReservationDetail: { templeId: string };

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
        name="DistanceTemples" 
        component={DistanceTemplesScreen}
        options={{ title: '가까운 사찰' }}
      />
      <Stack.Screen 
        name="RecommendTemples" 
        component={RecommendTemplesScreen}
        options={{ 
          headerShown: false,
          headerBackVisible: false,
          gestureEnabled: false,
          header: () => null
        }}
      />

      <Stack.Screen 
        name="ReservationConfirm" 
        component={ReservationConfirmScreen} 
                  options={{ 
            title: 'Reservation Details',
            headerBackTitle: '',
            headerBackVisible: false
          }}
      />
      <Stack.Screen 
        name="ReservationDetail" 
        component={ReservationDetailScreen} 
        options={{ title: 'Reservation', headerShown: true }}
      />

    </Stack.Navigator>
  );
};

export default TempleStackNavigator; 