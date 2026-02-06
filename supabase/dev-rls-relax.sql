-- ============================================
-- 개발 환경용 RLS 정책 완화 스크립트
-- ============================================
-- 주의: 이 스크립트는 개발 환경에서만 사용하세요.
-- 프로덕션 환경에서는 보안을 위해 원래 RLS 정책을 유지해야 합니다.

-- ============================================
-- PROGRAMS 테이블 RLS 정책 완화
-- ============================================

-- 기존 INSERT 정책 삭제
DROP POLICY IF EXISTS "Admins can create programs" ON programs;

-- 개발용: 모든 인증된 사용자가 프로그램 생성 가능
CREATE POLICY "Dev: Authenticated users can create programs"
  ON programs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 기존 UPDATE 정책 삭제
DROP POLICY IF EXISTS "Admins can update programs" ON programs;

-- 개발용: 모든 인증된 사용자가 프로그램 수정 가능
CREATE POLICY "Dev: Authenticated users can update programs"
  ON programs FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 기존 DELETE 정책 삭제
DROP POLICY IF EXISTS "Admins can delete programs" ON programs;

-- 개발용: 모든 인증된 사용자가 프로그램 삭제 가능
CREATE POLICY "Dev: Authenticated users can delete programs"
  ON programs FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 프로덕션 환경으로 복원하려면:
-- ============================================
-- 1. 위의 개발용 정책들을 DROP하고
-- 2. supabase/schema.sql의 원래 RLS 정책을 다시 실행하세요.
