-- ============================================
-- 특정 사용자를 Admin으로 설정하는 스크립트
-- ============================================
-- 사용법: 아래 이메일 주소를 실제 사용자 이메일로 변경한 후 실행하세요.

-- 예시: 이메일 주소로 사용자 찾아서 admin으로 설정
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- 확인: admin으로 설정된 사용자 확인
SELECT id, email, name, role 
FROM profiles 
WHERE role = 'admin';

-- ============================================
-- 또는 사용자 ID로 직접 설정
-- ============================================
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'user-uuid-here';
