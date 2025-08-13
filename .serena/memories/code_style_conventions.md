# Code Style & Conventions

## TypeScript
- 엄격한 타입 체크 사용
- 인터페이스와 타입 정의는 types/ 디렉토리에 모음
- React 컴포넌트는 함수형 컴포넌트 사용

## Styling
- **NativeWind 사용** - Tailwind CSS 클래스로 스타일링
- className prop으로 스타일 적용
- 컬러 시스템: COLORS 상수에서 관리
  - Primary: sage (브랜드 컬러)
  - Neutral colors for text/backgrounds
- 일관된 spacing, border radius 사용

## Component Structure
- Functional components with hooks
- memo() 사용으로 성능 최적화
- Props interface 정의
- 재사용 가능한 컴포넌트는 components/common/에 위치

## State Management
- Zustand 스토어 사용
- 각 도메인별로 별도 스토어 (userStore, templeStore, reservationStore)
- useState/useEffect for local state

## Naming Conventions
- 컴포넌트: PascalCase
- 파일명: PascalCase for components, camelCase for utilities
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- 타입/인터페이스: PascalCase

## Code Organization
- 화면별 로직은 해당 Screen 파일에 포함
- 재사용 로직은 hooks/나 services/에 분리
- API 호출은 services/ 디렉토리에 모음