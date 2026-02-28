"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface VoiceWaveProps {
  volume: number;
  frequencies: {
    lows: number;
    mids: number;
    highs: number;
  };
  isSpeaking: boolean;
}

export default function VoiceWave({ frequencies, isSpeaking }: VoiceWaveProps) {
  const noctraViolet = "#8B5CF6";
  const neonWhite = "#FFFFFF";

  const [time, setTime] = useState(0);

  // Normalizamos las frecuencias con mayor sensibilidad
  const normLows = Math.min(frequencies.lows / 200, 1.2);
  const normMids = Math.min(frequencies.mids / 150, 1.2);
  const normHighs = Math.min(frequencies.highs / 80, 1.2);

  // Animación continua para el "ruido" orgánico
  useEffect(() => {
    let frame: number;
    const animate = () => {
      setTime((prev) => prev + 0.05);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-screen h-[500px] overflow-hidden">
      {/* ── 1. NOVA CORE AURA (MÁXIMO BRILLO) ── */}
      <motion.div
        animate={{
          opacity: isSpeaking ? [0.4, 0.7, 0.4] : 0.2,
          scale: isSpeaking ? [1, 1.5, 1] : 1,
          rotate: [0, 360],
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        }}
        className="absolute w-[800px] h-[400px] rounded-[100%] bg-violet-600/30 blur-[130px] mix-blend-screen pointer-events-none"
      />

      <motion.div
        animate={{
          opacity: isSpeaking ? [0.2, 0.5, 0.2] : 0.1,
          scale: isSpeaking ? [1.2, 1.8, 1.2] : 1.2,
        }}
        className="absolute w-[1000px] h-[200px] bg-violet-400/20 blur-[100px] mix-blend-screen pointer-events-none"
      />

      {/* ── 2. DIGITAL INFINITE FLOOR ── */}
      <div className="absolute bottom-0 w-full h-64 opacity-40 pointer-events-none perspective-[800px]">
        <motion.div
          animate={{
            translateY: isSpeaking ? [0, -10, 0] : 0,
            opacity: isSpeaking ? 0.8 : 0.4,
          }}
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(to right, ${noctraViolet} 2px, transparent 2px), linear-gradient(to bottom, ${noctraViolet} 2px, transparent 2px)`,
            backgroundSize: "60px 60px",
            transform: "rotateX(75deg) scale(3)",
            transformOrigin: "bottom center",
            maskImage: "linear-gradient(to top, black, transparent)",
          }}
        />
      </div>

      {/* ── 3. THE NOVA SPINE (EL NÚCLEO) ── */}
      <div className="relative z-10 w-full h-[400px] flex items-center justify-center">
        {/* Glow de base central */}
        <motion.div
          animate={{
            scaleX: isSpeaking ? [1, 1.2, 1] : 1,
            opacity: isSpeaking ? 0.9 : 0.3,
            height: isSpeaking ? ["2px", "6px", "2px"] : "2px",
          }}
          className="absolute w-full bg-white/40 blur-[4px] mix-blend-screen"
        />

        <svg
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible mix-blend-screen"
        >
          <defs>
            <filter id="novaGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <linearGradient id="novaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor={noctraViolet} />
              <stop offset="50%" stopColor="#DDD6FE" />
              <stop offset="70%" stopColor={noctraViolet} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Hilo de Energía Principal (Nova Spine) */}
          <motion.path
            animate={{
              d: isSpeaking
                ? generateNovaPath(30 + normLows * 150, time, normMids)
                : generateNovaPath(10, time * 0.2, 0.2),
              strokeOpacity: isSpeaking ? 1 : 0.3,
              strokeWidth: isSpeaking ? 3 + normHighs * 6 : 1.5,
            }}
            transition={{ duration: 0.05, ease: "linear" }}
            fill="none"
            stroke="url(#novaGradient)"
            filter="url(#novaGlow)"
            className="drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]"
          />

          {/* Núcleo Blanco Incandescente */}
          <motion.path
            animate={{
              d: isSpeaking
                ? generateNovaPath(10 + normLows * 70, time, normMids)
                : generateNovaPath(4, time * 0.2, 0.2),
              opacity: isSpeaking ? 1 : 0,
            }}
            transition={{ duration: 0.05, ease: "linear" }}
            fill="none"
            stroke={neonWhite}
            strokeWidth="2"
          />
        </svg>

        {/* ── 4. PRISMATIC RAYS (CHISPAZOS) ── */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleX: [0, 1, 1.5],
                    opacity: [0, 0.8 * normHighs, 0],
                    y: (i - 1) * (20 + normLows * 30),
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-full h-[1px] bg-linear-to-r from-transparent via-white to-transparent mix-blend-screen blur-[1px]"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 5. PULSOS SINÁPTICOS (LLUVIA DE DATOS) ── */}
      <div className="absolute inset-0 flex justify-around items-end pointer-events-none h-full z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: isSpeaking ? [20, 20 + normHighs * 300, 20] : 10,
              opacity: isSpeaking ? [0.1, 0.4, 0.1] : 0.05,
              backgroundColor: isSpeaking ? noctraViolet : "#444",
            }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.03 }}
            className="w-[1px] blur-[1px]"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Genera un path de "Nova" ultra agresivo y fluido con múltiples octavas.
 */
function generateNovaPath(amplitude: number, t: number, m: number) {
  const points = [];
  const width = 1000;
  const centerY = 100;

  for (let x = 0; x <= width; x += 15) {
    const r = x / width;

    // Suma de ondas de diferentes frecuencias para un look "Vivo"
    const w1 = Math.sin(r * Math.PI * 4 + t);
    const w2 = Math.sin(r * Math.PI * 12 - t * 1.5) * 0.5;
    const w3 = Math.cos(r * Math.PI * 2 + t * 0.5) * 0.3;

    // Tapering exponencial para suavizar bordes pero mantener el centro vivo
    const taper = Math.pow(Math.sin(r * Math.PI), 1.2);

    const y = centerY + (w1 + w2 + w3) * amplitude * taper * (1 + m);
    points.push(`${x},${y}`);
  }

  return `M ${points[0]} ${points
    .slice(1)
    .map((p) => `L ${p}`)
    .join(" ")}`;
}
