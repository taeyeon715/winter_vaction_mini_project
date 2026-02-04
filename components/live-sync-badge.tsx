"use client"

import { motion } from "framer-motion"
import { Wifi } from "lucide-react"

export function LiveSyncBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm shadow-sm">
      <motion.div
        className="relative flex h-2 w-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </motion.div>
      <span className="font-medium text-muted-foreground">실시간 동기화</span>
      <Wifi className="h-3.5 w-3.5 text-emerald-500" />
    </div>
  )
}
