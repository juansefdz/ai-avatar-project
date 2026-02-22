"use client";

import dynamic from "next/dynamic";

const NoctraInterface = dynamic(() => import("@/app/components/NoctraInterface"), { 
  ssr: false 
});

export default function Page() {
  return (
    // h-screen bloquea la altura al 100% de la pantalla
    <main className="relative h-screen w-full overflow-hidden bg-[#010204] selection:bg-cyan-500/30">
      
      {/* ── CAPA 0: FONDO ATMOSFÉRICO ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: '32px 32px' 
          }} 
        />
        <div className="absolute top-0 left-0 w-full h-full bg-cyan-950/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#010204_90%)]" />
      </div>

      {/* ── CAPA 1: INTERFAZ DE NOCTRA ── */}
      <NoctraInterface />

      {/* ── CAPA 2: EFECTO DE GRANO ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.01] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </main>
  );
}