"use client";

import { motion } from "framer-motion";

interface WordCardProps {
  word: string;
  index: number;
  showBonus: boolean;
  bonusText: string;
}

export function WordCard({ word, index, showBonus, bonusText }: WordCardProps) {
  return (
    <motion.div
      className="word-card"
      initial={{ opacity: 0, y: 48, rotate: 4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 220, damping: 20 }}
    >
      <span>{word}</span>
      {showBonus ? (
        <motion.span
          className="word-card-bonus"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 1, 0], y: [8, -18, -24] }}
          transition={{ delay: index * 0.15 + 0.2, duration: 0.7 }}
        >
          {bonusText}
        </motion.span>
      ) : null}
    </motion.div>
  );
}
