"use client"

import { motion } from "framer-motion"
import { Clock, Heart } from "lucide-react"
import { useVolunteer, type Activity } from "@/lib/volunteer-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={activity.imageUrl || "/placeholder.svg"}
            alt={`Activity by ${activity.volunteerName}`}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              <Clock className="mr-1 h-3 w-3" />
              {activity.hours}시간
            </Badge>
          </div>
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

export function RecentActivities({ limit = 3 }: { limit?: number }) {
  const { activities } = useVolunteer()
  const displayActivities = activities.slice(0, limit)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {displayActivities.map((activity, index) => (
        <ActivityCard key={activity.id} activity={activity} index={index} />
      ))}
    </div>
  )
}
