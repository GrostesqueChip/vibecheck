"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { RunSummary as RunSummaryType } from "../types/game";

interface RunSummaryProps {
  summary: RunSummaryType | null;
  onNewRun: () => void;
  onMenu: () => void;
}

function playSting(win: boolean) {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const notes = win ? [261.63, 329.63, 392.0, 523.25] : [392.0, 329.63, 261.63];
  notes.forEach((note, index) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.value = note;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(context.destination);
    const start = context.currentTime + index * 0.11;
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

export function RunSummary({ summary, onNewRun, onMenu }: RunSummaryProps) {
  useEffect(() => {
    if (!summary) {
      return;
    }
    playSting(summary.result === "win");
  }, [summary]);

  if (!summary) {
    return null;
  }

  const total = Math.max(1, summary.positiveCount + summary.neutralCount + summary.negativeCount);

  return (
    <main className="screen-shell">
      <motion.section
        className="summary-panel"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="screen-heading">
          <h2>{summary.result === "win" ? "Run Complete" : "Game Over"}</h2>
          <p>{summary.insight}</p>
        </div>

        <div className="summary-score">{summary.totalScore.toLocaleString()}</div>
        <div className="summary-metrics">
          <div className="summary-metric">
            <span>Ante Reached</span>
            <strong>{summary.anteReached}</strong>
          </div>
          <div className="summary-metric">
            <span>Longest Streak</span>
            <strong>{summary.longestPositiveStreak}</strong>
          </div>
          <div className="summary-metric">
            <span>Highest Hand</span>
            <strong>{summary.highestSingleScore.toLocaleString()}</strong>
          </div>
        </div>

        <div className="summary-chart">
          <div className="summary-bar summary-bar-positive" style={{ width: `${(summary.positiveCount / total) * 100}%` }}>
            Positive {summary.positiveCount}
          </div>
          <div className="summary-bar summary-bar-neutral" style={{ width: `${(summary.neutralCount / total) * 100}%` }}>
            Neutral {summary.neutralCount}
          </div>
          <div className="summary-bar summary-bar-negative" style={{ width: `${(summary.negativeCount / total) * 100}%` }}>
            Negative {summary.negativeCount}
          </div>
        </div>

        <div className="menu-actions">
          <button className="menu-button menu-button-primary" onClick={onNewRun} type="button">
            New Run
          </button>
          <button className="menu-button" onClick={onMenu} type="button">
            Main Menu
          </button>
        </div>
      </motion.section>
    </main>
  );
}
