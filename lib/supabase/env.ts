/**
 * Supabase 환경 변수 검증 및 타입 안전한 접근
 */

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '❌ Supabase 환경 변수가 설정되지 않았습니다.\n' +
        '   .env.local 파일에 다음 변수들을 추가하세요:\n' +
        '   NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
        '   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
      )
    }
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.')
  }

  return { url, anonKey }
}
