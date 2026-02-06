# Supabase Storage 설정 가이드

## 1. Storage 버킷 생성

Supabase Dashboard에서 다음 버킷들을 생성하세요:

### 버킷 1: `activity-images`
- **용도**: 활동 사진 저장
- **Public**: Yes (갤러리에서 공개적으로 보여야 함)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### 버킷 2: `program-thumbnails`
- **용도**: 프로그램 썸네일 이미지
- **Public**: Yes
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### 버킷 3: `avatars`
- **용도**: 사용자 프로필 이미지
- **Public**: Yes
- **File size limit**: 2MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

## 2. Storage RLS 정책 설정

### activity-images 버킷

```sql
-- 모든 사용자가 이미지 조회 가능
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-images');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-images' AND
  auth.role() = 'authenticated'
);

-- 본인만 자신의 이미지 삭제 가능
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'activity-images' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);
```

### program-thumbnails 버킷

```sql
-- 모든 사용자가 썸네일 조회 가능
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'program-thumbnails');

-- Admin만 업로드/삭제 가능
CREATE POLICY "Admins can manage thumbnails"
ON storage.objects FOR ALL
USING (
  bucket_id = 'program-thumbnails' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### avatars 버킷

```sql
-- 모든 사용자가 아바타 조회 가능
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 본인만 자신의 아바타 업로드/삭제 가능
CREATE POLICY "Users can manage their own avatar"
ON storage.objects FOR ALL
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 3. 파일 경로 구조

### 활동 이미지
```
activity-images/
  {user_id}/
    {activity_id}/
      {timestamp}-{filename}.jpg
```

### 프로그램 썸네일
```
program-thumbnails/
  {program_id}/
    thumbnail.jpg
```

### 사용자 아바타
```
avatars/
  {user_id}/
    avatar.jpg
```

## 4. Storage URL 생성 예시

```typescript
// 활동 이미지 URL 생성
const getActivityImageUrl = (userId: string, activityId: string, filename: string) => {
  return `${supabaseUrl}/storage/v1/object/public/activity-images/${userId}/${activityId}/${filename}`
}

// 프로그램 썸네일 URL 생성
const getProgramThumbnailUrl = (programId: string) => {
  return `${supabaseUrl}/storage/v1/object/public/program-thumbnails/${programId}/thumbnail.jpg`
}

// 아바타 URL 생성
const getAvatarUrl = (userId: string) => {
  return `${supabaseUrl}/storage/v1/object/public/avatars/${userId}/avatar.jpg`
}
```
