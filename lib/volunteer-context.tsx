"use client"

import React from "react"
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react"
import { getSupabaseClient } from "./supabase/client"
import { uploadActivityImage, uploadProgramThumbnail } from "./supabase/storage"
import { useAuth } from "./auth-context"
import type { Activity as DBActivity, Program as DBProgram } from "@/types/database"

export interface Activity {
  id: string
  volunteerName: string
  programName: string
  hours: number
  caption: string
  imageUrl: string
  createdAt: Date
}

export interface Program {
  id: string
  name: string
  description: string
  thumbnail: string
  activeVolunteers: number
}

interface VolunteerContextType {
  totalHours: number
  totalVolunteers: number
  activities: Activity[]
  programs: Program[]
  isLoading: boolean
  addActivity: (programId: string, hours: number, content: string, imageFile?: File) => Promise<void>
  addProgram: (title: string, description: string, thumbnailFile?: File) => Promise<void>
  updateProgram: (programId: string, title: string, description: string, thumbnailFile?: File) => Promise<void>
  deleteProgram: (programId: string) => Promise<void>
  refreshData: () => Promise<void>
}

const VolunteerContext = createContext<VolunteerContextType | null>(null)

// DB 데이터를 Activity 인터페이스로 변환
function transformActivity(dbActivity: DBActivity & {
  profile: { name: string; avatar_url: string | null } | null
  program: { title: string; thumbnail_url: string | null } | null
}): Activity {
  return {
    id: dbActivity.id,
    volunteerName: dbActivity.profile?.name || "익명",
    programName: dbActivity.program?.title || "알 수 없음",
    hours: Number(dbActivity.hours),
    caption: dbActivity.content,
    imageUrl: dbActivity.image_url || "",
    createdAt: new Date(dbActivity.created_at),
  }
}

// DB 데이터를 Program 인터페이스로 변환
function transformProgram(dbProgram: DBProgram, activeVolunteers: number): Program {
  return {
    id: dbProgram.id,
    name: dbProgram.title,
    description: dbProgram.description || "",
    thumbnail: dbProgram.thumbnail_url || "",
    activeVolunteers,
  }
}

export function VolunteerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()

  // 통계 계산 (메모이제이션)
  const { totalHours, totalVolunteers } = useMemo(() => {
    const approvedActivities = activities.filter((a) => a.id) // 모든 활동이 승인된 것으로 가정 (Phase 1)
    const hours = approvedActivities.reduce((sum, a) => sum + a.hours, 0)
    const uniqueVolunteers = new Set(approvedActivities.map((a) => a.volunteerName)).size
    return {
      totalHours: hours,
      totalVolunteers: uniqueVolunteers,
    }
  }, [activities])

  // 활동 목록 조회
  const fetchActivities = useCallback(async (limit?: number) => {
    try {
      let query = supabase
        .from('activities')
        .select(`
          *,
          profile:profiles!activities_user_id_fkey(name, avatar_url),
          program:programs!activities_program_id_fkey(title, thumbnail_url)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('활동 목록 조회 실패:', error)
        return []
      }

      if (!data) return []

      return data.map(transformActivity)
    } catch (error) {
      console.error('활동 목록 조회 중 오류:', error)
      return []
    }
  }, [supabase])

  // 프로그램 목록 조회
  const fetchPrograms = useCallback(async () => {
    try {
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (programsError) {
        console.error('프로그램 목록 조회 실패:', programsError)
        return []
      }

      if (!programsData) return []

      // 각 프로그램의 활성 봉사자 수 계산
      const programsWithStats = await Promise.all(
        programsData.map(async (program) => {
          const { count, error: countError } = await supabase
            .from('activities')
            .select('user_id', { count: 'exact', head: true })
            .eq('program_id', program.id)
            .eq('status', 'approved')

          if (countError) {
            console.error(`프로그램 ${program.id} 통계 조회 실패:`, countError)
            return transformProgram(program, 0)
          }

          return transformProgram(program, count || 0)
        })
      )

      return programsWithStats
    } catch (error) {
      console.error('프로그램 목록 조회 중 오류:', error)
      return []
    }
  }, [supabase])

  // 초기 데이터 로드
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true)
      try {
        const [activitiesData, programsData] = await Promise.all([
          fetchActivities(),
          fetchPrograms(),
        ])
        setActivities(activitiesData)
        setPrograms(programsData)
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [fetchActivities, fetchPrograms])

  // Realtime 구독 설정
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('activities-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: 'status=eq.approved',
        },
        async (payload) => {
          console.log('새 활동 감지:', payload)
          
          // 새로 추가된 활동의 상세 정보 조회
          const { data: newActivity, error } = await supabase
            .from('activities')
            .select(`
              *,
              profile:profiles!activities_user_id_fkey(name, avatar_url),
              program:programs!activities_program_id_fkey(title, thumbnail_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && newActivity) {
            const transformedActivity = transformActivity(newActivity)
            setActivities((prev) => [transformedActivity, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  // 활동 추가 함수
  const addActivity = useCallback(
    async (programId: string, hours: number, content: string, imageFile?: File) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      let imageUrl: string | null = null

      try {
        // 이미지 업로드 (있는 경우)
        if (imageFile) {
          // 먼저 활동 ID를 생성 (UUID)
          const activityId = crypto.randomUUID()
          imageUrl = await uploadActivityImage(user.id, activityId, imageFile)
        }

        // Database에 활동 추가
        const { data: newActivity, error } = await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            program_id: programId,
            hours,
            content,
            image_url: imageUrl,
            status: 'approved', // Phase 1에서는 자동 승인
          })
          .select(`
            *,
            profile:profiles!activities_user_id_fkey(name, avatar_url),
            program:programs!activities_program_id_fkey(title, thumbnail_url)
          `)
          .single()

        if (error) {
          // 이미지가 업로드되었는데 DB 실패 시 이미지 삭제 (롤백)
          if (imageUrl) {
            try {
              const filePath = imageUrl.split('/').slice(-3).join('/')
              await supabase.storage.from('activity-images').remove([filePath])
            } catch (storageError) {
              console.error('이미지 롤백 실패:', storageError)
            }
          }
          throw error
        }

        if (newActivity) {
          const transformedActivity = transformActivity(newActivity)
          setActivities((prev) => [transformedActivity, ...prev])
        }
      } catch (error: any) {
        console.error('활동 추가 실패:', error)
        throw error
      }
    },
    [user, supabase]
  )

  // 프로그램 추가 함수
  const addProgram = useCallback(
    async (title: string, description: string, thumbnailFile?: File) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      // 관리자 권한 체크
      if (user.role !== 'admin') {
        throw new Error('프로그램을 생성할 권한이 없습니다. 관리자 계정으로 로그인해주세요. 프로필 페이지에서 관리자 권한을 부여받을 수 있습니다.')
      }
      
      let thumbnailUrl: string | null = null

      try {
        // 썸네일 업로드 (있는 경우)
        if (thumbnailFile) {
          // 먼저 프로그램 ID를 생성 (UUID)
          const programId = crypto.randomUUID()
          thumbnailUrl = await uploadProgramThumbnail(programId, thumbnailFile)
        }

        // Database에 프로그램 추가
        const { data: newProgram, error } = await supabase
          .from('programs')
          .insert({
            title,
            description,
            thumbnail_url: thumbnailUrl,
            is_active: true,
          })
          .select()
          .single()

        if (error) {
          // 썸네일이 업로드되었는데 DB 실패 시 썸네일 삭제 (롤백)
          if (thumbnailUrl) {
            try {
              const filePath = thumbnailUrl.split('/').slice(-2).join('/')
              await supabase.storage.from('program-thumbnails').remove([filePath])
            } catch (storageError) {
              console.error('썸네일 롤백 실패:', storageError)
            }
          }
          
          // RLS 정책 위반 에러 처리
          if (error.code === '42501' || error.message.includes('row-level security')) {
            throw new Error('프로그램을 생성할 권한이 없습니다. 관리자 계정으로 로그인해주세요.')
          }
          
          throw error
        }

        if (newProgram) {
          // 새 프로그램을 programs 배열에 추가 (활성 봉사자 수는 0으로 시작)
          const transformedProgram = transformProgram(newProgram, 0)
          setPrograms((prev) => [transformedProgram, ...prev])
        }
      } catch (error: any) {
        console.error('프로그램 추가 실패:', error)
        throw error
      }
    },
    [user, supabase]
  )

  // 프로그램 수정 함수
  const updateProgram = useCallback(
    async (programId: string, title: string, description: string, thumbnailFile?: File) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      // 관리자 권한 체크
      if (user.role !== 'admin') {
        throw new Error('프로그램을 수정할 권한이 없습니다. 관리자 계정으로 로그인해주세요.')
      }

      let thumbnailUrl: string | undefined = undefined

      try {
        // 썸네일 업로드 (새 파일이 있는 경우)
        if (thumbnailFile) {
          thumbnailUrl = await uploadProgramThumbnail(programId, thumbnailFile)
        }

        // Database에 프로그램 업데이트
        const updateData: { title: string; description: string; thumbnail_url?: string } = {
          title,
          description,
        }

        if (thumbnailUrl !== undefined) {
          updateData.thumbnail_url = thumbnailUrl
        }

        const { data: updatedProgram, error } = await supabase
          .from('programs')
          .update(updateData)
          .eq('id', programId)
          .select()
          .single()

        if (error) {
          // RLS 정책 위반 에러 처리
          if (error.code === '42501' || error.message.includes('row-level security')) {
            throw new Error('프로그램을 수정할 권한이 없습니다. 관리자 계정으로 로그인해주세요.')
          }
          throw error
        }

        if (updatedProgram) {
          // 프로그램 목록에서 해당 프로그램 찾아서 업데이트
          setPrograms((prev) =>
            prev.map((p) => {
              if (p.id === programId) {
                return transformProgram(updatedProgram, p.activeVolunteers)
              }
              return p
            })
          )
        }
      } catch (error: any) {
        console.error('프로그램 수정 실패:', error)
        throw error
      }
    },
    [user, supabase]
  )

  // 프로그램 삭제 함수
  const deleteProgram = useCallback(
    async (programId: string) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      // 관리자 권한 체크
      if (user.role !== 'admin') {
        throw new Error('프로그램을 삭제할 권한이 없습니다. 관리자 계정으로 로그인해주세요.')
      }

      try {
        // 프로그램의 썸네일 삭제 (있는 경우)
        const program = programs.find((p) => p.id === programId)
        if (program?.thumbnail) {
          try {
            // URL에서 파일 경로 추출
            const urlParts = program.thumbnail.split('/')
            const filePath = `${programId}/thumbnail.${urlParts[urlParts.length - 1].split('.').pop()}`
            await supabase.storage.from('program-thumbnails').remove([filePath])
          } catch (storageError) {
            console.error('썸네일 삭제 실패:', storageError)
            // 썸네일 삭제 실패해도 계속 진행
          }
        }

        // Database에서 프로그램 삭제 (is_active를 false로 변경)
        const { error } = await supabase
          .from('programs')
          .update({ is_active: false })
          .eq('id', programId)

        if (error) {
          // RLS 정책 위반 에러 처리
          if (error.code === '42501' || error.message.includes('row-level security')) {
            throw new Error('프로그램을 삭제할 권한이 없습니다. 관리자 계정으로 로그인해주세요.')
          }
          throw error
        }

        // 프로그램 목록에서 제거
        setPrograms((prev) => prev.filter((p) => p.id !== programId))
      } catch (error: any) {
        console.error('프로그램 삭제 실패:', error)
        throw error
      }
    },
    [user, supabase, programs]
  )

  // 데이터 새로고침 함수
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [activitiesData, programsData] = await Promise.all([
        fetchActivities(),
        fetchPrograms(),
      ])
      setActivities(activitiesData)
      setPrograms(programsData)
    } catch (error) {
      console.error('데이터 새로고침 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchActivities, fetchPrograms])

  return (
    <VolunteerContext.Provider
      value={{
        totalHours,
        totalVolunteers,
        activities,
        programs,
        isLoading,
        addActivity,
        addProgram,
        updateProgram,
        deleteProgram,
        refreshData,
      }}
    >
      {children}
    </VolunteerContext.Provider>
  )
}

export function useVolunteer() {
  const context = useContext(VolunteerContext)
  if (!context) {
    throw new Error("useVolunteer must be used within a VolunteerProvider")
  }
  return context
}
