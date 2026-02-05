"use client"

import { VolunteerProvider } from "@/lib/volunteer-context"
import { WelcomeSection } from "@/components/posts/WelcomeSection"
import { ImpactStatsSection } from "@/components/posts/ImpactStatsSection"
import { RecentActivitiesSection } from "@/components/posts/RecentActivitiesSection"

export default function HomePage() {
  return (
    <VolunteerProvider>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <WelcomeSection />
        <ImpactStatsSection />
        <RecentActivitiesSection limit={3} />
      </div>
    </VolunteerProvider>
  )
}
