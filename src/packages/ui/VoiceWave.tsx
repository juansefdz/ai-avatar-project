"use client";

import { motion } from "framer-motion";
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

export const VoiceWave: React.FC<VoiceWaveProps> = ({
  frequencies,
  isSpeaking,
}) => {
  const [time, setTime] = useState(0);

  const normLows = Math.min(frequencies.lows / 200, 1.2);
  const normMids = Math.min(frequencies.mids / 150, 1.2);
  const normHighs = Math.min(frequencies.highs / 80, 1.2);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setTime((prev) => prev + 0.03);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden pointer-events-none">
      {/* GLOW DE FONDO SUAVE ESTÁTICO (Sin parpadeo molestoso al hablar) */}
      <motion.div className="absolute w-150 h-75 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-[100%]" />

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <svg
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible mix-blend-screen"
        >
          <defs>
            <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="#06b6d4" /> {/* cyan-500 */}
              <stop offset="50%" stopColor="#ecfeff" /> {/* cyan-50 */}
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#3b82f6" /> {/* blue-500 */}
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* BACKGROUND WAVES (Sleek, slow, decorative) */}
          <motion.path
            animate={{
              d: generateSmoothPath(40, time * 0.5, 0.1),
              strokeOpacity: 0.1,
              strokeWidth: 2,
            }}
            transition={{ duration: 0.05, ease: "linear" }}
            fill="none"
            stroke="url(#blueGradient)"
          />
          <motion.path
            animate={{
              d: generateSmoothPath(20, -time * 0.3, 0.1),
              strokeOpacity: 0.15,
              strokeWidth: 1,
            }}
            transition={{ duration: 0.05, ease: "linear" }}
            fill="none"
            stroke="#67e8f9" // cyan-300
            className="blur-[2px]"
          />

          {/* MAIN SPINE (Bot Speaking o Standby) */}
          <motion.path
            animate={{
              d: isSpeaking
                ? generateSmoothPath(40 + normLows * 120, time * 2, normMids)
                : generateSmoothPath(15, time * 0.5, 0.2),
              strokeOpacity: isSpeaking ? 0.9 : 0.3,
              strokeWidth: isSpeaking ? 3 + normHighs * 5 : 2,
            }}
            transition={{ duration: 0.05, ease: "linear" }}
            fill="none"
            stroke="url(#cyanGradient)"
            filter="url(#cyanGlow)"
          />
        </svg>
      </div>
    </div>
  );
};

function generateSmoothPath(amplitude: number, t: number, m: number) {
  const points = [];
  const width = 1000;
  const centerY = 100;

  for (let x = 0; x <= width; x += 15) {
    const r = x / width;
    const w1 = Math.sin(r * Math.PI * 3 + t);
    const w2 = Math.sin(r * Math.PI * 7 - t * 0.8) * 0.4;

    // Smooth tapering center bulge
    const taper = Math.sin(r * Math.PI);

    const y = centerY + (w1 + w2) * amplitude * taper * (1 + m);
    points.push(`${x},${y}`);
  }

  return `M ${points[0]} ${points
    .slice(1)
    .map((p) => `L ${p}`)
    .join(" ")}`;
}
