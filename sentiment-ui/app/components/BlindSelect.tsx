"use client";

import { motion } from "framer-motion";
import { getBlindInstance } from "../data/blinds";
import type { BlindType, GameState } from "../types/game";

interface BlindSelectProps {
  state: GameState;
  onSelect: (blindType: BlindType) => void;
  onSkip: () => void;
}

const blindOrder: BlindType[] = ["small", "big", "boss"];

export function BlindSelect({ state, onSelect, onSkip }: BlindSelectProps) {
  const revealBoss = state.vouchers.includes("focus-mode") || state.blindIndex >= 2;

  return (
    <main className="screen-shell">
      <div className="screen-heading">
        <h2>Pick Your Blind</h2>
        <p>Ante {state.ante}. Warm hands, steady heart.</p>
      </div>

      <div className="blind-grid">
        {blindOrder.map((blindType, index) => {
          const blind = getBlindInstance(state.ante, blindType);
          const isCurrent = state.blindIndex === index;
          const locked = state.blindIndex < index;
          const bossName = blind.boss ? (revealBoss ? blind.boss.name : "Boss Blind") : blind.title;
          const bossText = blind.boss
            ? revealBoss
              ? blind.boss.description
              : "Hidden until you are ready to commit."
            : "A clean table to build momentum.";

          return (
            <motion.div
              key={blindType}
              className={`blind-card ${isCurrent ? "blind-card-active" : ""} ${locked ? "blind-card-locked" : ""}`}
              whileHover={locked ? undefined : { scale: 1.05, rotate: -2 }}
            >
              <div className="blind-card-title">
                <span>{blind.icon}</span>
                <span>{bossName}</span>
              </div>
              <div className="blind-card-target">Target: {blind.target.toLocaleString()}</div>
              <div className="blind-card-text">{bossText}</div>
              <div className="blind-card-meta">
                <span>{blind.hands} hands</span>
                <span>Reward 💫{blind.reward}</span>
              </div>
              {isCurrent ? (
                <div className="blind-card-actions">
                  <button className="menu-button menu-button-primary" onClick={() => onSelect(blindType)} type="button">
                    SELECT
                  </button>
                  {blindType !== "boss" ? (
                    <button className="ghost-button" onClick={onSkip} type="button">
                      SKIP
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="blind-card-status">{locked ? "LOCKED" : "WAITING"}</div>
              )}
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
