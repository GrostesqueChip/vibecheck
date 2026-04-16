"use client";

import { motion } from "framer-motion";
import type { GameState } from "../types/game";

interface HUDProps {
  state: GameState;
}

export function HUD({ state }: HUDProps) {
  const target = state.activeBlind?.target ?? 1;
  const progress = Math.min((state.roundScore / target) * 100, 100);
  const blindName = state.activeBlind?.boss ? state.activeBlind.boss.name : state.activeBlind?.title;

  return (
    <div className="hud-shell">
      <div className="hud-topline">
        <div className="hud-lives">{"❤️".repeat(state.lives)}</div>
        <div className="hud-title">
          ANTE {state.ante} / {blindName ?? "Choose Blind"}
        </div>
        <div className="hud-currency">💫 {state.goodVibes}</div>
      </div>
      <div className="hud-progress">
        <div className="hud-progress-label">
          <span>Target</span>
          <span>
            {state.roundScore} / {target}
          </span>
        </div>
        <div className="progress-rail">
          <motion.div
            className="progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="hud-meta">
        <div className="hud-chip">🔥 Streak ×{state.positiveStreak}</div>
        <div className="hud-chip">Hands {state.submissionsLeft}</div>
        {state.bossBlindDebuff ? <div className="hud-chip hud-chip-danger">Boss: {state.bossBlindDebuff}</div> : null}
      </div>
    </div>
  );
}
