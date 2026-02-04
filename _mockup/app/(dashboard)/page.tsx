"use client"

import Link from "next/link"
import { Clock, Users, ArrowRight, Plus } from "lucide-react"
import { ImpactCounter } from "@/components/impact-counter"
import { LiveSyncBadge } from "@/components/live-sync-badge"
import { RecentActivities } from "@/components/recent-activities"
import { useVolunteer } from "@/lib/volunteer-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { totalHours, totalVolunteers } = useVolunteer()
  const { user } = useAuth()

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            {user?.name}님, 환영합니다!
          </h1>
          <p className="text-muted-foreground mt-1">
            커뮤니티의 봉사 임팩트를 실시간으로 확인하세요.
          </p>
        </div>
        <LiveSyncBadge />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">임팩트 현황</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImpactCounter
            value={totalHours}
            label="누적 봉사 시간"
            icon={<Clock className="h-5 w-5" />}
            suffix="시간"
          />
          <ImpactCounter
            value={totalVolunteers}
            label="전체 봉사자 수"
            icon={<Users className="h-5 w-5" />}
            suffix="명"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">최근 활동</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/log">
                <Plus className="h-4 w-4 mr-1" />
                활동 기록
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/gallery" className="text-primary">
                전체 보기
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <RecentActivities limit={3} />
      </section>
    </div>
  )
}
