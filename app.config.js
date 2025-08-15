// Load .env at config time so Expo can inject EXPO_PUBLIC_* vars
require('dotenv/config');

module.exports = {
  expo: {
    name: "템플스테이",
    slug: "templestay-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "templestay",
    plugins: [
      "expo-location"
    ],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#F5F1EB"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.templestay.app",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "가까운 사찰을 찾기 위해 현재 위치가 필요합니다.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "가까운 사찰을 찾기 위해 현재 위치가 필요합니다."
      }
    },
    android: {
      package: "com.templestay.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: "https://sbeeewzhmjophlytqhys.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZWVld3pobWpvcGhseXRxaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzY3OTgsImV4cCI6MjA2NzAxMjc5OH0.eeXlhAxO8hB39sUvP81NNSO2vmHPnCMBzUdP6RvJgG4",
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    }
  }
};