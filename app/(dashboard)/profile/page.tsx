"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { User, Mail, Clock, Heart, Award, Calendar, Upload, Save, Loader2, Shield } from "lucide-react"
import { useVolunteer } from "@/lib/volunteer-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/lib/supabase/client"
import { uploadAvatar } from "@/lib/supabase/storage"
import { toast } from "sonner"

export default function ProfilePage() {
  const { totalHours, activities } = useVolunteer()
  const { user, makeAdmin, refreshProfile } = useAuth()
  const [studentId, setStudentId] = useState(user?.studentId || "")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isMakingAdmin, setIsMakingAdmin] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const userActivities = activities.slice(0, 3)

  const handleSaveStudentId = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('profiles')
        .update({ student_id: studentId || null })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      toast.success("학번이 저장되었습니다.")
    } catch (error: any) {
      console.error('학번 저장 실패:', error)
      toast.error(`저장 실패: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // 파일 크기 검증 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("이미지 크기는 2MB 이하여야 합니다.")
      return
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast.error("이미지 파일만 업로드할 수 있습니다.")
      return
    }

    setIsUploading(true)
    try {
      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Storage에 업로드
      const avatarUrl = await uploadAvatar(user.id, file)

      // 프로필 업데이트
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      toast.success("프로필 이미지가 업데이트되었습니다.")
      
      // 프로필 새로고침
      await refreshProfile()
    } catch (error: any) {
      console.error('아바타 업로드 실패:', error)
      toast.error(`업로드 실패: ${error.message}`)
      setAvatarPreview(user.avatar || null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">프로필</h1>
        <p className="text-muted-foreground mt-1">
          봉사 여정과 성과를 확인하세요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* 아바타 업로드 */}
                <div className="relative mb-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt={`${user?.name || "사용자"} 프로필 이미지`}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-12 w-12 text-primary" aria-hidden="true" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    aria-label="프로필 이미지 업로드"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Upload className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>

                <h2 className="text-xl font-semibold">{user?.name || "게스트"}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email || "guest@vhub.kr"}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    <Award className="mr-1 h-3 w-3" />
                    {user?.role === 'admin' ? '관리자' : '활동 봉사자'}
                  </Badge>
                </div>
              </div>

              {/* 학번 입력 */}
              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">학번</Label>
                  <div className="flex gap-2">
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="학번을 입력하세요"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveStudentId}
                      disabled={isSaving || studentId === user?.studentId}
                      aria-label="학번 저장"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 개발용: 관리자 권한 전환 */}
              {user?.role !== 'admin' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      개발용: 관리자 권한이 필요하신가요?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={async () => {
                        setIsMakingAdmin(true)
                        const result = await makeAdmin()
                        if (result.success) {
                          toast.success("관리자 권한이 부여되었습니다!")
                          await refreshProfile()
                        } else {
                          toast.error(result.error || "관리자 권한 부여에 실패했습니다.")
                        }
                        setIsMakingAdmin(false)
                      }}
                      disabled={isMakingAdmin}
                      aria-label="관리자 권한 부여"
                    >
                      {isMakingAdmin ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          관리자 권한 부여
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">총 봉사 시간</span>
                  </div>
                  <span className="font-semibold">{totalHours.toLocaleString()}시간</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">활동 수</span>
                  </div>
                  <span className="font-semibold">{activities.length}회</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">가입일</span>
                  </div>
                  <span className="font-semibold">2024년 1월</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>
                최근 봉사 활동 기록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    아직 기록된 활동이 없습니다.
                  </div>
                ) : (
                  userActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
                    >
                      <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={activity.imageUrl || "/placeholder.svg"}
                          alt={`${activity.programName} 활동 이미지`}
                          fill
                          className="object-cover"
                          sizes="48px"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium truncate">{activity.programName}</h4>
                          <Badge variant="outline" className="flex-shrink-0">
                            <Clock className="mr-1 h-3 w-3" />
                            {activity.hours}시간
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {activity.caption}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
