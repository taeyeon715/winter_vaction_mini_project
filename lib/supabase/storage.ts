/**
 * Supabase Storage 유틸리티 함수
 * 
 * 이미지 업로드 및 URL 생성 헬퍼 함수
 */

import { getSupabaseClient } from './client'

/**
 * 아바타 이미지 업로드
 * @param userId 사용자 ID
 * @param file 이미지 파일
 * @returns Public URL
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const supabase = getSupabaseClient()
  
  // 파일 확장자 추출
  const fileExt = file.name.split('.').pop()
  const fileName = `avatar.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // 기존 파일 삭제 (있을 경우) - 에러 무시
  await supabase.storage.from('avatars').remove([filePath]).catch(() => {
    // 파일이 없을 수 있으므로 에러 무시
  })

  // 파일 업로드
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    // 버킷이 없는 경우 더 명확한 에러 메시지 제공
    if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
      throw new Error(
        '아바타 버킷이 생성되지 않았습니다. ' +
        'Supabase Dashboard → Storage에서 "avatars" 버킷을 생성해주세요. ' +
        '자세한 내용은 supabase/storage-setup.md 파일을 참고하세요.'
      )
    }
    throw new Error(`아바타 업로드 실패: ${uploadError.message}`)
  }

  // Public URL 생성
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  
  return data.publicUrl
}

/**
 * 활동 이미지 업로드
 * @param userId 사용자 ID
 * @param activityId 활동 ID
 * @param file 이미지 파일
 * @returns Public URL
 */
export async function uploadActivityImage(
  userId: string,
  activityId: string,
  file: File
): Promise<string> {
  const supabase = getSupabaseClient()
  
  // 파일 확장자 추출
  const fileExt = file.name.split('.').pop()
  const timestamp = Date.now()
  const fileName = `${timestamp}-${file.name}`
  const filePath = `${userId}/${activityId}/${fileName}`

  // 파일 업로드
  const { error: uploadError } = await supabase.storage
    .from('activity-images')
    .upload(filePath, file, {
      cacheControl: '3600',
    })

  if (uploadError) {
    // 버킷이 없는 경우 더 명확한 에러 메시지 제공
    if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
      throw new Error(
        '활동 이미지 버킷이 생성되지 않았습니다. ' +
        'Supabase Dashboard → Storage에서 "activity-images" 버킷을 생성해주세요. ' +
        '자세한 내용은 supabase/storage-setup.md 파일을 참고하세요.'
      )
    }
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
  }

  // Public URL 생성
  const { data } = supabase.storage.from('activity-images').getPublicUrl(filePath)
  
  return data.publicUrl
}

/**
 * 프로그램 썸네일 업로드 (Admin 전용)
 * @param programId 프로그램 ID
 * @param file 이미지 파일
 * @returns Public URL
 */
export async function uploadProgramThumbnail(
  programId: string,
  file: File
): Promise<string> {
  const supabase = getSupabaseClient()
  
  // 파일 확장자 추출
  const fileExt = file.name.split('.').pop()
  const fileName = `thumbnail.${fileExt}`
  const filePath = `${programId}/${fileName}`

  // 기존 파일 삭제 (있을 경우) - 에러 무시
  await supabase.storage.from('program-thumbnails').remove([filePath]).catch(() => {
    // 파일이 없을 수 있으므로 에러 무시
  })

  // 파일 업로드
  const { error: uploadError } = await supabase.storage
    .from('program-thumbnails')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    // 버킷이 없는 경우 더 명확한 에러 메시지 제공
    if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('bucket')) {
      throw new Error(
        '프로그램 썸네일 버킷이 생성되지 않았습니다. ' +
        'Supabase Dashboard → Storage에서 "program-thumbnails" 버킷을 생성해주세요. ' +
        '자세한 내용은 supabase/storage-setup.md 파일을 참고하세요.'
      )
    }
    throw new Error(`썸네일 업로드 실패: ${uploadError.message}`)
  }

  // Public URL 생성
  const { data } = supabase.storage.from('program-thumbnails').getPublicUrl(filePath)
  
  return data.publicUrl
}
