/**
 * Supabase 서버 클라이언트 (Server Components / Server Actions용)
 * 
 * 서버 사이드에서 사용하는 Supabase 클라이언트 인스턴스
 * cookies를 사용하여 세션을 관리합니다.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from './env'
import type { Database } from '@/types/database'

export async function getSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // Server Component에서 cookies를 수정할 수 없는 경우 무시
          // (예: 리다이렉트 중)
        }
      },
    },
  })
}
