import { phraseHasGratitude } from "../data/jokers";
import { applyJokerLabelTransforms, evaluateJokerEffects } from "./useJokers";
import type {
  BackendAnalysisResult,
  GameState,
  JokerTriggerContext,
  ScoreComputation,
  SentimentLabel,
} from "../types/game";

const firstPersonPronouns = [" i ", " me ", " my ", " mine ", " myself "];

function normalizeLabel(analysis: BackendAnalysisResult): SentimentLabel {
  if (analysis.vibe) {
    return analysis.vibe;
  }

  if (analysis.label) {
    return analysis.label;
  }

  const raw = analysis.detailed_metrics?.label ?? analysis.details?.[0]?.label ?? "neutral";
  if (raw === "LABEL_0" || raw === "negative") {
    return "negative";
  }
  if (raw === "LABEL_2" || raw === "positive") {
    return "positive";
  }
  return "neutral";
}

function getConfidence(analysis: BackendAnalysisResult) {
  if (typeof analysis.detailed_metrics?.score === "number") {
    return analysis.detailed_metrics.score;
  }
  return Math.abs(analysis.score ?? 0);
}

function splitWords(phrase: string) {
  return phrase
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function hasFirstPerson(phrase: string) {
  const framed = ` ${phrase.toLowerCase()} `;
  return firstPersonPronouns.some((pronoun) => framed.includes(pronoun));
}

function getVoiceLine(label: SentimentLabel, score: number, isReframe: boolean) {
  if (isReframe) {
    return "You turned the hand around. Beautiful.";
  }
  if (label === "positive") {
    return score >= 1000 ? "POWERFUL HAND!" : "CLEAN! Keep that energy moving.";
  }
  if (label === "negative") {
    return "The oracle senses tension...";
  }
  return "A steady hand. Balanced.";
}

export function calculateScore(
  phrase: string,
  analysis: BackendAnalysisResult,
  state: GameState
): ScoreComputation {
  const words = splitWords(phrase);
  const originalLabel = normalizeLabel(analysis);
  const confidence = getConfidence(analysis);
  const gratitudeMatched = phraseHasGratitude(phrase);

  let preJokerLabel = originalLabel;
  if (state.flags.sunActive && originalLabel === "negative") {
    preJokerLabel = "positive";
  }

  const preliminaryContext: JokerTriggerContext = {
    state,
    phrase,
    words,
    originalLabel,
    effectiveLabel: preJokerLabel,
    confidence,
    positiveCountAfterPlay:
      state.phraseHistory.filter((entry) => entry.effectiveLabel === "positive").length +
      (preJokerLabel === "positive" ? 1 : 0),
    positiveStreakBeforePlay: state.positiveStreak,
    positiveStreakAfterPlay:
      preJokerLabel === "positive" ? state.positiveStreak + 1 : 0,
    gratitudeMatched,
    isReframe: state.flags.pendingReframeBonus && preJokerLabel === "positive",
    blindPhraseCount:
      state.phraseHistory.filter(
        (entry) => entry.ante === state.ante && entry.blindType === state.activeBlind?.type
      ).length + 1,
    highestScoreThisBlind: Math.max(
      0,
      ...state.phraseHistory
        .filter((entry) => entry.ante === state.ante && entry.blindType === state.activeBlind?.type)
        .map((entry) => entry.score)
    ),
  };

  const effectiveLabel = applyJokerLabelTransforms(preliminaryContext, preJokerLabel);
  const isReframe = state.flags.pendingReframeBonus && effectiveLabel === "positive";
  const positiveStreakAfterPlay = effectiveLabel === "positive" ? state.positiveStreak + 1 : 0;
  const positiveCountAfterPlay =
    state.phraseHistory.filter((entry) => entry.effectiveLabel === "positive").length +
    (effectiveLabel === "positive" ? 1 : 0);

  let baseChips = 0;
  let baseMult = 0;

  if (effectiveLabel === "positive") {
    const positiveBase = 50 + Math.round(confidence * 100);
    const armPenalty = state.bossBlindDebuff === "the-arm" ? state.flags.bossPositiveChipPenalty : 0;
    baseChips = Math.max(20, positiveBase - armPenalty);
    baseMult = 4 + state.bonusPositiveMult;
  } else if (effectiveLabel === "neutral") {
    baseChips = 30;
    baseMult = 2;
  } else {
    baseChips = 15;
    baseMult = 1;
  }

  if (effectiveLabel === "positive") {
    baseChips += state.planetLevels.positive * 15;
    baseMult += state.planetLevels.positive * 2;
  }

  if (effectiveLabel === "neutral") {
    baseChips += state.planetLevels.neutral * 10;
    baseMult += state.planetLevels.neutral * 1;
  }

  if (gratitudeMatched) {
    baseChips += state.planetLevels.grateful * 20;
    baseMult += state.planetLevels.grateful * 3;
  }

  if (isReframe) {
    baseChips += state.planetLevels.reframe * 12;
    baseMult += state.planetLevels.reframe * 2;
  }

  let wordChips = words.length * 5;
  const streakRate = state.vouchers.includes("positivity-loop") ? 10 : 5;
  const streakBonus = effectiveLabel === "positive" ? positiveStreakAfterPlay * streakRate : 0;
  baseChips += streakBonus;

  if (state.bossBlindDebuff === "the-broadcast" && words.length < 5) {
    wordChips = 0;
  }

  if (state.bossBlindDebuff === "the-flint") {
    baseChips = Math.floor(baseChips / 2);
  }

  if (state.bossBlindDebuff === "the-doomscroller" && preJokerLabel === "negative") {
    baseChips = 0;
    wordChips = 0;
  }

  const fullContext: JokerTriggerContext = {
    ...preliminaryContext,
    effectiveLabel,
    isReframe,
    positiveCountAfterPlay,
    positiveStreakAfterPlay,
  };

  const jokerEvents = evaluateJokerEffects(fullContext);
  let chipsBeforeMult =
    baseChips + wordChips + jokerEvents.reduce((sum, event) => sum + event.chipsDelta, 0);
  let totalMult = baseMult + jokerEvents.reduce((sum, event) => sum + event.multDelta, 0);

  for (const event of jokerEvents) {
    totalMult *= event.multMultiplier;
  }

  if (state.flags.starActive) {
    totalMult *= 2;
  }

  if (isReframe) {
    totalMult *= 2;
  }

  if (state.bossBlindDebuff === "the-critic" && !hasFirstPerson(phrase)) {
    chipsBeforeMult = Math.floor(chipsBeforeMult / 2);
  }

  if (state.bossBlindDebuff === "the-mirror" && !isReframe && effectiveLabel !== "positive") {
    chipsBeforeMult = Math.floor(chipsBeforeMult / 2);
  }

  const triggeredReplay = jokerEvents.some((event) => event.replayCurrentHand);
  let totalScore = Math.round(chipsBeforeMult * totalMult);

  if (triggeredReplay) {
    totalScore *= 2;
  }

  return {
    originalLabel,
    effectiveLabel,
    confidence,
    words,
    baseChips,
    wordChips,
    chipsBeforeMult,
    baseMult,
    totalMult,
    totalScore,
    jokerEvents,
    voiceLine: getVoiceLine(effectiveLabel, totalScore, isReframe),
    triggeredReplay,
    isReframe,
  };
}
