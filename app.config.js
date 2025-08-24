// Load .env at config time so Expo can inject EXPO_PUBLIC_* vars
require('dotenv/config');

module.exports = {
  expo: {
    name: "templebuk",
    slug: "templebuk-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "templestay",
    deepLinking: {
      scheme: "templestay",
      prefixes: ["templestay://"]
    },
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
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        googleMapsDefaultLanguage: "en"
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "가까운 사찰을 찾기 위해 현재 위치가 필요합니다.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "가까운 사찰을 찾기 위해 현재 위치가 필요합니다.",
        ITSAppUsesNonExemptEncryption: false
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
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: "en"
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
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      eas: {
        projectId: "5d33f64c-2310-4fc0-bf8f-9463d09ac0f7"
      }
    }
  }
};