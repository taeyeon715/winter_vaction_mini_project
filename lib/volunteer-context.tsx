"use client"

import React from "react"

import { createContext, useContext, useState, useCallback } from "react"

export interface Activity {
  id: string
  volunteerName: string
  programName: string
  hours: number
  caption: string
  imageUrl: string
  createdAt: Date
}

export interface Program {
  id: string
  name: string
  description: string
  thumbnail: string
  activeVolunteers: number
}

interface VolunteerContextType {
  totalHours: number
  totalVolunteers: number
  activities: Activity[]
  programs: Program[]
  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => void
}

const VolunteerContext = createContext<VolunteerContextType | null>(null)

const initialPrograms: Program[] = [
  {
    id: "1",
    name: "Community Garden",
    description: "Help maintain and grow fresh produce for local food banks.",
    thumbnail: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    activeVolunteers: 24,
  },
  {
    id: "2",
    name: "Youth Mentorship",
    description: "Guide and inspire the next generation through one-on-one mentoring.",
    thumbnail: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=400&h=300&fit=crop",
    activeVolunteers: 18,
  },
  {
    id: "3",
    name: "Senior Care",
    description: "Provide companionship and assistance to elderly community members.",
    thumbnail: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop",
    activeVolunteers: 32,
  },
  {
    id: "4",
    name: "Beach Cleanup",
    description: "Protect our coastlines by removing litter and debris from local beaches.",
    thumbnail: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&h=300&fit=crop",
    activeVolunteers: 45,
  },
  {
    id: "5",
    name: "Food Distribution",
    description: "Sort and distribute food packages to families in need.",
    thumbnail: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop",
    activeVolunteers: 28,
  },
  {
    id: "6",
    name: "Animal Shelter Support",
    description: "Care for shelter animals and assist with adoption events.",
    thumbnail: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
    activeVolunteers: 15,
  },
]

const initialActivities: Activity[] = [
  {
    id: "1",
    volunteerName: "Sarah Chen",
    programName: "Community Garden",
    hours: 4,
    caption: "Planted tomatoes and peppers today! The garden is looking beautiful.",
    imageUrl: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&h=300&fit=crop",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    volunteerName: "Marcus Johnson",
    programName: "Youth Mentorship",
    hours: 2,
    caption: "Great tutoring session with my mentee. He aced his math test!",
    imageUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=300&fit=crop",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    volunteerName: "Emily Rodriguez",
    programName: "Beach Cleanup",
    hours: 3,
    caption: "Collected 15 bags of trash. Every piece of plastic matters!",
    imageUrl: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=400&h=300&fit=crop",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "4",
    volunteerName: "David Kim",
    programName: "Food Distribution",
    hours: 5,
    caption: "Helped distribute food to 50 families today. So rewarding!",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "5",
    volunteerName: "Lisa Wang",
    programName: "Senior Care",
    hours: 3,
    caption: "Spent the afternoon playing cards and sharing stories with residents.",
    imageUrl: "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=400&h=300&fit=crop",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: "6",
    volunteerName: "James Miller",
    programName: "Animal Shelter Support",
    hours: 4,
    caption: "Walked 8 dogs today! They were all so happy to get outside.",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]

export function VolunteerProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [extraHours, setExtraHours] = useState(0)
  const [extraVolunteers, setExtraVolunteers] = useState(0)

  const baseHours = 12547
  const baseVolunteers = 847

  const addActivity = useCallback((activity: Omit<Activity, "id" | "createdAt">) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setActivities((prev) => [newActivity, ...prev])
    setExtraHours((prev) => prev + activity.hours)
    setExtraVolunteers((prev) => prev + 1)
  }, [])

  return (
    <VolunteerContext.Provider
      value={{
        totalHours: baseHours + extraHours,
        totalVolunteers: baseVolunteers + extraVolunteers,
        activities,
        programs: initialPrograms,
        addActivity,
      }}
    >
      {children}
    </VolunteerContext.Provider>
  )
}

export function useVolunteer() {
  const context = useContext(VolunteerContext)
  if (!context) {
    throw new Error("useVolunteer must be used within a VolunteerProvider")
  }
  return context
}
