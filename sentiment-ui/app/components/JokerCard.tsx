"use client";

import { motion } from "framer-motion";
import type { JokerInstance } from "../types/game";

interface JokerCardProps {
  joker?: JokerInstance | null;
  active?: boolean;
  triggerText?: string | null;
  onSell?: (() => void) | null;
  showCost?: boolean;
}

export function JokerCard({
  joker,
  active = false,
  triggerText,
  onSell = null,
  showCost = false,
}: JokerCardProps) {
  if (!joker) {
    return <div className="joker-card joker-card-empty">EMPTY</div>;
  }

  return (
    <motion.div
      className={`joker-card rarity-${joker.rarity.toLowerCase()} ${active ? "joker-card-active" : ""}`}
      whileHover={{ scale: 1.05, rotate: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
    >
      <div className="joker-card-corner">J</div>
      <div className="joker-card-art">{joker.art}</div>
      <div className="joker-card-name">{joker.name}</div>
      <p className="joker-card-text">{joker.description}</p>
      <div className="joker-card-footer">
        <span>{joker.rarity}</span>
        <span>{showCost ? `💫${joker.cost}` : `Sell 💫${joker.sellValue}`}</span>
      </div>
      {onSell ? (
        <button className="mini-card-button" onClick={onSell} type="button" disabled={joker.cannotSell}>
          {joker.cannotSell ? "Locked" : "Sell"}
        </button>
      ) : null}
      {triggerText ? (
        <motion.div
          className="joker-popup"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 0], y: [10, -10, -20] }}
          transition={{ duration: 0.9 }}
        >
          {triggerText}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
