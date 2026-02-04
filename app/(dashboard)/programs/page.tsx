"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Heart, ArrowRight, Search } from "lucide-react"
import { useVolunteer, type Program } from "@/lib/volunteer-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

function ProgramCard({ program, index }: { program: Program; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 group">
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={program.thumbnail || "/placeholder.svg"}
            alt={program.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-semibold text-white">{program.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-0">
                <Users className="mr-1 h-3 w-3" />
                {program.activeVolunteers}명 활동 중
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {program.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-primary">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">참여하기</span>
            </div>
            <Button variant="ghost" size="sm" asChild className="group/btn">
              <Link href="/log">
                시간 기록
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ProgramsPage() {
  const { programs } = useVolunteer()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalActiveVolunteers = programs.reduce(
    (sum, program) => sum + program.activeVolunteers,
    0
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">프로그램 탐색</h1>
          <p className="text-muted-foreground mt-1">
            다양한 봉사 기회를 발견하고 변화를 만들어 보세요.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">전체 활동 인원</p>
            <p className="text-lg font-semibold">{totalActiveVolunteers}명</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="프로그램 검색..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">프로그램을 찾을 수 없습니다</h3>
          <p className="text-muted-foreground mt-1">
            검색어를 다시 확인해 주세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program, index) => (
            <ProgramCard key={program.id} program={program} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
