"use client";

import { motion } from "framer-motion";
import type { OpenClawStatus } from "../avatar/useOpenClaw";
import { Bot } from "lucide-react";

interface OpenClawBadgeProps {
  status: OpenClawStatus;
}

const config: Record<OpenClawStatus, { dot: string; label: string; text: string }> = {
  disconnected: { dot: "bg-violet-800/60", label: "OPENCLAW: OFF",  text: "text-violet-500/30" },
  connecting:   { dot: "bg-purple-300 animate-ping", label: "OPENCLAW: LINKING", text: "text-purple-300/60" },
  ready:        { dot: "bg-violet-400", label: "OPENCLAW: READY", text: "text-violet-300/70" },
  thinking:     { dot: "bg-purple-300 animate-pulse", label: "OPENCLAW: THINKING", text: "text-purple-200/80" },
  error:        { dot: "bg-red-500",    label: "OPENCLAW: ERROR",  text: "text-red-400/60" },
};

export default function OpenClawBadge({ status }: OpenClawBadgeProps) {
  const { dot, label, text } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="absolute top-2 right-14 sm:top-5 sm:right-16 md:top-8 md:right-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-black/50 border border-violet-900/20 rounded-full"
    >
      <Bot size={10} className={text} />
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dot.replace("animate-ping", "").replace("animate-pulse", "")}`} />
      </span>
      <span className={`text-[8px] tracking-widest font-mono ${text}`}>{label}</span>
    </motion.div>
  );
}
