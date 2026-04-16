"use client";

import { motion } from "framer-motion";
import { achievementDefinitions } from "../data/achievements";
import { jokerDefinitions } from "../data/jokers";
import type { AchievementId, JokerId, RunSummary } from "../types/game";

interface MainMenuProps {
  mode: "menu" | "collection" | "high-scores";
  achievements: AchievementId[];
  discoveredJokers: JokerId[];
  highScores: RunSummary[];
  onNewRun: () => void;
  onShowCollection: () => void;
  onShowHighScores: () => void;
  onBack: () => void;
}

export function MainMenu({
  mode,
  achievements,
  discoveredJokers,
  highScores,
  onNewRun,
  onShowCollection,
  onShowHighScores,
  onBack,
}: MainMenuProps) {
  return (
    <main className="screen-shell">
      <motion.div
        className="menu-logo"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1>VIBECHECK</h1>
        <p>How does the world feel today?</p>
      </motion.div>

      {mode === "menu" ? (
        <motion.div
          className="menu-actions"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <button className="menu-button menu-button-primary" onClick={onNewRun} type="button">
            NEW RUN
          </button>
          <button className="menu-button" onClick={onShowCollection} type="button">
            COLLECTION
          </button>
          <button className="menu-button" onClick={onShowHighScores} type="button">
            HIGH SCORES
          </button>
        </motion.div>
      ) : null}

      {mode === "collection" ? (
        <section className="menu-panel">
          <div className="menu-panel-header">
            <h2>Collection</h2>
            <button className="ghost-button" onClick={onBack} type="button">
              Back
            </button>
          </div>
          <div className="collection-grid">
            {jokerDefinitions.map((joker) => {
              const unlocked = discoveredJokers.includes(joker.id);
              return (
                <div key={joker.id} className={`collection-card ${unlocked ? "collection-card-unlocked" : ""}`}>
                  <div className="collection-icon">{unlocked ? joker.art : "?"}</div>
                  <div className="collection-title">{unlocked ? joker.name : "Undiscovered Joker"}</div>
                  <div className="collection-text">{unlocked ? joker.description : "Keep playing runs to reveal this card."}</div>
                </div>
              );
            })}
          </div>
          <div className="achievement-strip">
            {achievementDefinitions.map((achievement) => {
              const unlocked = achievements.includes(achievement.id);
              return (
                <div key={achievement.id} className={`achievement-card ${unlocked ? "achievement-card-unlocked" : ""}`}>
                  <span>{achievement.icon}</span>
                  <div>{achievement.title}</div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {mode === "high-scores" ? (
        <section className="menu-panel">
          <div className="menu-panel-header">
            <h2>High Scores</h2>
            <button className="ghost-button" onClick={onBack} type="button">
              Back
            </button>
          </div>
          <div className="score-list">
            {highScores.length ? (
              highScores.map((score, index) => (
                <div key={score.id} className="score-row">
                  <span>#{index + 1}</span>
                  <span>{score.totalScore.toLocaleString()}</span>
                  <span>Ante {score.anteReached}</span>
                  <span>{score.result.toUpperCase()}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No runs banked yet. Start a table and make some noise.</div>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
