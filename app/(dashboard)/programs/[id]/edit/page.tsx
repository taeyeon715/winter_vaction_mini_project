"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { ArrowLeft, FileText, ImageIcon, Loader2, Upload } from "lucide-react"
import { useVolunteer } from "@/lib/volunteer-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import Image from "next/image"

function ImageDropzone({
  file,
  currentImage,
  onChange,
}: {
  file: File | null
  currentImage?: string
  onChange: (file: File | null) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      // 파일 크기 검증 (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("이미지 크기는 5MB 이하여야 합니다.")
        return
      }

      // 파일 타입 검증
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드할 수 있습니다.")
        return
      }

      onChange(selectedFile)
      
      // 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        handleFileSelect(selectedFile)
      }
    },
    [handleFileSelect]
  )

  const handleRemove = useCallback(() => {
    onChange(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onChange])

  const displayImage = preview || (file ? URL.createObjectURL(file) : currentImage)

  if (displayImage) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
        <Image
          src={displayImage}
          alt="프로그램 썸네일 미리보기"
          fill
          className="object-cover"
          crossOrigin="anonymous"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="이미지 삭제"
        >
          {file ? "삭제" : "변경"}
        </button>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
      `}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-label="썸네일 이미지 파일 선택"
        aria-describedby="thumbnail-upload-hint"
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">이미지를 드래그하거나 클릭해서 업로드</p>
      <p id="thumbnail-upload-hint" className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP 최대 5MB</p>
    </div>
  )
}

export default function EditProgramPage() {
  const router = useRouter()
  const params = useParams()
  const programId = params.id as string
  const { programs, updateProgram, isLoading: isContextLoading } = useVolunteer()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailFile: null as File | null,
  })

  const program = programs.find((p) => p.id === programId)

  useEffect(() => {
    // 관리자 권한 체크
    if (user && user.role !== 'admin') {
      toast.error("프로그램을 수정할 권한이 없습니다.")
      router.push("/programs")
      return
    }

    // 프로그램 데이터 로드
    if (program) {
      setFormData({
        title: program.name,
        description: program.description,
        thumbnailFile: null,
      })
    } else if (!isContextLoading) {
      toast.error("프로그램을 찾을 수 없습니다.")
      router.push("/programs")
    }
  }, [program, user, isContextLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast.error("제목과 설명을 모두 입력해 주세요")
      return
    }

    setIsSubmitting(true)
    
    try {
      await updateProgram(
        programId,
        formData.title,
        formData.description,
        formData.thumbnailFile || undefined
      )
      
      toast.success("프로그램이 수정되었습니다!", {
        description: `${formData.title} 프로그램이 업데이트되었습니다.`,
      })
      
      router.push("/programs")
    } catch (error: any) {
      console.error("프로그램 수정 실패:", error)
      toast.error("프로그램 수정에 실패했습니다.", {
        description: error.message || "다시 시도해 주세요.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isContextLoading || !program) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/programs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            프로그램 목록으로 돌아가기
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">프로그램 수정</h1>
        <p className="text-muted-foreground mt-1">
          프로그램 정보를 수정하세요.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              프로그램 정보
            </CardTitle>
            <CardDescription>
              프로그램에 대한 정보를 수정해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">프로그램 제목 *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="예: 초등학교 교육봉사"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">프로그램 설명 *</Label>
                <Textarea
                  id="description"
                  placeholder="프로그램에 대한 상세 설명을 입력해 주세요..."
                  className="min-h-[120px] resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">썸네일 이미지 (선택)</Label>
                <ImageDropzone
                  file={formData.thumbnailFile}
                  currentImage={program.thumbnail}
                  onChange={(file) => setFormData({ ...formData, thumbnailFile: file })}
                />
                <p className="text-xs text-muted-foreground">
                  새로운 이미지를 업로드하지 않으면 기존 이미지가 유지됩니다.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    수정 중...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    프로그램 수정
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
