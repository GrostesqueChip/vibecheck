"use client";

import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

interface ScoreDisplayProps {
  chips: number;
  mult: number;
  total: number;
  hiddenMult?: boolean;
}

function formatValue(value: number, fixed = false) {
  if (fixed || value % 1 !== 0) {
    return value.toFixed(1);
  }
  return Math.round(value).toString();
}

export function ScoreDisplay({
  chips,
  mult,
  total,
  hiddenMult = false,
}: ScoreDisplayProps) {
  const animatedChips = useCountUp(chips, 800);
  const animatedMult = useCountUp(mult, 800);
  const animatedTotal = useCountUp(total, 900);

  return (
    <motion.div
      className="score-display"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="score-pill score-pill-blue">CHIPS: {Math.round(animatedChips)}</div>
      <div className="score-times">×</div>
      <div className="score-pill score-pill-green">
        MULT: {hiddenMult ? "???" : formatValue(animatedMult, true)}
      </div>
      <div className="score-times">=</div>
      <div className="score-pill score-pill-gold">{Math.round(animatedTotal)}</div>
    </motion.div>
  );
}
