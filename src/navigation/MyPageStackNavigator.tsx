import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPageScreen from '../screens/main/mypage/MyPageScreen';
import MyReservationsScreen from '../screens/main/mypage/MyReservationsScreen';
import EditProfileScreen from '../screens/main/mypage/EditProfileScreen';

export type MyPageStackParamList = {
  MyPage: undefined;
  MyReservations: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<MyPageStackParamList>();

const MyPageStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MyPage" 
        component={MyPageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MyReservations" 
        component={MyReservationsScreen} 
        options={{ title: 'My Reservations', headerShown: false }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: '회원정보 수정' }}
      />
    </Stack.Navigator>
  );
};

export default MyPageStackNavigator; 