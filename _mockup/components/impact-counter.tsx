"use client"

import React from "react"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface ImpactCounterProps {
  value: number
  label: string
  icon: React.ReactNode
  suffix?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  )
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    return display.on("change", (latest) => {
      setDisplayValue(latest)
    })
  }, [display])

  return <span>{displayValue}</span>
}

export function ImpactCounter({ value, label, icon, suffix = "" }: ImpactCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight">
          <AnimatedNumber value={value} />
        </span>
        {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </div>
    </motion.div>
  )
}
