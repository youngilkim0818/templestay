import { create } from 'zustand';
import * as Location from 'expo-location';

type PermissionStatus = 'unknown' | 'granted' | 'denied';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationState {
  coords: Coordinates | null;
  permissionStatus: PermissionStatus;
  isReady: boolean;
  setCoords: (coords: Coordinates | null) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  initialize: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  permissionStatus: 'unknown',
  isReady: false,

  setCoords: (coords) => set({ coords }),
  setPermissionStatus: (status) => set({ permissionStatus: status }),

  initialize: async () => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      set({ permissionStatus: status === Location.PermissionStatus.GRANTED ? 'granted' : 'denied' });

      if (status !== Location.PermissionStatus.GRANTED) {
        set({ isReady: true });
        return;
      }

      // Get current position with high accuracy
      let position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });
      // Fallbacks for invalid coords
      if (!position?.coords || Math.abs(position.coords.latitude) < 0.0001) {
        const last = await Location.getLastKnownPositionAsync();
        if (last?.coords) {
          position = last as any;
        } else {
          // Seoul City Hall as default
          set({ coords: { latitude: 37.5665, longitude: 126.9780 } });
          set({ isReady: true });
          return;
        }
      }
      set({ coords: { latitude: position.coords.latitude, longitude: position.coords.longitude } });
    } catch (error) {
      // If we fail, keep coords as null but mark ready
      console.warn('Location initialization failed:', error);
    } finally {
      set({ isReady: true });
    }
  },
}));

export default useLocationStore;

