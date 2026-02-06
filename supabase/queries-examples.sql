-- ============================================
-- 자주 사용하는 쿼리 예제
-- ============================================

-- ============================================
-- 1. 대시보드 통계 조회
-- ============================================
-- 누적 봉사 시간과 전체 봉사자 수
SELECT 
  COUNT(DISTINCT user_id) as total_volunteers,
  COALESCE(SUM(hours), 0) as total_hours,
  COUNT(*) as total_activities
FROM activities
WHERE status = 'approved';

-- ============================================
-- 2. 최근 활동 목록 조회 (갤러리용)
-- ============================================
SELECT 
  a.id,
  a.hours,
  a.image_url,
  a.content,
  a.created_at,
  p.name as volunteer_name,
  p.avatar_url as volunteer_avatar,
  pr.title as program_name,
  pr.thumbnail_url as program_thumbnail
FROM activities a
JOIN profiles p ON a.user_id = p.id
JOIN programs pr ON a.program_id = pr.id
WHERE a.status = 'approved'
ORDER BY a.created_at DESC
LIMIT 20;

-- ============================================
-- 3. 사용자별 활동 통계
-- ============================================
SELECT 
  p.id,
  p.name,
  p.email,
  COUNT(a.id) as activity_count,
  COALESCE(SUM(a.hours), 0) as total_hours
FROM profiles p
LEFT JOIN activities a ON p.id = a.user_id AND a.status = 'approved'
GROUP BY p.id, p.name, p.email
ORDER BY total_hours DESC;

-- ============================================
-- 4. 프로그램별 활동 통계
-- ============================================
SELECT 
  pr.id,
  pr.title,
  pr.description,
  COUNT(DISTINCT a.user_id) as active_volunteers,
  COUNT(a.id) as total_activities,
  COALESCE(SUM(a.hours), 0) as total_hours
FROM programs pr
LEFT JOIN activities a ON pr.id = a.program_id AND a.status = 'approved'
WHERE pr.is_active = true
GROUP BY pr.id, pr.title, pr.description
ORDER BY active_volunteers DESC;

-- ============================================
-- 5. 특정 사용자의 활동 목록
-- ============================================
SELECT 
  a.id,
  a.hours,
  a.image_url,
  a.content,
  a.created_at,
  pr.title as program_name,
  pr.thumbnail_url as program_thumbnail
FROM activities a
JOIN programs pr ON a.program_id = pr.id
WHERE a.user_id = 'USER_ID_HERE' -- 실제 user_id로 교체
ORDER BY a.created_at DESC;

-- ============================================
-- 6. 실시간 구독을 위한 쿼리 (Supabase Realtime)
-- ============================================
-- 클라이언트에서 사용:
-- supabase
--   .channel('activities')
--   .on('postgres_changes', {
--     event: 'INSERT',
--     schema: 'public',
--     table: 'activities',
--     filter: 'status=eq.approved'
--   }, (payload) => {
--     // 대시보드 업데이트
--   })
--   .subscribe()

-- ============================================
-- 7. 검색 쿼리 (갤러리 검색용)
-- ============================================
SELECT 
  a.id,
  a.hours,
  a.image_url,
  a.content,
  a.created_at,
  p.name as volunteer_name,
  pr.title as program_name
FROM activities a
JOIN profiles p ON a.user_id = p.id
JOIN programs pr ON a.program_id = pr.id
WHERE 
  a.status = 'approved' AND
  (
    p.name ILIKE '%검색어%' OR
    pr.title ILIKE '%검색어%' OR
    a.content ILIKE '%검색어%'
  )
ORDER BY a.created_at DESC;

-- ============================================
-- 8. 월별 활동 통계
-- ============================================
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as activity_count,
  COUNT(DISTINCT user_id) as volunteer_count,
  SUM(hours) as total_hours
FROM activities
WHERE status = 'approved'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
