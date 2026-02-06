"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Clock, Heart, Plus, Search } from "lucide-react"
import { useVolunteer, type Activity } from "@/lib/volunteer-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ActivityCardSkeleton } from "@/components/activity-card-skeleton"

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return "방금 전"
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}시간 전`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}일 전`
}

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={activity.imageUrl || "/placeholder.svg"}
            alt={`${activity.volunteerName}님의 ${activity.programName} 활동`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              <Clock className="mr-1 h-3 w-3" />
              {activity.hours}h
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">
                  {activity.volunteerName}
                </span>
                <Heart className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity.programName}
              </p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTimeAgo(activity.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {activity.caption}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function GalleryPage() {
  const { activities, isLoading: isContextLoading } = useVolunteer()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredActivities = activities.filter(
    (activity) =>
      activity.volunteerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.caption.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">공유 갤러리</h1>
          <p className="text-muted-foreground mt-1">
            봉사 커뮤니티의 이야기와 임팩트를 함께 나눠요.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/log" aria-label="새 활동 기록하기">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            활동 기록
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="봉사자, 프로그램, 내용으로 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="활동 검색"
          aria-describedby="search-description"
        />
        <span id="search-description" className="sr-only">
          봉사자 이름, 프로그램 이름, 활동 내용으로 검색할 수 있습니다
        </span>
      </div>

      {isContextLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ActivityCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">활동이 없습니다</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "검색어를 다시 확인해 주세요." : "첫 번째 활동을 기록해 보세요!"}
          </p>
          {!searchQuery && (
            <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/log">
                <Plus className="h-4 w-4 mr-2" />
                활동 기록
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" layout>
          {filteredActivities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
