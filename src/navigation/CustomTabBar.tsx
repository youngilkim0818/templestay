import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO_COLOR = '#616351'; // 요청한 로고 색상
const TEXT_DARK = '#171717';
const ICON_SIZE = 26; // 아이콘 크기(살짝 크게)
const LABELS: Record<string, string> = {
  Home: 'Home',
  Map: 'Nearby',
  Transportation: 'Taxi',
  Market: 'Market',
  MyPage: 'My',
};

const ICON_BY_ROUTE: Record<string, (focused: boolean, color: string, size: number) => React.ReactNode> = {
  Home: (focused, color, _size) => (
    <Ionicons name={focused ? 'home' : 'home-outline'} size={ICON_SIZE} color={color} />
  ),
  Map: (focused, color, _size) => (
    <Ionicons name={focused ? 'location' : 'location-outline'} size={ICON_SIZE} color={color} />
  ),
  Transportation: (focused, color, _size) => (
    <Ionicons name={focused ? 'car' : 'car-outline'} size={ICON_SIZE} color={color} />
  ),
  Market: (focused, color, _size) => (
    <Ionicons name={focused ? 'cart' : 'cart-outline'} size={ICON_SIZE} color={color} />
  ),
  MyPage: (focused, color, _size) => (
    <Ionicons name={focused ? 'person' : 'person-outline'} size={ICON_SIZE} color={color} />
  ),
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const tabs = useMemo(() => state.routes, [state.routes]);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
        <View style={styles.innerRow}>
          {tabs.map((route, index) => {
            const isFocused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const iconColor = isFocused ? LOGO_COLOR : TEXT_DARK;

            return (
              <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
                <View style={styles.itemColumn}>
                  {ICON_BY_ROUTE[route.name]?.(isFocused, iconColor, 22)}
                  <Text
                    style={[
                      styles.label,
                      isFocused ? styles.labelActive : styles.labelInactive,
                    ]}
                  >
                    {LABELS[route.name] || route.name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0,
  },
  tabItem: {
    height: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  labelActive: {
    color: LOGO_COLOR,
    fontWeight: '800',
  },
  labelInactive: {
    color: TEXT_DARK,
    fontWeight: '400',
  },
});

export default CustomTabBar;


