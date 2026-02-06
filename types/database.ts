/**
 * Supabase Database Types
 * 
 * 이 파일은 Supabase에서 자동 생성된 타입을 기반으로 합니다.
 * `supabase gen types typescript --project-id <your-project-id> > types/database.ts` 명령으로 업데이트할 수 있습니다.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          student_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'user'
          student_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          student_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      programs: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          user_id: string
          program_id: string
          hours: number
          image_url: string | null
          content: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          program_id: string
          hours: number
          image_url?: string | null
          content: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          program_id?: string
          hours?: number
          image_url?: string | null
          content?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_program_id_fkey"
            columns: ["program_id"]
            referencedRelation: "programs"
            referencedColumns: ["id"]
          }
        ]
      }
      magazine_assets: {
        Row: {
          id: string
          activity_id: string
          is_starred: boolean
          created_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          is_starred?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          is_starred?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "magazine_assets_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      activity_stats: {
        Row: {
          total_volunteers: number | null
          total_hours: number | null
          total_activities: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================
// 편의 타입 정의 (UI 컴포넌트에서 사용)
// ============================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Program = Database['public']['Tables']['programs']['Row']
export type ProgramInsert = Database['public']['Tables']['programs']['Insert']
export type ProgramUpdate = Database['public']['Tables']['programs']['Update']

export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']
export type ActivityUpdate = Database['public']['Tables']['activities']['Update']

export type MagazineAsset = Database['public']['Tables']['magazine_assets']['Row']
export type MagazineAssetInsert = Database['public']['Tables']['magazine_assets']['Insert']
export type MagazineAssetUpdate = Database['public']['Tables']['magazine_assets']['Update']

// UI에서 사용하는 확장 타입 (JOIN 결과)
export type ActivityWithRelations = Activity & {
  profile: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  program: Pick<Program, 'id' | 'title' | 'description' | 'thumbnail_url'>
}

export type ProgramWithStats = Program & {
  active_volunteers?: number
  total_hours?: number
}
