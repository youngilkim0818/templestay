import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useNotificationStore, { Notification } from '../../../store/notificationStore';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'reservation_confirmed':
      return { name: 'checkmark-circle', color: '#22C55E' };
    case 'reservation_cancelled':
      return { name: 'close-circle', color: '#EF4444' };
    case 'review_reminder':
      return { name: 'star', color: '#F59E0B' };
    case 'promotion':
      return { name: 'gift', color: '#8B5CF6' };
    case 'system':
      return { name: 'information-circle', color: '#3B82F6' };
    default:
      return { name: 'notifications', color: '#6B7280' };
  }
};

const getTimeAgo = (createdAt: string) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`;
  
  return created.toLocaleDateString('ko-KR');
};

const NotificationCard = ({ notification, onPress, onDelete }: {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
}) => {
  const iconInfo = getNotificationIcon(notification.type);

  return (
    <TouchableOpacity
      className={`bg-white p-4 mb-2 border-l-4 ${
        notification.isRead ? 'border-stone-200' : 'border-sage-500'
      }`}
      onPress={onPress}
    >
      <View className="flex-row items-start">
        <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
          notification.isRead ? 'bg-stone-100' : 'bg-sage-50'
        }`}>
          <Ionicons 
            name={iconInfo.name as any} 
            size={20} 
            color={notification.isRead ? '#6B7280' : iconInfo.color} 
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className={`text-sm font-semibold flex-1 ${
              notification.isRead ? 'text-neutral-600' : 'text-neutral-900'
            }`}>
              {notification.title}
            </Text>
            <TouchableOpacity 
              className="ml-2 p-1"
              onPress={onDelete}
            >
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text className={`text-xs mb-2 ${
            notification.isRead ? 'text-neutral-500' : 'text-neutral-700'
          }`}>
            {notification.message}
          </Text>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-[11px] text-neutral-400">
              {getTimeAgo(notification.createdAt)}
            </Text>
            
            {!notification.isRead && (
              <View className="w-2 h-2 bg-sage-500 rounded-full" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NotificationsScreen = ({ navigation }: any) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || !notification.isRead
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // 예약 관련 알림인 경우 예약 상세로 이동
    if (notification.type.includes('reservation') && notification.reservationId) {
      navigation.navigate('MyReservations', { 
        highlightReservation: notification.reservationId 
      });
    }
  }, [markAsRead, navigation]);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    await deleteNotification(notificationId);
  }, [deleteNotification]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  }, [markAllAsRead, unreadCount]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      '모든 알림 삭제',
      '정말 모든 알림을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: clearAllNotifications
        }
      ]
    );
  }, [clearAllNotifications]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-stone-200">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full justify-center items-center mr-3"
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={24} color="#4A5D23" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-sage-600 flex-1">알림</Text>
        
        {notifications.length > 0 && (
          <TouchableOpacity 
            className="px-3 py-1 bg-stone-100 rounded-lg"
            onPress={handleClearAll}
          >
            <Text className="text-xs text-neutral-600">전체 삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats & Actions */}
      <View className="bg-white px-5 py-4 border-b border-stone-200">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Text className="text-sm font-semibold text-neutral-900">
              총 {notifications.length}개
            </Text>
            {unreadCount > 0 && (
              <>
                <Text className="text-sm text-neutral-600 mx-2">•</Text>
                <Text className="text-sm font-semibold text-sage-600">
                  읽지 않음 {unreadCount}개
                </Text>
              </>
            )}
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity
              className="px-3 py-1 bg-sage-100 rounded-lg"
              onPress={handleMarkAllAsRead}
            >
              <Text className="text-xs text-sage-600 font-medium">모두 읽음</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter */}
        <View className="flex-row">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg mr-2 ${
              filter === 'all' ? 'bg-sage-600' : 'bg-stone-100'
            }`}
            onPress={() => setFilter('all')}
          >
            <Text className={`text-xs font-semibold ${
              filter === 'all' ? 'text-white' : 'text-neutral-600'
            }`}>
              전체 ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              filter === 'unread' ? 'bg-sage-600' : 'bg-stone-100'
            }`}
            onPress={() => setFilter('unread')}
          >
            <Text className={`text-xs font-semibold ${
              filter === 'unread' ? 'text-white' : 'text-neutral-600'
            }`}>
              읽지 않음 ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4A5D23']}
          />
        }
      >
        {filteredNotifications.length > 0 ? (
          <View className="p-4">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onDelete={() => handleDeleteNotification(notification.id)}
              />
            ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons 
              name="notifications-outline" 
              size={64} 
              color="#6B7280" 
            />
            <Text className="text-base font-semibold text-neutral-900 mt-4 mb-2">
              {filter === 'all' 
                ? '알림이 없습니다' 
                : '읽지 않은 알림이 없습니다'
              }
            </Text>
            <Text className="text-xs text-neutral-600 text-center">
              {filter === 'all'
                ? '새로운 알림이 오면 여기에 표시됩니다.'
                : '모든 알림을 확인하셨습니다.'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;