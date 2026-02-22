"use client";

import { motion } from "framer-motion";
import type { CallStatus } from "../avatar/types";

interface StatusBadgeProps {
  status: CallStatus;
}

const config: Record<CallStatus, { label: string; dot: string; text: string }> = {
  idle: {
    label: "AGENTE EN ESPERA",
    dot: "bg-violet-500/40",
    text: "text-violet-400/50",
  },
  connecting: {
    label: "ESTABLECIENDO ENLACE",
    dot: "bg-purple-300 animate-ping",
    text: "text-purple-300/80",
  },
  active: {
    label: "AGENTE ACTIVO",
    dot: "bg-violet-400",
    text: "text-violet-300",
  },
  error: {
    label: "ERROR DE CONEXIÓN",
    dot: "bg-red-500",
    text: "text-red-400",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, dot, text } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="absolute top-2 sm:top-5 md:top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 bg-black/60 backdrop-blur-md border border-violet-900/20 rounded-full"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dot.replace("animate-ping", "")}`} />
      </span>
      <span className={`text-[9px] tracking-[0.25em] font-mono font-medium ${text}`}>
        {label}
      </span>
    </motion.div>
  );
}
