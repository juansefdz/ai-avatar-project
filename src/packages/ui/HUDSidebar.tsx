"use client";

import { Activity, Globe, Cpu, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import type { CallStatus } from "../avatar/types";

interface HUDSidebarProps {
  side: "left" | "right";
  status: CallStatus;
}

const statusLabel: Record<CallStatus, string> = {
  idle: "STANDBY",
  connecting: "LINKING",
  active: "ONLINE",
  error: "FAULT",
};

const statusColor: Record<CallStatus, string> = {
  idle: "text-cyan-500/30",
  connecting: "text-cyan-400/70",
  active: "text-cyan-400",
  error: "text-red-500",
};

export default function HUDSidebar({ side, status }: HUDSidebarProps) {
  const isLeft = side === "left";

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`fixed ${isLeft ? "left-10" : "right-10"} top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8 font-mono z-40`}
    >
      {/* Indicador de Estado */}
      <div className={`flex items-center gap-4 ${isLeft ? "" : "flex-row-reverse"}`}>
        <div className={`relative w-10 h-10 flex items-center justify-center border border-cyan-500/20 bg-cyan-500/5 rounded-sm`}>
          <Activity size={16} className={status === "active" ? "animate-pulse text-cyan-400" : "text-cyan-500/30"} />
          {status === "active" && (
            <div className="absolute inset-0 border border-cyan-400 animate-ping opacity-20" />
          )}
        </div>
        <div className={isLeft ? "text-left" : "text-right"}>
          <p className="text-[10px] text-cyan-500/40 tracking-[0.3em] uppercase mb-0.5">System_Status</p>
          <p className={`text-xs tracking-[0.4em] font-black ${statusColor[status]}`}>
            {statusLabel[status]}
          </p>
        </div>
      </div>

      {/* Bloque de Telemetría */}
      <div className={`flex items-start gap-3 ${isLeft ? "" : "flex-row-reverse"}`}>
        <div className="w-px h-24 bg-linear-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className={`flex flex-col gap-4 ${isLeft ? "text-left" : "text-right"}`}>
          <div className={`flex items-center gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
            <Globe size={12} className="text-cyan-500/40" />
            <span className="text-[10px] text-cyan-500/50 tracking-widest uppercase">Node: Medellín_CO</span>
          </div>
          <div className={`flex items-center gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
            <Cpu size={12} className="text-cyan-500/40" />
            <span className="text-[10px] text-cyan-500/50 tracking-widest uppercase">Kernel: Noctra_v2</span>
          </div>
          <div className={`flex items-center gap-2 ${isLeft ? "" : "flex-row-reverse"}`}>
            <Wifi size={12} className="text-cyan-500/40" />
            <span className="text-[10px] text-cyan-500/50 tracking-widest uppercase italic">
              {status === "active" ? "Syncing: 98%" : "Ready_To_Link"}
            </span>
          </div>
        </div>
      </div>

      {/* Etiqueta de Dirección */}
      <div className={`flex items-center gap-3 ${isLeft ? "" : "flex-row-reverse"} opacity-30`}>
        <div className={`h-px w-12 ${isLeft ? "bg-linear-to-r" : "bg-linear-to-l"} from-cyan-400 to-transparent`} />
        <span className="text-[9px] text-cyan-400 font-bold tracking-[0.5em]">{isLeft ? "IN" : "OUT"}</span>
      </div>
    </motion.div>
  );
}