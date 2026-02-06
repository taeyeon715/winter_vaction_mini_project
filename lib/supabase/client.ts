/**
 * Supabase 클라이언트 (브라우저용)
 * 
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트 인스턴스
 */

import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './env'
import type { Database } from '@/types/database'

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const { url, anonKey } = getSupabaseEnv()
  
  supabaseClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}
