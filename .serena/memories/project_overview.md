# Temple Stay Project Overview

## Project Purpose
템플스테이 예약 서비스 - 한국의 사찰에서 제공하는 템플스테이 프로그램을 검색, 예약할 수 있는 모바일 앱

## Tech Stack
- **Framework**: React Native + Expo
- **Navigation**: React Navigation v7
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Backend**: Supabase
- **Map Services**: React Native Maps
- **API**: Tour API Service (관광지 정보)
- **Internationalization**: i18next

## Key Features
- 사찰 검색 및 상세 정보 보기
- 템플스테이 프로그램 예약
- 주변 관광지 정보 제공
- 다국어 지원 (한국어, 영어, 일본어, 중국어)
- 지도 기반 사찰 위치 서비스

## Project Structure
```
src/
├── api/ - API 클라이언트들
├── components/ - 재사용 컴포넌트
├── constants/ - 상수 정의
├── data/ - 정적 데이터
├── hooks/ - 커스텀 훅
├── lib/ - 외부 라이브러리 설정
├── localization/ - 다국어 지원
├── navigation/ - 네비게이션 구조
├── screens/ - 화면 컴포넌트들
├── services/ - 비즈니스 로직
├── store/ - 상태 관리
├── types/ - TypeScript 타입 정의
└── utils/ - 유틸리티 함수
```

## Key Commands
- `npm start` - Expo 개발 서버 시작
- `npm run android` - Android 앱 실행
- `npm run ios` - iOS 앱 실행
- `npm run web` - 웹 버전 실행