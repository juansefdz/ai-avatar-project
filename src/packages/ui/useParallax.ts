"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

export function useMousePosition() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 25 });

  // LA SOLUCIÓN: Validamos si 'window' existe antes de hacer el cálculo.
  // Si estamos en el servidor, devolvemos "50%" por defecto para que no explote.
  const x = useTransform(smoothX, (value) => {
    if (typeof window === "undefined") return "50%";
    return `${(value / window.innerWidth) * 100}%`;
  });
  
  const y = useTransform(smoothY, (value) => {
    if (typeof window === "undefined") return "50%";
    return `${(value / window.innerHeight) * 100}%`;
  });

  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Al montar en el cliente, centramos la luz inicialmente
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    window.addEventListener("mousemove", updateMouse);
    return () => window.removeEventListener("mousemove", updateMouse);
  }, [mouseX, mouseY]);

  return { x, y };
}