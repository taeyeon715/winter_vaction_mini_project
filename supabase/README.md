# Supabase 설정 가이드

## 📋 설정 순서

### 1. 데이터베이스 스키마 생성
1. Supabase Dashboard → SQL Editor로 이동
2. `schema.sql` 파일의 전체 내용을 복사하여 실행
3. 실행 결과 확인 (에러가 없어야 함)

### 2. 초기 데이터 삽입 (선택사항)
1. `seed.sql` 파일을 실행하여 테스트용 프로그램 데이터 삽입
2. 주의: 개발 환경에서만 사용하세요

### 3. Storage 버킷 생성 및 설정
1. Supabase Dashboard → Storage로 이동
2. `storage-setup.md` 파일의 가이드에 따라 버킷 생성
3. RLS 정책 설정

### 4. 개발 환경용 RLS 정책 완화 (선택사항)
**주의**: 개발 단계에서 프로그램 생성 기능을 테스트하려면 이 단계를 실행하세요.

1. Supabase Dashboard → SQL Editor로 이동
2. `dev-rls-relax.sql` 파일의 내용을 실행
3. 이 스크립트는 모든 인증된 사용자가 프로그램을 생성/수정/삭제할 수 있도록 RLS 정책을 완화합니다
4. **프로덕션 환경에서는 이 스크립트를 사용하지 마세요!**

**대안**: 특정 사용자를 admin으로 설정하려면:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 5. 환경 변수 설정
`.env.local` 파일에 다음 변수들을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. 타입 생성 (선택사항)
Supabase CLI를 사용하여 최신 타입을 생성할 수 있습니다:

```bash
npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
```

## 🔍 스키마 확인

스키마가 제대로 생성되었는지 확인하려면:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- RLS 정책 확인
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📚 파일 설명

- **schema.sql**: 데이터베이스 테이블, 인덱스, RLS 정책 생성
- **seed.sql**: 초기 테스트 데이터 삽입 (프로그램 샘플 데이터)
- **queries-examples.sql**: 자주 사용하는 쿼리 예제 모음
- **storage-setup.md**: Storage 버킷 생성 및 RLS 정책 설정 가이드
- **dev-rls-relax.sql**: 개발 환경용 RLS 정책 완화 스크립트 (프로그램 생성 권한 완화)
- **make-admin.sql**: 특정 사용자를 admin으로 설정하는 스크립트 예제

## 📝 주요 테이블 구조

### profiles
- 사용자 프로필 정보
- Supabase Auth의 `auth.users`와 1:1 관계

### programs
- 봉사 프로그램 정보
- Admin만 생성/수정 가능

### activities
- 봉사 활동 내역
- 모든 사용자가 조회 가능 (승인된 것만)
- 본인만 생성/수정 가능

### magazine_assets
- 잡지용 베스트 샷 관리 (Phase 2)
- Admin만 관리 가능

## 🔒 보안 정책 요약

- **profiles**: 본인만 수정 가능, 모든 사용자 조회 가능
- **programs**: Admin만 관리 가능, 모든 사용자 조회 가능
- **activities**: 본인만 생성/수정 가능, 승인된 활동은 모든 사용자 조회 가능
- **Storage**: Public 읽기, 인증된 사용자만 업로드, 본인/Admin만 삭제
