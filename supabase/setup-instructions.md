# Supabase 프로젝트 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://app.supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: templestay-app
   - **Database Password**: 안전한 비밀번호 설정
   - **Region**: Northeast Asia (ap-northeast-1) 선택
   - **Pricing Plan**: Free tier 선택

## 2. 데이터베이스 스키마 생성

1. 프로젝트 대시보드에서 "SQL Editor" 클릭
2. "New query" 클릭
3. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사 후 실행

## 3. 초기 데이터 입력

1. SQL Editor에서 새 쿼리 생성
2. `supabase/seed.sql` 파일 내용 복사 후 실행

## 4. 환경 변수 설정

1. 프로젝트 설정 페이지에서 "API" 탭 클릭
2. 다음 정보 복사:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. `.env` 파일 업데이트:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. 인증 설정

1. Authentication > Settings 페이지로 이동
2. "Site URL" 설정:
   - Development: `http://localhost:19006`
   - Production: 배포 후 실제 도메인

## 6. 실시간 기능 활성화

1. Database > Replication 페이지로 이동
2. 실시간 구독이 필요한 테이블 활성화:
   - `public.reservations` 테이블 선택
   - "Enable" 클릭

## 7. 스토리지 설정 (이미지 업로드용)

1. Storage 페이지로 이동
2. "New bucket" 클릭
3. 버킷 이름: `temple-images`
4. Public bucket으로 설정

## 8. 설정 완료 확인

프로젝트 설정이 완료되면 다음과 같은 구조가 생성됩니다:

### 테이블 구조:
- `auth.users` (Supabase 기본 인증 테이블)
- `public.users` (사용자 프로필 정보)
- `public.temples` (사찰 정보)
- `public.temple_programs` (템플스테이 프로그램)
- `public.reservations` (예약 정보)

### 주요 기능:
- 사용자 인증 및 권한 관리
- 실시간 데이터 동기화
- 행 단위 보안 정책 (RLS)
- 자동 타임스탬프 업데이트
- 사용자 프로필 자동 생성

## 9. 테스트

설정이 완료되면 다음 명령어로 앱을 실행하여 테스트:

```bash
npm start
```

## 10. 문제 해결

### 자주 발생하는 문제들:

1. **RLS 정책 오류**: 
   - Row Level Security가 활성화되어 있는지 확인
   - 적절한 정책이 설정되어 있는지 확인

2. **환경 변수 인식 안됨**:
   - `.env` 파일이 올바른 위치에 있는지 확인
   - 변수명이 `EXPO_PUBLIC_` 접두사로 시작하는지 확인

3. **실시간 기능 동작 안함**:
   - Replication에서 해당 테이블이 활성화되어 있는지 확인
   - 네트워크 연결 상태 확인

4. **이미지 업로드 실패**:
   - 스토리지 버킷이 public으로 설정되어 있는지 확인
   - 적절한 권한이 설정되어 있는지 확인