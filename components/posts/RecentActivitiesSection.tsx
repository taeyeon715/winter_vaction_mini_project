"use client"

import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecentActivities } from "@/components/recent-activities"

interface RecentActivitiesSectionProps {
  limit?: number
}

export function RecentActivitiesSection({ limit = 3 }: RecentActivitiesSectionProps) {
  return (
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
      <RecentActivities limit={limit} />
    </section>
  )
}
