"use client";

import { useState, useEffect, useRef } from "react";

export function useAudioProcessor(stream: MediaStream | null) {
  const [volume, setVolume] = useState(0);
  const [frequencies, setFrequencies] = useState({
    lows: 0,
    mids: 0,
    highs: 0,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      console.error("Este navegador no soporta Web Audio API");
      return;
    }

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 512;

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioData = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      let lowSum = 0;
      let midSum = 0;
      let highSum = 0;

      const lowCount = Math.floor(bufferLength * 0.15);
      const midCount = Math.floor(bufferLength * 0.45);

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        sum += val;

        if (i < lowCount) lowSum += val;
        else if (i < midCount) midSum += val;
        else highSum += val;
      }

      const average = sum / bufferLength;

      // Suavizado (Smoothing)
      setVolume((prev) => prev + (average - prev) * 0.3);
      setFrequencies({
        lows: lowSum / lowCount,
        mids: midSum / (midCount - lowCount),
        highs: highSum / (bufferLength - midCount),
      });

      setIsSpeaking(average > 10);

      animationRef.current = requestAnimationFrame(updateAudioData);
    };

    updateAudioData();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, [stream]);

  return { volume, frequencies, isSpeaking };
}
