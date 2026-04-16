"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const previousRef = useRef(target);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const initial = previousRef.current;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = initial + (target - initial) * eased;
      setValue(next);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    previousRef.current = target;
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
