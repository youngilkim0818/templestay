# templebuk

> Temples, travel, and local experiences in one mobile app.

templebuk is an Expo React Native app for discovering temple stay programs, nearby attractions, transportation options, and curated temple goods. The app is built for a multilingual mobile experience with Supabase-backed authentication and reservation data.

## Highlights

| Area | What it does |
| --- | --- |
| Temple discovery | Browse temples by region, program type, rating, and distance. |
| Map experience | Find nearby temples and attractions using device location and Google Maps. |
| Reservations | Review temple programs, confirm dates, participants, and booking details. |
| My Page | Manage profile, favorite temples, notifications, reviews, and reservations. |
| Market | Explore curated temple-related products and experience items. |
| Localization | Korean, English, Japanese, and Chinese resources are included. |

## Tech Stack

| Layer | Tools |
| --- | --- |
| App | Expo, React Native, TypeScript |
| Navigation | React Navigation |
| State | Zustand, AsyncStorage |
| Backend | Supabase |
| Maps and location | Expo Location, React Native Maps, Google Maps |
| Styling | NativeWind, Tailwind CSS |
| i18n | i18next, react-i18next |

## Project Structure

```text
.
|-- App.tsx
|-- app.config.js
|-- assets/
|-- src/
|   |-- api/
|   |-- components/
|   |-- data/
|   |-- hooks/
|   |-- lib/
|   |-- localization/
|   |-- navigation/
|   |-- screens/
|   |-- services/
|   |-- store/
|   `-- types/
|-- supabase/
`-- package.json
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- Expo CLI or `npx expo`
- iOS Simulator, Android Emulator, or Expo Go

### Installation

```bash
npm install
```

### Environment Variables

Create a local `.env` file from the template:

```bash
cp .env.example .env
```

Fill in the values locally:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_TOUR_API_KEY=your_tour_api_key
EXPO_PUBLIC_API_BASE_URL=https://your-api-server.com
EXPO_PUBLIC_APP_ENV=development
```

Do not commit real API keys, tokens, certificates, service account files, or local `.env` files.

### Run

```bash
npm start
```

Platform-specific commands:

```bash
npm run ios
npm run android
npm run web
```

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server. |
| `npm run ios` | Build and run the iOS app locally. |
| `npm run android` | Build and run the Android app locally. |
| `npm run web` | Start the web target. |
| `npm run build` | Export the Expo project. |
| `npm run preview` | Start a minified preview build. |

## Security Notes

- `.env`, `.env*.local`, `.npmrc`, native signing keys, certificates, and service account JSON files must stay local.
- Public mobile config should reference environment variables through `app.config.js`.
- Supabase anon keys are client-facing, but service role keys must never be used in the app bundle.
- Rotate any key immediately if it was accidentally committed.

## App Store Materials

The repository includes supporting documents for release preparation:

- `privacy-policy.md`
- `store-metadata.md`
- `screenshot-guide.md`
- `beta-testing-guide.md`
- `developer-account-setup.md`

## License

Private project. All rights reserved.
