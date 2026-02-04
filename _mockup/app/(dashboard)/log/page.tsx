"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Upload, Clock, FileText, ImageIcon, ArrowLeft, Loader2 } from "lucide-react"
import { useVolunteer } from "@/lib/volunteer-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

function ImageDropzone({
  value,
  onChange,
}: {
  value: string | null
  onChange: (url: string | null) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file)
        onChange(url)
      }
    },
    [onChange]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file)
        onChange(url)
      }
    },
    [onChange]
  )

  if (value) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
        <img
          src={value || "/placeholder.svg"}
          alt="업로드된 미리보기"
          className="h-full w-full object-cover"
          crossOrigin="anonymous"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium hover:bg-background transition-colors"
        >
          삭제
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
        relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors
        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="이미지 업로드"
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">이미지를 드래그하거나 클릭해서 업로드</p>
      <p className="text-xs text-muted-foreground mt-1">PNG, JPG 최대 10MB</p>
    </div>
  )
}

export default function LogActivityPage() {
  const router = useRouter()
  const { programs, addActivity } = useVolunteer()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    programId: "",
    hours: "",
    caption: "",
    imageUrl: null as string | null,
  })

  const selectedProgram = programs.find((p) => p.id === formData.programId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.programId || !formData.hours || !formData.caption) {
      toast.error("모든 필수 항목을 입력해 주세요")
      return
    }

    setIsSubmitting(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    addActivity({
      volunteerName: user?.name || "익명",
      programName: selectedProgram?.name || "",
      hours: Number(formData.hours),
      caption: formData.caption,
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop",
    })
    
    setIsSubmitting(false)
    toast.success("활동이 기록되었습니다!", {
      description: `${formData.hours}시간이 임팩트에 추가되었습니다.`,
    })
    
    router.push("/gallery")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드로 돌아가기
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">활동 기록</h1>
        <p className="text-muted-foreground mt-1">
          봉사 경험을 공유하고 커뮤니티 임팩트에 기여하세요.
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
              활동 상세
            </CardTitle>
            <CardDescription>
              봉사 활동에 대한 정보를 입력해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="program">봉사 프로그램</Label>
                <Select
                  value={formData.programId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, programId: value })
                  }
                  required
                >
                  <SelectTrigger id="program" className="w-full">
                    <SelectValue placeholder="프로그램을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">봉사 시간</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hours"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    placeholder="0"
                    className="pl-10"
                    value={formData.hours}
                    onChange={(e) =>
                      setFormData({ ...formData, hours: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">이미지 업로드 (선택)</Label>
                <ImageDropzone
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">활동 소감</Label>
                <Textarea
                  id="caption"
                  placeholder="봉사 활동에 대한 소감을 적어주세요..."
                  className="min-h-[120px] resize-none"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    활동 제출
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
