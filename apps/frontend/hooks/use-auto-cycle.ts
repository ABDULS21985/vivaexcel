"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseAutoCycleOptions {
  /** Total number of items to cycle through */
  total: number;
  /** Interval in milliseconds between cycles. Default: 3000 */
  interval?: number;
  /** Whether auto-cycling is initially enabled. Default: false */
  autoStart?: boolean;
}

interface UseAutoCycleReturn {
  /** Current active index */
  current: number;
  /** Whether auto-cycling is active */
  isPlaying: boolean;
  /** Go to a specific index (pauses auto-cycle) */
  goTo: (index: number) => void;
  /** Go to next item */
  next: () => void;
  /** Go to previous item */
  prev: () => void;
  /** Toggle auto-cycle on/off */
  toggle: () => void;
  /** Progress of current interval (0 to 1) */
  progress: number;
}

export function useAutoCycle(options: UseAutoCycleOptions): UseAutoCycleReturn {
  const { total, interval = 3000, autoStart = false } = options;
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoStart);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const frameRef = useRef<number>(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
    startTimeRef.current = Date.now();
    setProgress(0);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
    startTimeRef.current = Date.now();
    setProgress(0);
  }, [total]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setIsPlaying(false);
    startTimeRef.current = Date.now();
    setProgress(0);
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
    startTimeRef.current = Date.now();
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!isPlaying || total <= 1) return;

    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / interval, 1);
      setProgress(p);

      if (p >= 1) {
        next();
      } else {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, interval, total, next, current]);

  return { current, isPlaying, goTo, next, prev, toggle, progress };
}

export default useAutoCycle;
