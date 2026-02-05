"use client"

import { Clock, Users } from "lucide-react"
import { ImpactCounter } from "@/components/impact-counter"
import { useVolunteer } from "@/lib/volunteer-context"

export function ImpactStatsSection() {
  const { totalHours, totalVolunteers } = useVolunteer()

  return (
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
  )
}
