"use client";

import { motion } from "framer-motion";
import type { ConsumableInstance } from "../types/game";

interface ConsumeableCardProps {
  item?: ConsumableInstance | null;
  onUse?: (() => void) | null;
  showCost?: boolean;
}

export function ConsumeableCard({
  item,
  onUse = null,
  showCost = false,
}: ConsumeableCardProps) {
  if (!item) {
    return <div className="consumeable-card consumeable-card-empty">EMPTY</div>;
  }

  return (
    <motion.div
      className={`consumeable-card consumeable-${item.kind}`}
      whileHover={{ scale: 1.05, rotate: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
    >
      <div className="consumeable-art">{item.art}</div>
      <div className="consumeable-name">{item.name}</div>
      <p className="consumeable-text">{item.description}</p>
      <div className="consumeable-footer">
        <span>{item.kind.toUpperCase()}</span>
        <span>{showCost ? `💫${item.cost}` : "Single Use"}</span>
      </div>
      {onUse ? (
        <button className="mini-card-button" onClick={onUse} type="button">
          Use
        </button>
      ) : null}
    </motion.div>
  );
}
