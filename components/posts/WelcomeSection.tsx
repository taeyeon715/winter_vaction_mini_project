"use client"

import { LiveSyncBadge } from "@/components/live-sync-badge"
import { useAuth } from "@/lib/auth-context"

export function WelcomeSection() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">
          {user?.name || "게스트"}님, 환영합니다!
        </h1>
        <p className="text-muted-foreground mt-1">
          커뮤니티의 봉사 임팩트를 실시간으로 확인하세요.
        </p>
      </div>
      <LiveSyncBadge />
    </div>
  )
}
