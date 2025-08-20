import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../screens/main/home/HomeScreen';
import MapScreen from '../screens/main/MapScreen';
import TransportationScreen from '../screens/main/transportation/TransportationScreen';
import MarketScreen from '../screens/main/MarketScreen';
import MyPageStackNavigator from './MyPageStackNavigator';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: t('navigation.home') }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: t('navigation.map') }}
      />
      <Tab.Screen 
        name="Transportation" 
        component={TransportationScreen} 
        options={{ title: t('navigation.transportation') }}
      />
      <Tab.Screen 
        name="Market" 
        component={MarketScreen} 
        options={{ title: t('navigation.market') }}
      />
      <Tab.Screen 
        name="MyPage" 
        component={MyPageStackNavigator} 
        options={{ title: t('navigation.myPage') }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 