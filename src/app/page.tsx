"use client";

import { useStreamingAvatar } from "@/packages/avatar/useStreamingAvatar";
import HoloAvatar from "@/packages/ui/HoloAvatar";

export default function Page() {
  const { status, stream, handleCall } = useStreamingAvatar();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#010204]">
      
      {/* CAPA 0: FONDO ATMOSFÉRICO */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: '32px 32px' 
          }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#010204_90%)]" />
      </div>

      {/* PROYECCIÓN NOCTRA */}
      <div className="relative z-20 min-h-screen flex items-center justify-center">
        <HoloAvatar 
            status={status} 
            stream={stream} 
            isSpeaking={status === "active"} 
            onCall={handleCall} 
        />
      </div>
    </main>
  );
}