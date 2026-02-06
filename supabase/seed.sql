-- ============================================
-- 초기 데이터 삽입 (테스트용)
-- ============================================
-- 주의: 이 스크립트는 개발 환경에서만 사용하세요.
-- 프로덕션 환경에서는 실제 데이터로 교체하세요.

-- ============================================
-- 테스트용 프로그램 데이터 삽입
-- ============================================
INSERT INTO programs (id, title, description, thumbnail_url, is_active) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Community Garden',
    'Help maintain and grow fresh produce for local food banks.',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Youth Mentorship',
    'Guide and inspire the next generation through one-on-one mentoring.',
    'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=300&fit=crop',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Senior Care',
    'Provide companionship and assistance to elderly community members.',
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Beach Cleanup',
    'Protect our coastlines by removing litter and debris from local beaches.',
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&h=300&fit=crop',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Food Distribution',
    'Sort and distribute food packages to families in need.',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440006',
    'Animal Shelter Support',
    'Care for shelter animals and assist with adoption events.',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 참고: profiles와 activities는 Supabase Auth를 통해 생성되어야 합니다.
-- 실제 사용자 등록 후 프로필이 자동으로 생성되도록 트리거를 설정하세요.
-- ============================================

-- ============================================
-- 프로필 자동 생성 트리거 (Supabase Auth 사용자 생성 시)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '사용자'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성 (이미 존재하면 무시)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
