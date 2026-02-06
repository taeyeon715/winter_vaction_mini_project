-- ============================================
-- V-Hub Volunteer Impact System
-- Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES 테이블 (사용자 프로필)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  student_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. PROGRAMS 테이블 (봉사 프로그램)
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. ACTIVITIES 테이블 (활동 내역)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
  hours NUMERIC(4,1) NOT NULL CHECK (hours > 0 AND hours <= 24),
  image_url TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. MAGAZINE_ASSETS 테이블 (Phase 2용)
-- ============================================
CREATE TABLE IF NOT EXISTS magazine_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_program_id ON activities(program_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_programs_is_active ON programs(is_active);
CREATE INDEX IF NOT EXISTS idx_magazine_assets_activity_id ON magazine_assets(activity_id);

-- ============================================
-- 업데이트 시간 자동 갱신 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 설정
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) 활성화
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazine_assets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES 테이블 RLS 정책
-- ============================================

-- SELECT: 모든 사용자가 자신의 프로필과 다른 사용자의 기본 정보 조회 가능
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view other users' public info"
  ON profiles FOR SELECT
  USING (true);

-- INSERT: 인증된 사용자만 자신의 프로필 생성 가능
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: 본인만 자신의 프로필 수정 가능, admin은 모든 프로필 수정 가능
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: admin만 삭제 가능
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PROGRAMS 테이블 RLS 정책
-- ============================================

-- SELECT: 모든 사용자가 활성 프로그램 조회 가능
CREATE POLICY "Anyone can view active programs"
  ON programs FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- INSERT: admin만 생성 가능
CREATE POLICY "Admins can create programs"
  ON programs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- UPDATE: admin만 수정 가능
CREATE POLICY "Admins can update programs"
  ON programs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: admin만 삭제 가능
CREATE POLICY "Admins can delete programs"
  ON programs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ACTIVITIES 테이블 RLS 정책
-- ============================================

-- SELECT: 모든 사용자가 승인된 활동 조회 가능, 본인은 자신의 모든 활동 조회 가능
CREATE POLICY "Anyone can view approved activities"
  ON activities FOR SELECT
  USING (
    status = 'approved' OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT: 인증된 사용자만 생성 가능, status는 자동으로 'approved'로 설정
CREATE POLICY "Authenticated users can create activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 본인만 자신의 활동 수정 가능 (status는 admin만 변경 가능)
CREATE POLICY "Users can update their own activities"
  ON activities FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    (
      OLD.status = NEW.status OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Admins can update any activity status"
  ON activities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: 본인과 admin만 삭제 가능
CREATE POLICY "Users can delete their own activities"
  ON activities FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- MAGAZINE_ASSETS 테이블 RLS 정책
-- ============================================

-- SELECT: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view magazine assets"
  ON magazine_assets FOR SELECT
  USING (true);

-- INSERT: admin만 생성 가능
CREATE POLICY "Admins can create magazine assets"
  ON magazine_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- UPDATE: admin만 수정 가능
CREATE POLICY "Admins can update magazine assets"
  ON magazine_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: admin만 삭제 가능
CREATE POLICY "Admins can delete magazine assets"
  ON magazine_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 실시간 통계를 위한 뷰 (선택사항)
-- ============================================
CREATE OR REPLACE VIEW activity_stats AS
SELECT
  COUNT(DISTINCT user_id) as total_volunteers,
  COALESCE(SUM(hours), 0) as total_hours,
  COUNT(*) as total_activities
FROM activities
WHERE status = 'approved';

-- ============================================
-- 완료 메시지
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables: profiles, programs, activities, magazine_assets';
  RAISE NOTICE 'RLS policies enabled for all tables';
END $$;
