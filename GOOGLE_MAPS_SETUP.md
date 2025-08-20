# Google Maps API 설정 가이드

## 1. Google Cloud Console에서 API 키 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. API 및 서비스 > 라이브러리로 이동
4. 다음 API들을 활성화:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Places API

## 2. API 키 생성 및 제한 설정

1. API 및 서비스 > 사용자 인증 정보로 이동
2. "사용자 인증 정보 만들기" > "API 키" 선택
3. 생성된 API 키를 복사

### API 키 제한 설정 (보안)
- 애플리케이션 제한사항: Android 앱, iOS 앱으로 제한
- API 제한사항: 위에서 활성화한 API들만 선택

## 3. 프로젝트 설정

### 환경 변수 설정
`.env` 파일에서 API 키 업데이트:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### app.json 설정
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "your_actual_api_key_here"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "your_actual_api_key_here"
        }
      }
    }
  }
}
```

## 4. 테스트

1. 앱 재시작: `npx expo start --clear`
2. 지도 화면에서 다음 기능 테스트:
   - 사찰 마커 표시
   - 사찰 마커 클릭 시 상세 페이지 이동
   - 장소 검색 기능
   - 내 위치 표시

## 5. 현재 구현된 기능

✅ **완료된 기능:**
- 사찰 위치 마커 표시
- 사찰 마커 클릭 시 상세 페이지 이동
- 내 위치 표시
- 장소 검색 기능
- 사찰 상세 정보 표시

⚠️ **주의사항:**
- 실제 배포 시 API 키를 환경 변수로 관리하세요
- API 키에 적절한 제한사항을 설정하세요
- 개발 중에는 테스트용 API 키를 사용하세요

## 6. 추가 개선 사항

🔄 **향후 개선 가능한 기능:**
- 사찰까지의 경로 안내
- 주변 관광지 정보
- 실시간 교통 정보
- 사찰 간 거리 계산
- 즐겨찾기 기능