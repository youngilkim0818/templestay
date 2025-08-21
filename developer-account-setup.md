# 앱 스토어 개발자 계정 설정 가이드

## 📱 Apple Developer Program 설정

### 1. 계정 등록
**비용**: $99/년  
**URL**: https://developer.apple.com/programs/

#### 필요 정보:
- **Apple ID** (기존 계정 사용 가능)
- **법인 정보** (개인/법인 선택)
- **신용카드** (연간 결제용)
- **신분증 인증**

#### 등록 단계:
1. Apple Developer 사이트 접속
2. "Join the Apple Developer Program" 선택
3. 개인/조직 선택
4. 결제 정보 입력
5. 승인 대기 (보통 24-48시간)

### 2. App Store Connect 설정
**URL**: https://appstoreconnect.apple.com/

#### 앱 정보 설정:
```
App Name: Temple Stay
Bundle ID: com.templestay.app
SKU: templestay-app-v1
Primary Language: Korean
```

#### 카테고리:
- **Primary**: Travel
- **Secondary**: Lifestyle

#### 가격 및 배포:
- **Price**: Free
- **Availability**: 전 세계
- **App Store 배포 가능일**: 심사 완료 후 즉시

### 3. 필수 정보 입력

#### 앱 정보:
- [ ] 앱 이름: "Temple Stay" 
- [ ] 부제: "Korean Temple Culture & Travel"
- [ ] 설명: [store-metadata.md 참조]
- [ ] 키워드: "temple,stay,meditation,healing,Korea,culture,traditional,booking"
- [ ] 지원 URL: https://templestay.app/support
- [ ] 마케팅 URL: https://templestay.app (선택사항)

#### 개인정보 보호:
- [ ] 개인정보 처리방침 URL: https://templestay.app/privacy
- [ ] 개인정보 수집 여부: 예
- [ ] 위치 정보 사용: 예 (사찰 검색용)

#### 연령 등급:
- **Age Rating**: 4+ (모든 연령)
- **Content Rating**: Clean (폭력, 선정성 없음)

## 🤖 Google Play Console 설정

### 1. 계정 등록  
**비용**: $25 (일회성)  
**URL**: https://play.google.com/console/

#### 필요 정보:
- **Google 계정**
- **개발자 이름**
- **국가/지역**: 대한민국
- **신용카드** (일회성 결제)

#### 등록 단계:
1. Google Play Console 접속
2. "Create Developer Account" 선택
3. 개인/조직 선택
4. $25 등록비 결제
5. 신분 인증 완료

### 2. 앱 생성 및 설정

#### 앱 기본 정보:
```
App Name: Temple Stay
Package Name: com.templestay.app
Default Language: Korean
```

#### 앱 카테고리:
- **Category**: Travel & Local
- **Tags**: Temple, Culture, Meditation, Korea

#### 콘텐츠 등급:
- **Target Audience**: Everyone
- **Content Rating**: Everyone (E)

### 3. 스토어 등록 정보

#### 앱 세부정보:
- [ ] 앱 이름: "Temple Stay"
- [ ] 간단한 설명: "한국 사찰 예약과 주변 관광지 발견"
- [ ] 자세한 설명: [localized-metadata.json 참조]

#### 그래픽 애셋:
- [ ] 앱 아이콘: 512 x 512 px
- [ ] 기능 그래픽: 1024 x 500 px
- [ ] 스크린샷: 최소 2개 (휴대전화용)

#### 연락처 정보:
- [ ] 이메일: support@templestay.app
- [ ] 웹사이트: https://templestay.app
- [ ] 전화번호: (선택사항)

## 📋 공통 준비사항

### 1. 앱 서명 인증서

#### iOS (Apple):
```bash
# Xcode에서 자동 관리 권장
# 또는 수동으로 Provisioning Profile 생성
```

#### Android (Google):
```bash
# Keystore 파일 생성 (한 번만)
keytool -genkey -v -keystore temple-stay-release.keystore \
  -alias temple-stay-key \
  -keyalg RSA -keysize 2048 -validity 10000

# 앱 서명용 (EAS Build에서 자동 처리)
```

### 2. 스크린샷 준비
[screenshot-guide.md 참조]

#### 필수 스크린샷:
- [ ] iPhone (1290 x 2796) - 최소 3개
- [ ] Android Phone (1080 x 1920) - 최소 2개
- [ ] iPad (선택사항)
- [ ] Android Tablet (선택사항)

### 3. 앱 설명 준비
[store-metadata.md 및 localized-metadata.json 참조]

#### 다국어 지원:
- [ ] 한국어 (기본)
- [ ] 영어
- [ ] 일본어 (선택사항)
- [ ] 중국어 (선택사항)

## 🚀 빌드 및 업로드 준비

### 1. EAS Build 설정
```bash
# EAS CLI 설치
npm install -g @expo/cli

# 프로젝트에서 EAS 설정
eas build:configure

# iOS 빌드 (App Store 용)
eas build --platform ios --profile production

# Android 빌드 (Google Play 용)  
eas build --platform android --profile production
```

### 2. 앱 업로드

#### iOS:
1. EAS Build로 생성된 .ipa 파일을 App Store Connect에 업로드
2. 또는 Xcode Archive & Upload 사용

#### Android:
1. EAS Build로 생성된 .aab 파일을 Google Play Console에 업로드
2. 또는 직접 Android App Bundle 업로드

## ⚠️ 주의사항

### 심사 거부 방지:
1. **메타데이터 일관성**: 앱 내 콘텐츠와 스토어 설명 일치
2. **기능 완성도**: 모든 기능이 정상 동작해야 함
3. **개인정보 보호**: 위치 권한 사용 목적 명확히 기재
4. **스크린샷 품질**: 실제 앱 화면을 정확히 반영

### 출시 전 체크리스트:
- [ ] 앱이 크래시 없이 안정적으로 동작
- [ ] 모든 API 키가 환경변수로 설정됨
- [ ] 개인정보 처리방침 링크가 유효함
- [ ] 스크린샷이 최신 앱 상태를 반영
- [ ] 다국어 텍스트가 올바르게 표시됨

## 📞 지원 연락처

### Apple:
- **Developer Support**: https://developer.apple.com/support/
- **App Review**: https://developer.apple.com/app-store/review/

### Google:
- **Play Console Help**: https://support.google.com/googleplay/android-developer/
- **Policy Support**: https://support.google.com/googleplay/android-developer/answer/113417

## 🗓️ 예상 일정

1. **개발자 계정 승인**: 1-2일
2. **앱 정보 입력**: 1일  
3. **스크린샷 촬영**: 1일
4. **빌드 및 업로드**: 1일
5. **심사 대기**: 
   - iOS: 24-48시간
   - Android: 2-3일
6. **총 소요시간**: **약 1주일**