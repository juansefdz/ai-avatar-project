"use client";

import { useState, useEffect, useRef } from "react";

export function useAudioProcessor(stream: MediaStream | null) {
  const [volume, setVolume] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // CORRECCIÓN 1: Siempre inicializar con null para satisfacer a TS
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) return;

    // CORRECCIÓN 2: Evitar 'any' extendiendo el tipo de Window para webkitAudioContext
    const AudioContextClass = (window.AudioContext || 
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);

    if (!AudioContextClass) {
      console.error("Este navegador no soporta Web Audio API");
      return;
    }

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
  if (!analyserRef.current) return;
  
  analyserRef.current.getByteFrequencyData(dataArray);
  
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  const average = sum / bufferLength;

  
  setVolume(prev => prev + (average - prev) * 0.2); 

  // Umbral de sensibilidad
  setIsSpeaking(average > 15); 

  animationRef.current = requestAnimationFrame(updateVolume);
};
    updateVolume();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream]);

  return { volume, isSpeaking };
}