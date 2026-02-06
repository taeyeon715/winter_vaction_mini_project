# Supabase 데이터베이스 스키마 설계 문서

## 📊 코드 분석 결과

### 1. 실제 UI에서 사용되는 데이터 필드

#### **Activity (활동 내역)**
- `id`: 고유 식별자
- `volunteerName`: 봉사자 이름 (user.name에서 가져옴)
- `programName`: 프로그램 이름 (program.name에서 가져옴)
- `hours`: 봉사 시간 (number, 0.5 단위)
- `caption`: 활동 소감/내용
- `imageUrl`: 이미지 URL (Supabase Storage 경로)
- `createdAt`: 생성 일시 (시간 표시용)

#### **Program (프로그램)**
- `id`: 고유 식별자
- `name`: 프로그램 이름
- `description`: 프로그램 설명
- `thumbnail`: 썸네일 이미지 URL
- `activeVolunteers`: 활성 봉사자 수 (계산값, 실제 DB에는 저장 안 함)

#### **User (사용자)**
- `id`: 고유 식별자
- `name`: 이름
- `email`: 이메일
- `avatar`: 프로필 이미지 URL (선택)

### 2. PRD 요구사항과의 병합

#### **PRD에 명시된 필드**
- `profiles.role`: admin/user 구분
- `profiles.student_id`: 학번 (프로필 설정 시 필요)
- `programs.is_active`: 프로그램 활성 상태
- `activities.status`: 승인 상태 (기본값 'approved')

#### **코드에서 사용하지만 PRD에 없는 필드**
- `profiles.avatar_url`: 프로필 이미지
- `activities.created_at`: 정렬 및 시간 표시용

## 🗄️ 최종 스키마 설계

### 테이블 구조

#### 1. **profiles** 테이블
```sql
- id (UUID, PK) → Supabase Auth의 auth.users.id와 연결
- email (TEXT, UNIQUE, NOT NULL)
- name (TEXT, NOT NULL)
- role (TEXT, DEFAULT 'user', CHECK: 'admin' | 'user')
- student_id (TEXT, NULLABLE) → PRD 요구사항
- avatar_url (TEXT, NULLABLE) → 코드에서 사용
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

#### 2. **programs** 테이블
```sql
- id (UUID, PK)
- title (TEXT, NOT NULL) → UI에서는 'name'으로 표시
- description (TEXT, NULLABLE)
- thumbnail_url (TEXT, NULLABLE)
- is_active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

#### 3. **activities** 테이블
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles.id, NOT NULL)
- program_id (UUID, FK → programs.id, NOT NULL)
- hours (NUMERIC(4,1), NOT NULL) → 0.5 단위 지원
- image_url (TEXT, NULLABLE) → Supabase Storage 경로
- content (TEXT, NOT NULL) → UI에서는 'caption'으로 표시
- status (TEXT, DEFAULT 'approved', CHECK: 'pending' | 'approved' | 'rejected')
- created_at (TIMESTAMPTZ, DEFAULT NOW())
- updated_at (TIMESTAMPTZ, DEFAULT NOW())
```

#### 4. **magazine_assets** 테이블 (Phase 2용, 설계만)
```sql
- id (UUID, PK)
- activity_id (UUID, FK → activities.id, NOT NULL)
- is_starred (BOOLEAN, DEFAULT false)
- created_at (TIMESTAMPTZ, DEFAULT NOW())
```

## 🔒 RLS (Row Level Security) 정책

### profiles 테이블
- **SELECT**: 모든 사용자가 자신의 프로필과 다른 사용자의 기본 정보(name, avatar) 조회 가능
- **INSERT**: 인증된 사용자만 자신의 프로필 생성 가능
- **UPDATE**: 본인만 자신의 프로필 수정 가능, admin은 모든 프로필 수정 가능
- **DELETE**: admin만 삭제 가능

### programs 테이블
- **SELECT**: 모든 사용자가 활성 프로그램 조회 가능
- **INSERT**: admin만 생성 가능
- **UPDATE**: admin만 수정 가능
- **DELETE**: admin만 삭제 가능

### activities 테이블
- **SELECT**: 모든 사용자가 승인된 활동 조회 가능, 본인은 자신의 모든 활동 조회 가능
- **INSERT**: 인증된 사용자만 생성 가능, status는 자동으로 'approved'로 설정
- **UPDATE**: 본인만 자신의 활동 수정 가능 (status는 admin만 변경 가능)
- **DELETE**: 본인과 admin만 삭제 가능

## 📝 인덱스 설계
- `activities.user_id` (FK 인덱스)
- `activities.program_id` (FK 인덱스)
- `activities.created_at` (정렬용)
- `activities.status` (필터링용)
- `programs.is_active` (필터링용)

## 🔄 실시간(Realtime) 구독
- `activities` 테이블의 INSERT 이벤트를 구독하여 대시보드 실시간 업데이트
