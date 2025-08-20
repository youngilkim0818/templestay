import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  type: 'reservation_confirmed' | 'reservation_cancelled' | 'review_reminder' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: any; // 추가 데이터 (예: 예약 ID, 사찰 정보 등)
  isRead: boolean;
  createdAt: string;
  reservationId?: string;
  templeName?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  createReservationNotification: (reservationId: string, templeName: string, status: 'confirmed' | 'cancelled') => Promise<void>;
}

const STORAGE_KEY = 'user_notifications';

const useNotificationStore = create<NotificationState & NotificationActions>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // 알림 추가
  addNotification: async (notificationData) => {
    try {
      const newNotification: Notification = {
        ...notificationData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const currentState = get();
      const updatedNotifications = [newNotification, ...currentState.notifications];
      
      set({
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length,
      });

      // AsyncStorage에 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error adding notification:', error);
      set({ error: 'Failed to add notification' });
    }
  },

  // 개별 알림 읽음 처리
  markAsRead: async (notificationId) => {
    try {
      const currentState = get();
      const updatedNotifications = currentState.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );

      set({
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length,
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      set({ error: 'Failed to mark notification as read' });
    }
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    try {
      const currentState = get();
      const updatedNotifications = currentState.notifications.map(notification => ({
        ...notification,
        isRead: true,
      }));

      set({
        notifications: updatedNotifications,
        unreadCount: 0,
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      set({ error: 'Failed to mark all notifications as read' });
    }
  },

  // 알림 삭제
  deleteNotification: async (notificationId) => {
    try {
      const currentState = get();
      const updatedNotifications = currentState.notifications.filter(
        notification => notification.id !== notificationId
      );

      set({
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length,
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error deleting notification:', error);
      set({ error: 'Failed to delete notification' });
    }
  },

  // 모든 알림 삭제
  clearAllNotifications: async () => {
    try {
      set({
        notifications: [],
        unreadCount: 0,
      });

      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      set({ error: 'Failed to clear notifications' });
    }
  },

  // 저장된 알림 불러오기
  loadNotifications: async () => {
    try {
      set({ isLoading: true, error: null });

      const storedNotifications = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedNotifications) {
        const notifications: Notification[] = JSON.parse(storedNotifications);
        
        set({
          notifications,
          unreadCount: notifications.filter(n => !n.isRead).length,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      set({ 
        error: 'Failed to load notifications',
        isLoading: false 
      });
    }
  },

  // 예약 관련 알림 생성 (헬퍼 메서드)
  createReservationNotification: async (reservationId, templeName, status) => {
    const { addNotification } = get();
    
    const notificationData = {
      type: status === 'confirmed' ? 'reservation_confirmed' as const : 'reservation_cancelled' as const,
      title: status === 'confirmed' ? '예약이 확정되었습니다!' : '예약이 취소되었습니다',
      message: status === 'confirmed' 
        ? `${templeName} 템플스테이 예약이 성공적으로 완료되었습니다. 즐거운 여행 되세요!`
        : `${templeName} 템플스테이 예약이 취소되었습니다.`,
      reservationId,
      templeName,
      data: {
        reservationId,
        templeName,
        status,
      },
    };

    await addNotification(notificationData);
  },
}));

export default useNotificationStore;