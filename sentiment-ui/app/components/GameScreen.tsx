"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { calculateScore } from "../hooks/useScoring";
import { ConsumeableCard } from "./ConsumeableCard";
import { HUD } from "./HUD";
import { JokerCard } from "./JokerCard";
import { ReframePrompt } from "./ReframePrompt";
import { ScoreDisplay } from "./ScoreDisplay";
import { WordCard } from "./WordCard";
import type { BackendAnalysisResult, GameState, PhraseResult } from "../types/game";

interface GameScreenProps {
  state: GameState;
  onResolveHand: (result: Omit<PhraseResult, "runningBlindScore" | "runningRunScore">) => void;
  onUseConsumable: (consumableId: string) => void;
}

interface LocalHandPreview extends Omit<PhraseResult, "runningBlindScore" | "runningRunScore"> {
  key: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
const API_URL = `${API_BASE_URL}/analyze`;

export function GameScreen({ state, onResolveHand, onUseConsumable }: GameScreenProps) {
  const [phrase, setPhrase] = useState("");
  const [reframeText, setReframeText] = useState("");
  const [preview, setPreview] = useState<LocalHandPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeJokerIndex, setActiveJokerIndex] = useState(-1);
  const [burst, setBurst] = useState(false);

  const triggeredEvents = useMemo(
    () => preview?.triggeredJokers.filter((event) => event.triggered) ?? [],
    [preview]
  );

  useEffect(() => {
    if (!triggeredEvents.length) {
      setActiveJokerIndex(-1);
      return;
    }

    setActiveJokerIndex(0);
    const timers = triggeredEvents.map((_, index) =>
      window.setTimeout(() => setActiveJokerIndex(index), index * 380)
    );
    const clearTimer = window.setTimeout(() => setActiveJokerIndex(-1), triggeredEvents.length * 380 + 700);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(clearTimer);
    };
  }, [triggeredEvents]);

  async function playHand(rawPhrase: string) {
    const trimmed = rawPhrase.trim();
    if (!trimmed || busy || !state.activeBlind) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phrase: trimmed }),
      });

      if (!response.ok) {
        throw new Error("oracle");
      }

      const analysis = (await response.json()) as BackendAnalysisResult;
      const score = calculateScore(trimmed, analysis, state);

      const hand: LocalHandPreview = {
        key: crypto.randomUUID(),
        id: crypto.randomUUID(),
        phrase: trimmed,
        words: score.words,
        originalLabel: score.originalLabel,
        effectiveLabel: score.effectiveLabel,
        confidence: score.confidence,
        chipsBeforeMult: score.chipsBeforeMult,
        baseChips: score.baseChips,
        wordChips: score.wordChips,
        baseMult: score.baseMult,
        totalMult: score.totalMult,
        score: score.totalScore,
        blindType: state.activeBlind.type,
        ante: state.ante,
        timestamp: Date.now(),
        isReframe: score.isReframe,
        triggeredJokers: score.jokerEvents,
        voiceLine: score.voiceLine,
      };

      const predictedClear = state.roundScore + hand.score >= state.activeBlind.target;
      setPreview(hand);

      if (predictedClear) {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 900);
      }

      const delay =
        900 + hand.words.length * 60 + score.jokerEvents.filter((event) => event.triggered).length * 180;
      window.setTimeout(() => {
        onResolveHand(hand);
        setBusy(false);
      }, delay);

      setPhrase("");
      setReframeText("");
    } catch {
      setBusy(false);
      setError("The oracle is silent...");
    }
  }

  const moodHistory = state.phraseHistory.slice(-20);
  const hiddenMult = state.bossBlindDebuff === "the-foghorn" && busy;
  const currentJoker = activeJokerIndex >= 0 ? triggeredEvents[activeJokerIndex] : null;

  return (
    <main className="game-screen">
      <HUD state={state} />

      {burst ? <motion.div className="victory-burst" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8 }} /> : null}

      <section className="table-panel">
        <ScoreDisplay
          chips={preview?.chipsBeforeMult ?? 0}
          mult={preview?.totalMult ?? 0}
          total={preview?.score ?? 0}
          hiddenMult={hiddenMult}
        />

        <div className="phrase-stage">
          <div className="phrase-stage-text">{preview?.phrase ? `“${preview.phrase}”` : "Play a hand and let the oracle speak."}</div>
          <div className="word-row">
            {(preview?.words ?? []).map((word, index) => (
              <WordCard
                key={`${preview?.key}-${word}-${index}`}
                word={word}
                index={index}
                showBonus={preview?.wordChips !== 0}
                bonusText={preview?.wordChips === 0 ? "+0" : "+5"}
              />
            ))}
          </div>
          <div className="voice-line">{preview?.voiceLine ?? "Positive self-talk pays out bigger, but every hand teaches."}</div>
        </div>

        <form
          className="play-form"
          onSubmit={(event) => {
            event.preventDefault();
            void playHand(phrase);
          }}
        >
          <input
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            placeholder="Type your phrase here..."
            disabled={busy}
          />
          <button type="submit" disabled={busy || !phrase.trim()}>
            Play Hand 🃏
          </button>
        </form>

        <div className="submission-dots">
          {Array.from({ length: Math.max(1, state.submissionsLeft) }).map((_, index) => (
            <span key={`dot-${index}`} />
          ))}
        </div>

        {error ? <div className="oracle-error">{error}</div> : null}
      </section>

      <ReframePrompt
        visible={Boolean(state.flags.pendingReframeBonus)}
        originalPhrase={state.flags.pendingReframePhrase}
        value={reframeText}
        onChange={setReframeText}
        onSubmit={() => {
          void playHand(reframeText);
        }}
        disabled={busy}
      />

      <section className="panel-grid">
        <div className="bottom-panel">
          <div className="panel-title">Jokers</div>
          <div className="joker-row">
            {Array.from({ length: state.jokerSlots }).map((_, index) => {
              const joker = state.jokers[index];
              const trigger = currentJoker && joker?.id === currentJoker.jokerId ? currentJoker.label : null;
              return <JokerCard key={joker?.id ?? `empty-joker-${index}`} joker={joker} active={Boolean(trigger)} triggerText={trigger} />;
            })}
          </div>
        </div>

        <div className="bottom-panel">
          <div className="panel-title">Consumables</div>
          <div className="consumeable-row">
            {Array.from({ length: 2 }).map((_, index) => {
              const item = state.consumables[index];
              return (
                <ConsumeableCard
                  key={item?.id ?? `empty-consumable-${index}`}
                  item={item}
                  onUse={item ? () => onUseConsumable(item.id) : null}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel-grid">
        <div className="bottom-panel">
          <div className="panel-title">Planet Levels</div>
          <div className="planet-list">
            <div>Mercury ☿: {state.planetLevels.positive}</div>
            <div>Venus ♀: {state.planetLevels.grateful}</div>
            <div>Earth 🌍: {state.planetLevels.neutral}</div>
            <div>Mars ♂: {state.planetLevels.reframe}</div>
          </div>
        </div>

        {state.vouchers.includes("mood-tracker") ? (
          <div className="bottom-panel">
            <div className="panel-title">Mood Tracker</div>
            <div className="mood-graph">
              {moodHistory.map((entry) => (
                <span key={entry.id} className={`mood-bar mood-${entry.effectiveLabel}`} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
