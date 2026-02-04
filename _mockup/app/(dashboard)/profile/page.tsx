"use client"

import { motion } from "framer-motion"
import { User, Mail, Clock, Heart, Award, Calendar } from "lucide-react"
import { useVolunteer } from "@/lib/volunteer-context"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { totalHours, activities } = useVolunteer()
  const { user } = useAuth()
  const userActivities = activities.slice(0, 3)

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
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{user?.name || "게스트"}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email || "guest@vhub.kr"}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    <Award className="mr-1 h-3 w-3" />
                    활동 봉사자
                  </Badge>
                </div>
              </div>

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
                      <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={activity.imageUrl || "/placeholder.svg"}
                          alt={activity.programName}
                          className="h-full w-full object-cover"
                          crossOrigin="anonymous"
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
