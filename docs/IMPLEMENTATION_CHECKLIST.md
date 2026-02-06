# V-Hub Volunteer Impact System - 구현 체크리스트

## 📋 프로젝트 개요

**프로젝트명**: V-Hub (Volunteer Impact System)  
**한 줄 정의**: 봉사 활동의 가치를 실시간 데이터로 증명하고 시각화하는 임팩트 관리 플랫폼  
**기술 스택**: Next.js App Router, Supabase (Auth, Database, Storage, Realtime), Tailwind CSS, Framer Motion, Shadcn UI

---

## Phase 1: Foundation (기반 구축)

### 1. Supabase 클라이언트 설정 및 환경 구성

#### 1.1 Supabase 클라이언트 초기화

- **데이터 흐름**: 환경 변수 → Supabase Client 생성 → 전역 Context 제공
- **파일 경로**: `lib/supabase/client.ts`
- **기술 스택**: `@supabase/supabase-js`, Next.js Client Component
- **구현 내용**:
  - `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 확인
  - `createClient()` 함수로 Supabase 클라이언트 인스턴스 생성
  - `getSupabaseClient()` 유틸리티 함수 export
  - TypeScript 타입: `types/database.ts`의 `Database` 타입 적용

#### 1.2 Supabase 서버 클라이언트 (Server Actions용)

- **데이터 흐름**: Server Component → Supabase Server Client → RLS 정책 적용된 쿼리
- **파일 경로**: `lib/supabase/server.ts`
- **기술 스택**: Next.js Server Component, `@supabase/ssr`
- **구현 내용**:
  - `createServerClient()` 함수 생성 (cookies 기반)
  - `cookies()` Next.js API 사용하여 세션 관리
  - Server Actions에서 사용할 수 있도록 export

#### 1.3 환경 변수 검증

- **데이터 흐름**: 앱 시작 → 환경 변수 검증 → 에러 핸들링
- **파일 경로**: `lib/supabase/env.ts`
- **기술 스택**: TypeScript, Zod (선택사항)
- **구현 내용**:
  - 필수 환경 변수 존재 여부 확인
  - 개발 환경에서 누락 시 경고 메시지 출력
  - 타입 안전한 환경 변수 접근 함수 생성

---

### 2. 인증 시스템 (Supabase Auth 연동)

#### 2.1 Auth Context 리팩토링

- **데이터 흐름**: Supabase Auth → `auth-context.tsx` → 전역 User State
- **파일 경로**: `lib/auth-context.tsx`
- **기술 스택**: React Context API, Supabase Auth SDK (`supabase.auth`)
- **구현 내용**:
  - `useAuth()` 훅에서 `supabase.auth.getSession()` 호출하여 초기 세션 확인
  - `supabase.auth.onAuthStateChange()` 리스너 등록하여 실시간 인증 상태 감지
  - `login(email, password)`: `supabase.auth.signInWithPassword()` 호출
  - `register(name, email, password)`: `supabase.auth.signUp()` 호출 후 `profiles` 테이블 INSERT 트리거 확인
  - `logout()`: `supabase.auth.signOut()` 호출
  - `user` 상태를 `profiles` 테이블과 JOIN하여 `name`, `avatar_url` 포함
  - 로딩 상태(`isLoading`) 관리

#### 2.2 로그인 페이지 연동

- **데이터 흐름**: 사용자 입력 → `useAuth().login()` → Supabase Auth → 리다이렉트
- **파일 경로**: `app/login/page.tsx`
- **기술 스택**: Next.js Client Component, React Hook Form (선택사항)
- **구현 내용**:
  - 기존 mock 로직 제거
  - `useAuth().login()` 호출하여 실제 Supabase 인증 수행
  - 에러 핸들링: `supabase.auth.signInWithPassword()` 에러 메시지 표시
  - 성공 시 `/` 또는 `/dashboard`로 리다이렉트 (`useRouter().push()`)
  - 로딩 상태 표시 (Button disabled, Spinner)

#### 2.3 회원가입 페이지 연동

- **데이터 흐름**: 사용자 입력 → `useAuth().register()` → Supabase Auth → 프로필 생성 트리거
- **파일 경로**: `app/register/page.tsx`
- **기술 스택**: Next.js Client Component
- **구현 내용**:
  - 기존 mock 로직 제거
  - `useAuth().register()` 호출하여 실제 Supabase 회원가입 수행
  - `supabase.auth.signUp()` 호출 시 `metadata: { name }` 포함하여 프로필 트리거에 전달
  - `seed.sql`의 `handle_new_user()` 트리거가 `profiles` 테이블에 자동 생성하는지 확인
  - 에러 핸들링 (이메일 중복, 약한 비밀번호 등)
  - 성공 시 로그인 페이지로 리다이렉트

#### 2.4 프로필 설정 페이지 (학번 입력)

- **데이터 흐름**: 사용자 입력 → `profiles` 테이블 UPDATE → UI 반영
- **파일 경로**: `app/(dashboard)/profile/page.tsx`
- **기술 스택**: Next.js Client Component, Supabase Database SDK
- **구현 내용**:
  - `useAuth().user`에서 현재 사용자 정보 표시
  - `student_id` 입력 폼 생성
  - `supabase.from('profiles').update({ student_id }).eq('id', user.id)` 실행
  - `avatar_url` 업로드 기능 (Storage 연동, 2.5 참조)
  - 성공 시 토스트 메시지 표시 (`sonner` 사용)

#### 2.5 프로필 이미지 업로드 (Storage 연동)

- **데이터 흐름**: 파일 선택 → Supabase Storage 업로드 → URL 반환 → `profiles.avatar_url` UPDATE
- **파일 경로**: `lib/supabase/storage.ts` (유틸리티), `app/(dashboard)/profile/page.tsx` (UI)
- **기술 스택**: Supabase Storage SDK (`supabase.storage`)
- **구현 내용**:
  - `uploadAvatar(userId, file)` 함수 생성
  - `supabase.storage.from('avatars').upload()` 호출
  - 파일 경로: `avatars/{userId}/avatar.{ext}`
  - 업로드 성공 시 Public URL 생성: `supabase.storage.from('avatars').getPublicUrl()`
  - `profiles` 테이블의 `avatar_url` 업데이트
  - 이미지 미리보기 UI 추가
  - 파일 크기 제한 (2MB) 및 타입 검증 (JPEG, PNG, WebP)

---

### 3. 데이터베이스 스키마 적용

#### 3.1 Supabase SQL 스키마 실행

- **데이터 흐름**: SQL 파일 → Supabase Dashboard SQL Editor → 테이블 생성
- **파일 경로**: `supabase/schema.sql`
- **기술 스택**: PostgreSQL, Supabase Dashboard
- **구현 내용**:
  - Supabase Dashboard → SQL Editor 접속
  - `supabase/schema.sql` 전체 내용 복사하여 실행
  - 테이블 생성 확인: `profiles`, `programs`, `activities`, `magazine_assets`
  - RLS 정책 활성화 확인: 각 테이블의 `ENABLE ROW LEVEL SECURITY` 확인
  - 인덱스 생성 확인: `idx_activities_user_id`, `idx_activities_program_id` 등
  - 트리거 생성 확인: `update_updated_at_column` 함수 및 트리거

#### 3.2 초기 데이터 삽입 (선택사항)

- **데이터 흐름**: SQL 파일 → Supabase Dashboard → 샘플 프로그램 데이터 삽입
- **파일 경로**: `supabase/seed.sql`
- **기술 스택**: PostgreSQL, Supabase Dashboard
- **구현 내용**:
  - `supabase/seed.sql` 실행하여 테스트용 프로그램 데이터 삽입
  - `handle_new_user()` 트리거가 정상 작동하는지 확인 (회원가입 테스트)

#### 3.3 TypeScript 타입 생성 (선택사항)

- **데이터 흐름**: Supabase CLI → 타입 생성 → `types/database.ts` 업데이트
- **파일 경로**: `types/database.ts`
- **기술 스택**: Supabase CLI (`@supabase/cli`)
- **구현 내용**:
  - `npx supabase gen types typescript --project-id <project-id> > types/database.ts` 실행
  - 생성된 타입이 `Database` 인터페이스와 일치하는지 확인
  - 편의 타입 (`Profile`, `Activity`, `ActivityWithRelations` 등) 유지

---

### 4. Storage 버킷 설정

#### 4.1 Storage 버킷 생성

- **데이터 흐름**: Supabase Dashboard → Storage → 버킷 생성
- **파일 경로**: Supabase Dashboard (웹 UI)
- **기술 스택**: Supabase Storage
- **구현 내용**:
  - `activity-images` 버킷 생성 (Public, 10MB 제한, image/* MIME 타입)
  - `program-thumbnails` 버킷 생성 (Public, 5MB 제한, image/* MIME 타입)
  - `avatars` 버킷 생성 (Public, 2MB 제한, image/* MIME 타입)

#### 4.2 Storage RLS 정책 설정

- **데이터 흐름**: SQL 정책 → Supabase Dashboard SQL Editor → Storage 보안 적용
- **파일 경로**: `supabase/storage-setup.md` (가이드), Supabase Dashboard SQL Editor
- **기술 스택**: PostgreSQL RLS, Supabase Storage
- **구현 내용**:
  - `activity-images` 버킷: Public 읽기, 인증된 사용자 업로드, 본인/Admin 삭제
  - `program-thumbnails` 버킷: Public 읽기, Admin만 업로드/삭제
  - `avatars` 버킷: Public 읽기, 본인만 업로드/삭제
  - `storage-setup.md`의 SQL 정책을 Supabase Dashboard에서 실행

---

## Phase 2: Core Logic (핵심 로직 구현)

### 5. Volunteer Context 리팩토링 (Supabase 연동)

#### 5.1 실시간 통계 조회 (대시보드)

- **데이터 흐름**: Supabase Database → `volunteer-context.tsx` → `totalHours`, `totalVolunteers` 상태
- **파일 경로**: `lib/volunteer-context.tsx`
- **기술 스택**: Supabase Database SDK (`supabase.from().select()`), React Context API
- **구현 내용**:
  - `useEffect`에서 초기 통계 로드: `supabase.from('activities').select('hours, user_id').eq('status', 'approved')`
  - `totalHours`: `SUM(hours)` 계산 (또는 서버에서 집계)
  - `totalVolunteers`: `COUNT(DISTINCT user_id)` 계산
  - Realtime 구독 설정: `supabase.channel('activities').on('postgres_changes', ...)` (5.2 참조)
  - 기존 mock 데이터 (`initialActivities`, `initialPrograms`) 제거

#### 5.2 Realtime 구독 설정 (실시간 업데이트)

- **데이터 흐름**: Supabase Realtime → `volunteer-context.tsx` → 상태 업데이트 → UI 리렌더링
- **파일 경로**: `lib/volunteer-context.tsx`
- **기술 스택**: Supabase Realtime SDK (`supabase.channel().on()`)
- **구현 내용**:
  - `supabase.channel('activities-channel')` 생성
  - `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities', filter: 'status=eq.approved' })` 구독
  - INSERT 이벤트 발생 시 `totalHours`, `totalVolunteers` 재계산
  - `activities` 배열에 새 항목 추가
  - `useEffect` cleanup에서 `.unsubscribe()` 호출

#### 5.3 활동 목록 조회 (갤러리)

- **데이터 흐름**: Supabase Database → JOIN 쿼리 → `activities` 상태 배열
- **파일 경로**: `lib/volunteer-context.tsx`
- **기술 스택**: Supabase Database SDK (JOIN 쿼리)
- **구현 내용**:
  - `fetchActivities(limit?)` 함수 생성
  - `supabase.from('activities').select('*, profile:profiles(name, avatar_url), program:programs(title, thumbnail_url)').eq('status', 'approved').order('created_at', { ascending: false }).limit(limit)` 실행
  - 반환된 데이터를 `Activity` 인터페이스 형식으로 변환 (`volunteerName`, `programName` 매핑)
  - `activities` 상태 업데이트
  - Realtime 구독에서도 동일한 형식으로 변환하여 추가

#### 5.4 프로그램 목록 조회

- **데이터 흐름**: Supabase Database → `programs` 테이블 → `programs` 상태 배열
- **파일 경로**: `lib/volunteer-context.tsx`
- **기술 스택**: Supabase Database SDK
- **구현 내용**:
  - `fetchPrograms()` 함수 생성
  - `supabase.from('programs').select('*').eq('is_active', true).order('created_at', { ascending: false })` 실행
  - 각 프로그램의 `active_volunteers` 계산: `supabase.from('activities').select('user_id', { count: 'exact', head: true }).eq('program_id', program.id).eq('status', 'approved')` (별도 쿼리 또는 JOIN)
  - `Program` 인터페이스 형식으로 변환 (`name` → `title` 매핑)
  - `programs` 상태 업데이트

#### 5.5 활동 추가 함수 (`addActivity`)

- **데이터 흐름**: 사용자 입력 → Storage 업로드 → Database INSERT → Realtime 이벤트 발생
- **파일 경로**: `lib/volunteer-context.tsx`
- **기술 스택**: Supabase Storage SDK, Database SDK
- **구현 내용**:
  - 함수 시그니처 변경: `addActivity(programId, hours, content, imageFile)` (이미지 파일 포함)
  - Storage 업로드: `supabase.storage.from('activity-images').upload()` (경로: `{userId}/{activityId}/{timestamp}-{filename}`)
  - Public URL 생성: `getPublicUrl()`
  - Database INSERT: `supabase.from('activities').insert({ user_id, program_id, hours, content, image_url, status: 'approved' })`
  - 에러 핸들링 (Storage 실패, DB 실패 시 롤백)
  - 성공 시 로컬 상태 업데이트 (Realtime이 자동으로 처리하지만 즉시 피드백을 위해)

---

### 6. 활동 인증 페이지 (Activity Logging)

#### 6.1 활동 인증 폼 컴포넌트

- **데이터 흐름**: 사용자 입력 → 폼 검증 → `useVolunteer().addActivity()` 호출
- **파일 경로**: `app/(dashboard)/log/page.tsx` 또는 `components/activity-form.tsx`
- **기술 스택**: Next.js Client Component, React Hook Form (선택사항), `react-dropzone` (이미지 업로드)
- **구현 내용**:
  - 프로그램 선택 드롭다운: `useVolunteer().programs`에서 활성 프로그램 목록 표시
  - 봉사 시간 입력: 숫자 입력 (0.5 단위, 최대 24시간)
  - 이미지 업로드: 드래그 앤 드롭 또는 파일 선택 (`<input type="file">` 또는 `react-dropzone`)
  - 이미지 미리보기 UI
  - 소감 입력: `<Textarea>` 컴포넌트 사용
  - 폼 검증: 필수 필드 확인, 이미지 크기/타입 검증
  - 제출 버튼: 로딩 상태 표시

#### 6.2 활동 제출 로직

- **데이터 흐름**: 폼 제출 → `addActivity()` 호출 → Storage 업로드 → DB INSERT → 성공/실패 피드백
- **파일 경로**: `app/(dashboard)/log/page.tsx`
- **기술 스택**: `useVolunteer()` 훅, Supabase SDK
- **구현 내용**:
  - `handleSubmit` 함수에서 `useVolunteer().addActivity()` 호출
  - 성공 시 토스트 메시지 표시 및 폼 초기화
  - 실패 시 에러 메시지 표시 (Storage 오류, DB 오류 구분)
  - 제출 후 `/dashboard` 또는 `/gallery`로 리다이렉트 (선택사항)

---

### 7. 갤러리 페이지 (Shared Gallery)

#### 7.1 갤러리 목록 조회

- **데이터 흐름**: Supabase Database → JOIN 쿼리 → 카드 리스트 렌더링
- **파일 경로**: `app/(dashboard)/gallery/page.tsx`
- **기술 스택**: Next.js Client Component, Supabase Database SDK
- **구현 내용**:
  - `useVolunteer().activities` 사용하여 활동 목록 표시
  - 또는 페이지 레벨에서 `supabase.from('activities').select(...)` 직접 호출 (무한 스크롤용)
  - `RecentActivities` 컴포넌트 재사용 또는 새로운 갤러리 레이아웃 생성
  - 카드 UI: 이미지, 봉사자 이름, 프로그램명, 시간, 소감, 날짜 표시

#### 7.2 무한 스크롤 (선택사항)

- **데이터 흐름**: 스크롤 이벤트 → 추가 데이터 로드 → `activities` 배열에 추가
- **파일 경로**: `app/(dashboard)/gallery/page.tsx`
- **기술 스택**: `react-intersection-observer` 또는 `useEffect` + 스크롤 이벤트
- **구현 내용**:
  - `useState`로 페이지네이션 상태 관리 (`page`, `hasMore`)
  - `fetchMoreActivities(page)` 함수 생성
  - 스크롤 감지: `useIntersectionObserver` 훅 사용
  - 추가 데이터 로드: `supabase.from('activities').select(...).range(page * limit, (page + 1) * limit - 1)`
  - 로딩 상태 표시 (Skeleton 컴포넌트)

#### 7.3 실시간 갤러리 업데이트

- **데이터 흐름**: Supabase Realtime → 새 활동 INSERT → 갤러리 맨 위에 추가
- **파일 경로**: `app/(dashboard)/gallery/page.tsx`
- **기술 스택**: Supabase Realtime SDK (이미 `volunteer-context.tsx`에서 구독 중)
- **구현 내용**:
  - `useVolunteer().activities`가 Realtime으로 자동 업데이트되는지 확인
  - 새 활동이 추가되면 맨 위에 표시 (이미 `volunteer-context.tsx`에서 처리됨)
  - 애니메이션 효과 (Framer Motion `AnimatePresence` 사용, 선택사항)

---

### 8. 프로그램 페이지

#### 8.1 프로그램 목록 표시

- **데이터 흐름**: Supabase Database → `programs` 테이블 → 카드 그리드 렌더링
- **파일 경로**: `app/(dashboard)/programs/page.tsx`
- **기술 스택**: Next.js Client Component, Supabase Database SDK
- **구현 내용**:
  - `useVolunteer().programs` 사용하여 프로그램 목록 표시
  - 카드 UI: 썸네일, 제목, 설명, 활성 봉사자 수 표시
  - 그리드 레이아웃: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

#### 8.2 프로그램 상세 페이지 (선택사항)

- **데이터 흐름**: 프로그램 ID → Supabase Database → 상세 정보 + 관련 활동 목록
- **파일 경로**: `app/(dashboard)/programs/[id]/page.tsx`
- **기술 스택**: Next.js Dynamic Route, Supabase Database SDK
- **구현 내용**:
  - `params.id`로 프로그램 ID 받기
  - `supabase.from('programs').select('*').eq('id', id).single()` 실행
  - 관련 활동 목록: `supabase.from('activities').select('*, profile:profiles(name)').eq('program_id', id).eq('status', 'approved')`
  - 프로그램 통계 표시: 총 봉사 시간, 참여 인원 수

---

### 9. 메인 대시보드 페이지

#### 9.1 실시간 통계 카운터

- **데이터 흐름**: `useVolunteer().totalHours`, `totalVolunteers` → `ImpactCounter` 컴포넌트 → Framer Motion 애니메이션
- **파일 경로**: `app/page.tsx`, `components/impact-counter.tsx`
- **기술 스택**: Framer Motion (`framer-motion`), React Context
- **구현 내용**:
  - `ImpactCounter` 컴포넌트가 `value` prop을 받아서 카운트업 애니메이션 표시
  - `useMotionValue`, `useSpring` 사용하여 숫자 증가 애니메이션 구현
  - Realtime 업데이트 시 부드러운 전환 효과
  - `LiveSyncBadge` 컴포넌트로 실시간 동기화 상태 표시

#### 9.2 최근 활동 섹션

- **데이터 흐름**: `useVolunteer().activities` → `RecentActivitiesSection` → 카드 리스트
- **파일 경로**: `app/page.tsx`, `components/posts/RecentActivitiesSection.tsx`
- **기술 스택**: React Context, 기존 컴포넌트 재사용
- **구현 내용**:
  - `RecentActivitiesSection`이 `useVolunteer().activities`를 사용하도록 확인
  - `limit={3}` prop으로 최근 3개만 표시
  - "더보기" 버튼 클릭 시 `/gallery`로 이동

#### 9.3 캘린더 컴포넌트 (이번 달 봉사 일정)

- **데이터 흐름**: Supabase Database → `activities` 테이블 → 날짜별 그룹화 → 캘린더 렌더링
- **파일 경로**: `components/calendar.tsx` (신규 생성)
- **기술 스택**: `react-calendar` 또는 `@radix-ui/react-calendar` (Shadcn UI)
- **구현 내용**:
  - 이번 달의 활동 내역 조회: `supabase.from('activities').select('*, program:programs(title)').eq('status', 'approved').gte('created_at', startOfMonth).lte('created_at', endOfMonth)`
  - 날짜별로 그룹화하여 캘린더에 표시
  - 날짜 클릭 시 해당 날짜의 활동 목록 모달 표시 (선택사항)
  - 현재 진행 중인 프로그램 목록 표시 (캘린더 옆 또는 아래)

#### 9.4 진행 중인 프로그램 표시

- **데이터 흐름**: Supabase Database → `programs` 테이블 (is_active=true) → 카드 리스트
- **파일 경로**: `app/page.tsx` 또는 `components/programs-section.tsx`
- **기술 스택**: Next.js Client Component, Supabase Database SDK
- **구현 내용**:
  - `useVolunteer().programs` 사용하여 활성 프로그램 목록 표시
  - 간단한 카드 UI: 프로그램명, 설명, 썸네일
  - "인증하기" 버튼 클릭 시 `/log` 페이지로 이동 (프로그램 ID 전달, 선택사항)

---

## Phase 3: Interaction & Feedback (상호작용 및 피드백)

### 10. 에러 핸들링 및 로딩 상태

#### 10.1 전역 에러 바운더리

- **데이터 흐름**: 에러 발생 → Error Boundary → 에러 UI 표시
- **파일 경로**: `app/error.tsx`, `app/global-error.tsx`
- **기술 스택**: Next.js Error Boundary
- **구현 내용**:
  - `app/error.tsx` 생성하여 클라이언트 에러 처리
  - `app/global-error.tsx` 생성하여 루트 레벨 에러 처리
  - 에러 메시지 표시 및 "다시 시도" 버튼

#### 10.2 로딩 상태 관리

- **데이터 흐름**: 데이터 로딩 → 로딩 상태 → Skeleton UI 표시
- **파일 경로**: 각 페이지 컴포넌트, `components/ui/skeleton.tsx`
- **기술 스택**: React `useState`, Skeleton 컴포넌트
- **구현 내용**:
  - 각 페이지에서 `isLoading` 상태 관리
  - 로딩 중일 때 `ActivityCardSkeleton` 컴포넌트 표시
  - `ImpactCounter`에서 초기값 0부터 시작하여 로딩 완료 후 애니메이션

#### 10.3 토스트 알림 시스템

- **데이터 흐름**: 액션 완료/실패 → `sonner` 토스트 → 사용자 피드백
- **파일 경로**: `app/layout.tsx` (Toaster 컴포넌트), 각 액션 컴포넌트
- **기술 스택**: `sonner` (이미 설치됨)
- **구현 내용**:
  - `app/layout.tsx`에 `<Toaster />` 컴포넌트 확인 (이미 있음)
  - 활동 추가 성공 시: `toast.success('활동이 등록되었습니다!')`
  - 활동 추가 실패 시: `toast.error('등록에 실패했습니다. 다시 시도해주세요.')`
  - 프로필 업데이트 성공/실패 토스트

---

### 11. 성능 최적화

#### 11.1 데이터 페칭 최적화

- **데이터 흐름**: 초기 로드 → 필요한 데이터만 선택적 로드 → 캐싱
- **파일 경로**: `lib/volunteer-context.tsx`, 각 페이지 컴포넌트
- **기술 스택**: React `useMemo`, `useCallback`, Supabase 쿼리 최적화
- **구현 내용**:
  - `useMemo`로 통계 계산 결과 메모이제이션
  - `useCallback`으로 함수 메모이제이션
  - Supabase 쿼리에서 필요한 컬럼만 `select()` (예: `select('id, name, avatar_url')`)
  - 페이지네이션으로 대량 데이터 분할 로드

#### 11.2 이미지 최적화

- **데이터 흐름**: Supabase Storage → Next.js Image 컴포넌트 → 최적화된 이미지 렌더링
- **파일 경로**: 각 이미지 표시 컴포넌트
- **기술 스택**: Next.js `Image` 컴포넌트, Supabase Storage Public URL
- **구현 내용**:
  - `<img>` 태그를 `<Image>` 컴포넌트로 교체
  - `next.config.mjs`에 Supabase Storage 도메인을 `images.remotePatterns`에 추가
  - `width`, `height`, `alt` 속성 필수 지정
  - `loading="lazy"` 속성으로 지연 로딩

#### 11.3 Realtime 구독 최적화

- **데이터 흐름**: Realtime 이벤트 → 디바운싱/쓰로틀링 → 상태 업데이트
- **파일 경로**: `lib/volunteer-context.tsx`
- **기술 스택**: `lodash.debounce` 또는 커스텀 디바운스 함수
- **구현 내용**:
  - 여러 INSERT 이벤트가 빠르게 발생할 때 디바운싱 적용 (선택사항)
  - 불필요한 리렌더링 방지: `useMemo`로 필터링된 데이터 메모이제이션

---

### 12. 반응형 UI 및 접근성

#### 12.1 모바일 반응형 레이아웃

- **데이터 흐름**: 화면 크기 감지 → 레이아웃 변경 → 모바일 최적화 UI
- **파일 경로**: 모든 페이지 컴포넌트
- **기술 스택**: Tailwind CSS 반응형 클래스 (`sm:`, `md:`, `lg:`)
- **구현 내용**:
  - 모든 페이지에서 모바일 우선 디자인 적용
  - 사이드바는 모바일에서 Sheet 컴포넌트로 변환 (이미 `app-sidebar.tsx`에 구현됨)
  - 갤러리 그리드: 모바일 1열, 태블릿 2열, 데스크톱 3열
  - 폼 입력 필드 모바일 최적화 (키보드 타입 지정)

#### 12.2 접근성 개선

- **데이터 흐름**: 시맨틱 HTML → ARIA 속성 → 키보드 네비게이션
- **파일 경로**: 모든 컴포넌트
- **기술 스택**: HTML 시맨틱 태그, ARIA 속성
- **구현 내용**:
  - 모든 버튼에 `aria-label` 추가 (아이콘만 있는 경우)
  - 폼 입력에 `aria-describedby`로 에러 메시지 연결
  - 키보드 네비게이션 지원 (Tab, Enter, Escape)
  - 포커스 표시 스타일 명확히 (`focus-visible:ring`)

---

## Phase 4: Phase 2 기능 (선택사항, 향후 구현)

### 13. Admin 승인 시스템 (Phase 2)

#### 13.1 Admin 대시보드 페이지

- **데이터 흐름**: Admin 권한 확인 → 대기 중인 활동 목록 → 승인/반려 액션
- **파일 경로**: `app/(dashboard)/admin/page.tsx` (신규 생성)
- **기술 스택**: Next.js Client Component, Supabase Database SDK, RLS 정책
- **구현 내용**:
  - `useAuth().user.role === 'admin'` 확인하여 접근 제어
  - `supabase.from('activities').select('*, profile:profiles(name), program:programs(title)').eq('status', 'pending')` 조회
  - 승인 버튼: `supabase.from('activities').update({ status: 'approved' }).eq('id', activityId)`
  - 반려 버튼: `supabase.from('activities').update({ status: 'rejected' }).eq('id', activityId)`
  - Realtime 구독으로 실시간 업데이트

#### 13.2 활동 상태 변경 로직

- **데이터 흐름**: Admin 액션 → Database UPDATE → Realtime 이벤트 → UI 업데이트
- **파일 경로**: `lib/admin-actions.ts` (신규 생성)
- **기술 스택**: Supabase Database SDK, Server Actions (선택사항)
- **구현 내용**:
  - `approveActivity(activityId)` 함수 생성
  - `rejectActivity(activityId)` 함수 생성
  - RLS 정책 확인: Admin만 `status` 변경 가능
  - 에러 핸들링 및 토스트 알림

---

### 14. 필터링 시스템 (Phase 2)

#### 14.1 프로그램별 필터

- **데이터 흐름**: 필터 선택 → Supabase 쿼리 필터 → 필터링된 활동 목록
- **파일 경로**: `app/(dashboard)/gallery/page.tsx`
- **기술 스택**: Supabase Database SDK (`.eq('program_id', id)`)
- **구현 내용**:
  - 프로그램 선택 드롭다운 추가
  - 선택된 프로그램 ID로 쿼리 필터링
  - URL 쿼리 파라미터로 상태 관리 (`?program=xxx`)

#### 14.2 월별 필터

- **데이터 흐름**: 월 선택 → 날짜 범위 계산 → Supabase 쿼리 필터
- **파일 경로**: `app/(dashboard)/gallery/page.tsx`
- **기술 스택**: Supabase Database SDK (`.gte('created_at', startDate).lte('created_at', endDate)`)
- **구현 내용**:
  - 월 선택 드롭다운 추가
  - 선택된 월의 시작일/종료일 계산
  - 쿼리에 날짜 범위 필터 적용

---

## 📊 구현 우선순위 요약

### 🔴 최우선 (MVP 필수)

1. **Phase 1.1-1.3**: Supabase 클라이언트 설정 및 환경 구성
2. **Phase 1.2**: 인증 시스템 (Auth Context 리팩토링, 로그인/회원가입 연동)
3. **Phase 1.3**: 데이터베이스 스키마 적용
4. **Phase 1.4**: Storage 버킷 설정
5. **Phase 2.5**: Volunteer Context 리팩토링 (실시간 통계, 활동 목록)
6. **Phase 2.6**: 활동 인증 페이지 (Activity Logging)
7. **Phase 2.7**: 갤러리 페이지 (Shared Gallery)
8. **Phase 2.9**: 메인 대시보드 페이지 (실시간 통계, 최근 활동)

### 🟡 중요 (UX 개선)

1. **Phase 2.9.3**: 캘린더 컴포넌트 (이번 달 봉사 일정)
2. **Phase 2.9.4**: 진행 중인 프로그램 표시
3. **Phase 3.10**: 에러 핸들링 및 로딩 상태
4. **Phase 3.11**: 성능 최적화 (이미지 최적화, 데이터 페칭)
5. **Phase 3.12**: 반응형 UI 및 접근성

### 🟢 선택사항 (Phase 2 기능)

1. **Phase 2.8**: 프로그램 상세 페이지
2. **Phase 2.7.2**: 무한 스크롤
3. **Phase 4.13**: Admin 승인 시스템
4. **Phase 4.14**: 필터링 시스템

---

## 🛠️ 기술 스택 요약

### 프론트엔드

- **Framework**: Next.js 14+ (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 4.x
- **UI 컴포넌트**: Shadcn UI (Radix UI 기반)
- **아이콘**: Lucide React
- **애니메이션**: Framer Motion
- **폼 관리**: React Hook Form (선택사항)
- **토스트**: Sonner

### 백엔드/인프라

- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **배포**: Vercel (예정)

### 주요 라이브러리

- `@supabase/supabase-js`: Supabase 클라이언트 SDK
- `@supabase/ssr`: Supabase 서버 사이드 렌더링 지원
- `framer-motion`: 애니메이션 라이브러리
- `react-calendar` 또는 `@radix-ui/react-calendar`: 캘린더 컴포넌트 (선택사항)
- `react-dropzone`: 파일 업로드 (선택사항)
- `react-intersection-observer`: 무한 스크롤 (선택사항)

---

## 📝 체크리스트 사용 가이드

1. **순차적 진행**: Phase 1 → Phase 2 → Phase 3 순서로 진행하세요.
2. **체크박스 활용**: 각 태스크 완료 시 `[x]`로 체크하여 진행 상황을 추적하세요.
3. **데이터 흐름 확인**: 각 태스크의 "데이터 흐름"을 이해하고 구현하세요.
4. **에러 처리**: 각 단계에서 에러 핸들링을 포함하여 구현하세요.
5. **테스트**: 각 Phase 완료 후 기능 테스트를 수행하세요.

---

**작성일**: 2026-02-04  
**최종 업데이트**: 2026-02-04