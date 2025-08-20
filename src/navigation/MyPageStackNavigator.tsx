import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPageScreen from '../screens/main/mypage/MyPageScreen';
import MyReservationsScreen from '../screens/main/mypage/MyReservationsScreen';
import EditProfileScreen from '../screens/main/mypage/EditProfileScreen';
import ChangePasswordScreen from '../screens/main/mypage/ChangePasswordScreen';
import CommonListScreen from '../screens/main/mypage/CommonListScreen';

export type MyPageStackParamList = {
  MyPage: undefined;
  MyReservations: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  CommonList: { initialTab: number };
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
        options={{ 
          headerShown: false,
          header: () => null,
          headerTitle: '',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ 
          headerShown: false,
          header: () => null,
          headerTitle: '',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="CommonList" 
        component={CommonListScreen} 
        options={{ 
          headerShown: false,
          header: () => null,
          headerTitle: '',
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MyPageStackNavigator; 