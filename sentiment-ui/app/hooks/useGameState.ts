"use client";

import { useEffect, useReducer } from "react";
import { achievementDefinitions } from "../data/achievements";
import { getBlindInstance } from "../data/blinds";
import { jokerDefinitions, jokerDefinitionsById } from "../data/jokers";
import { planetDefinitions } from "../data/planets";
import { tagDefinitions } from "../data/tags";
import { tarotDefinitions } from "../data/tarots";
import { voucherDefinitions } from "../data/vouchers";
import type {
  AchievementId,
  BlindType,
  ConsumableInstance,
  GameState,
  JokerInstance,
  JokerRarity,
  PhraseResult,
  RunSummary,
  Screen,
  ShopState,
  VoucherId,
} from "../types/game";

const STORAGE_KEYS = {
  achievements: "vibecheck.achievements",
  highScores: "vibecheck.highScores",
  discoveredJokers: "vibecheck.discoveredJokers",
} as const;

const emptyShop: ShopState = {
  jokerOffers: [],
  tarotOffer: null,
  planetOffer: null,
  voucherOffer: null,
};

type GameAction = {
  type: "update";
  updater: (current: GameState) => GameState;
};

function reducer(state: GameState, action: GameAction) {
  return action.updater(state);
}

function randomFrom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function rarityWeight(rarity: JokerRarity) {
  if (rarity === "Legendary") return 2;
  if (rarity === "Rare") return 10;
  if (rarity === "Uncommon") return 25;
  return 63;
}

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

function cloneJoker(id: JokerInstance["id"]) {
  return { ...jokerDefinitionsById[id] };
}

function createInitialState(): GameState {
  const achievements = readStorage<AchievementId[]>(STORAGE_KEYS.achievements, []);
  const highScores = readStorage<RunSummary[]>(STORAGE_KEYS.highScores, []);
  const discovered = readStorage<JokerInstance["id"][]>(STORAGE_KEYS.discoveredJokers, []);

  return {
    screen: "menu",
    ante: 1,
    blindIndex: 0,
    lives: 3,
    goodVibes: 0,
    runScore: 0,
    roundScore: 0,
    submissionsLeft: 0,
    positiveStreak: 0,
    longestPositiveStreak: 0,
    positiveHandLevel: 0,
    neutralHandLevel: 0,
    gratefulness: 0,
    jokers: [cloneJoker("the-optimist")],
    consumables: [],
    vouchers: [],
    phraseHistory: [],
    achievements,
    bossBlindDebuff: null,
    highScores,
    currentSummary: null,
    discoveredJokers: Array.from(new Set([...discovered, "the-optimist"])),
    jokerSlots: 5,
    activeBlind: null,
    blindStatus: "idle",
    shop: emptyShop,
    blindResults: [],
    tags: [],
    planetLevels: { positive: 0, grateful: 0, neutral: 0, reframe: 0 },
    bonusPositiveMult: 0,
    highestSingleScore: 0,
    collectionView: "jokers",
    flags: {
      lastWasNegative: false,
      pendingReframePhrase: null,
      pendingReframeBonus: false,
      judgementReady: false,
      judgementTarget: null,
      freeSubmission: false,
      starActive: false,
      sunActive: false,
      blindReplayUsed: false,
      nextShopGuaranteedRare: false,
      doubleNextBlindReward: false,
      bossPositiveChipPenalty: 0,
    },
  };
}

function blindTypeFromIndex(index: number): BlindType {
  return (["small", "big", "boss"] as const)[index];
}

function nextBlindPosition(ante: number, blindIndex: number) {
  if (blindIndex < 2) {
    return { ante, blindIndex: blindIndex + 1 };
  }
  return { ante: ante + 1, blindIndex: 0 };
}

function clampConsumables(items: ConsumableInstance[]) {
  return items.slice(0, 2);
}

function uniqueAchievements(current: AchievementId[], additions: AchievementId[]) {
  return Array.from(new Set([...current, ...additions]));
}

function sortedHighScores(items: RunSummary[]) {
  return [...items].sort((left, right) => right.totalScore - left.totalScore).slice(0, 8);
}

function pickWeightedJoker(pool: JokerInstance[]) {
  const weighted: JokerInstance[] = [];
  for (const joker of pool) {
    for (let count = 0; count < rarityWeight(joker.rarity); count += 1) {
      weighted.push(joker);
    }
  }
  return { ...randomFrom(weighted) };
}

function rollShop(state: GameState) {
  const offerCount = state.vouchers.includes("abundance") ? 3 : 2;
  const pool = jokerDefinitions
    .filter((joker) => joker.id !== "the-optimist")
    .map((joker) => ({ ...joker }));
  const offers: JokerInstance[] = [];

  if (state.flags.nextShopGuaranteedRare) {
    const rarePool = pool.filter((joker) => joker.rarity === "Rare" || joker.rarity === "Legendary");
    if (rarePool.length) {
      offers.push(pickWeightedJoker(rarePool));
    }
  }

  while (offers.length < offerCount) {
    const remaining = pool.filter((joker) => !offers.some((offer) => offer.id === joker.id));
    if (!remaining.length) break;
    offers.push(pickWeightedJoker(remaining));
  }

  const voucherOffer = voucherDefinitions.find((voucher) => !state.vouchers.includes(voucher.id)) ?? null;
  return {
    jokerOffers: offers,
    tarotOffer: randomFrom(tarotDefinitions),
    planetOffer: randomFrom(planetDefinitions),
    voucherOffer,
  };
}

function pickInsight(state: GameState, result: "win" | "loss") {
  const counts = {
    positive: state.phraseHistory.filter((entry) => entry.effectiveLabel === "positive").length,
    neutral: state.phraseHistory.filter((entry) => entry.effectiveLabel === "neutral").length,
    negative: state.phraseHistory.filter((entry) => entry.effectiveLabel === "negative").length,
  };
  const positive = [
    "Your strongest hands came from language that sounded like self-trust.",
    "You kept building toward warmth instead of panic. That matters.",
    "Consistency carried this run more than luck did.",
  ];
  const neutral = [
    "You found steadiness often enough to make it a pattern.",
    "Balance showed up here. Calm can be its own kind of power.",
  ];
  const negative = [
    "Even the rough hands became information instead of a full stop.",
    "The harder phrases did not end the run. They shaped the next move.",
  ];

  if (result === "win" && state.jokers.some((joker) => joker.id === "the-eternal-optimist")) {
    return "You carried a Legendary Optimist all the way to the lights. That is a statement.";
  }
  if (counts.positive >= counts.neutral && counts.positive >= counts.negative) return randomFrom(positive);
  if (counts.neutral >= counts.negative) return randomFrom(neutral);
  return randomFrom(negative);
}

function makeSummary(state: GameState, result: "win" | "loss"): RunSummary {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    totalScore: state.runScore,
    anteReached: state.ante,
    result,
    positiveCount: state.phraseHistory.filter((entry) => entry.effectiveLabel === "positive").length,
    neutralCount: state.phraseHistory.filter((entry) => entry.effectiveLabel === "neutral").length,
    negativeCount: state.phraseHistory.filter((entry) => entry.effectiveLabel === "negative").length,
    longestPositiveStreak: state.longestPositiveStreak,
    highestSingleScore: state.highestSingleScore,
    insight: pickInsight(state, result),
    achievements: state.achievements,
  };
}

function unlockAchievements(
  state: GameState,
  additions: AchievementId[] = [],
  result?: "win" | "loss"
) {
  const next = [...additions];
  if (state.positiveStreak >= 5) next.push("glass-half-full");
  if (state.phraseHistory.length >= 20) next.push("journaler");
  if (result === "win" && state.jokers.some((joker) => joker.id === "the-eternal-optimist")) {
    next.push("legendary-optimist");
  }
  return uniqueAchievements(state.achievements, next);
}

function finishRun(state: GameState, result: "win" | "loss") {
  const achievements = unlockAchievements(state, [], result);
  const summaryState = { ...state, achievements };
  const currentSummary = makeSummary(summaryState, result);

  return {
    ...summaryState,
    currentSummary,
    highScores: sortedHighScores([currentSummary, ...summaryState.highScores]),
    screen: "summary" as Screen,
  };
}

function finishBlind(state: GameState, cleared: boolean, livesLost = 0): GameState {
  if (!state.activeBlind) return state;

  const rewardMultiplier = state.flags.doubleNextBlindReward ? 2 : 1;
  const rewardEarned = state.activeBlind.reward * rewardMultiplier + (cleared ? state.submissionsLeft : 0);
  const lives = Math.max(0, state.lives - livesLost);
  const nextPos = nextBlindPosition(state.ante, state.blindIndex);
  const baseState: GameState = {
    ...state,
    ante: nextPos.ante,
    blindIndex: nextPos.blindIndex,
    lives,
    goodVibes: state.goodVibes + rewardEarned,
    blindResults: [
      ...state.blindResults,
      {
        ante: state.activeBlind.ante,
        blindType: state.activeBlind.type,
        cleared,
        target: state.activeBlind.target,
        score: state.roundScore,
        handsUsed: state.activeBlind.hands - state.submissionsLeft,
        rewardEarned,
      },
    ],
    activeBlind: null,
    bossBlindDebuff: null,
    roundScore: 0,
    submissionsLeft: 0,
    blindStatus: cleared ? "cleared" : "failed",
    flags: {
      ...state.flags,
      pendingReframePhrase: null,
      pendingReframeBonus: false,
      judgementReady: false,
      judgementTarget: null,
      freeSubmission: false,
      starActive: false,
      sunActive: false,
      blindReplayUsed: false,
      doubleNextBlindReward: false,
      bossPositiveChipPenalty: 0,
    },
  };

  const finalBoss = state.activeBlind.type === "boss" && state.ante >= 8;
  if (finalBoss) return finishRun(baseState, cleared ? "win" : "loss");
  if (lives <= 0) return finishRun(baseState, "loss");

  const shopState = { ...baseState };
  const shop = rollShop(shopState);
  return {
    ...shopState,
    shop,
    screen: "shop",
    flags: {
      ...shopState.flags,
      nextShopGuaranteedRare: false,
    },
  };
}

function startBlind(state: GameState, blindType: BlindType) {
  const blind = getBlindInstance(state.ante, blindType);
  const extraHands = state.vouchers.includes("lucky-pen") ? 1 : 0;
  const baseHands = blind.type === "boss" && blind.boss?.id === "the-wall" ? 2 : blind.hands;

  return {
    ...state,
    screen: "game" as Screen,
    activeBlind: blind,
    bossBlindDebuff: blind.boss?.id ?? null,
    blindStatus: "active" as const,
    roundScore: 0,
    submissionsLeft: baseHands + extraHands,
    flags: {
      ...state.flags,
      pendingReframePhrase: null,
      pendingReframeBonus: false,
      blindReplayUsed: false,
      bossPositiveChipPenalty: 0,
    },
  };
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(state.achievements));
    localStorage.setItem(STORAGE_KEYS.highScores, JSON.stringify(state.highScores));
    localStorage.setItem(STORAGE_KEYS.discoveredJokers, JSON.stringify(state.discoveredJokers));
  }, [state.achievements, state.highScores, state.discoveredJokers]);

  function update(updater: (current: GameState) => GameState) {
    dispatch({ type: "update", updater });
  }

  function startNewRun() {
    update((current) => {
      const fresh = createInitialState();
      return {
        ...fresh,
        achievements: current.achievements,
        highScores: current.highScores,
        discoveredJokers: Array.from(new Set([...current.discoveredJokers, "the-optimist"])),
        screen: "blind-select",
      };
    });
  }

  function setScreen(screen: Screen) {
    update((current) => ({ ...current, screen }));
  }

  function setCollectionView(view: GameState["collectionView"]) {
    update((current) => ({ ...current, collectionView: view }));
  }

  function selectBlind(blindType: BlindType) {
    update((current) => startBlind(current, blindType));
  }

  function skipBlind() {
    update((current) => {
      if (current.blindIndex >= 2) return current;

      const tag = randomFrom(tagDefinitions);
      const nextPos = nextBlindPosition(current.ante, current.blindIndex);
      let nextState: GameState = {
        ...current,
        ante: nextPos.ante,
        blindIndex: nextPos.blindIndex,
        tags: [tag.id, ...current.tags].slice(0, 8),
      };

      if (tag.id === "rare-tag") {
        nextState = {
          ...nextState,
          flags: { ...nextState.flags, nextShopGuaranteedRare: true },
        };
      } else if (tag.id === "double-tag") {
        nextState = {
          ...nextState,
          flags: { ...nextState.flags, doubleNextBlindReward: true },
        };
      } else if (tag.id === "tarot-tag" && nextState.consumables.length < 2) {
        nextState = {
          ...nextState,
          consumables: clampConsumables([...nextState.consumables, randomFrom(tarotDefinitions)]),
        };
      } else if (tag.id === "planet-tag" && nextState.consumables.length < 2) {
        nextState = {
          ...nextState,
          consumables: clampConsumables([...nextState.consumables, randomFrom(planetDefinitions)]),
        };
      } else if (tag.id === "juggle-tag") {
        nextState = { ...nextState, jokerSlots: nextState.jokerSlots + 1 };
      }

      return nextState;
    });
  }

  function resolveHand(result: Omit<PhraseResult, "runningBlindScore" | "runningRunScore">) {
    update((current) => {
      const submissionsLeft = Math.max(0, current.submissionsLeft - (current.flags.freeSubmission ? 0 : 1));
      const positiveStreak = result.effectiveLabel === "positive" ? current.positiveStreak + 1 : 0;
      const achieved: AchievementId[] = [];
      if (result.isReframe) achieved.push("silver-lining");

      const phraseResult: PhraseResult = {
        ...result,
        runningBlindScore: current.roundScore + result.score,
        runningRunScore: current.runScore + result.score,
      };

      let nextState: GameState = {
        ...current,
        roundScore: current.roundScore + result.score,
        runScore: current.runScore + result.score,
        submissionsLeft,
        positiveStreak,
        longestPositiveStreak: Math.max(current.longestPositiveStreak, positiveStreak),
        phraseHistory: [...current.phraseHistory, phraseResult],
        gratefulness: current.gratefulness + (result.phrase.toLowerCase().includes("thank") ? 1 : 0),
        highestSingleScore: Math.max(current.highestSingleScore, result.score),
        discoveredJokers: Array.from(new Set([...current.discoveredJokers, ...current.jokers.map((joker) => joker.id)])),
        flags: {
          ...current.flags,
          lastWasNegative: result.effectiveLabel === "negative",
          pendingReframePhrase:
            result.effectiveLabel === "negative" ||
            (current.bossBlindDebuff === "the-mirror" && !result.isReframe && result.effectiveLabel !== "positive")
              ? result.phrase
              : result.isReframe
                ? null
                : current.flags.pendingReframePhrase,
          pendingReframeBonus:
            result.effectiveLabel === "negative" ||
            (current.bossBlindDebuff === "the-mirror" && !result.isReframe && result.effectiveLabel !== "positive")
              ? true
              : result.isReframe
                ? false
                : current.flags.pendingReframeBonus,
          judgementReady: false,
          judgementTarget: null,
          freeSubmission: false,
          starActive: false,
          sunActive: current.flags.sunActive && result.originalLabel !== "negative",
          blindReplayUsed:
            current.flags.blindReplayUsed || result.triggeredJokers.some((event) => event.replayCurrentHand),
          bossPositiveChipPenalty:
            current.bossBlindDebuff === "the-arm"
              ? current.flags.bossPositiveChipPenalty + 10
              : current.flags.bossPositiveChipPenalty,
        },
      };

      nextState = {
        ...nextState,
        achievements: unlockAchievements(nextState, achieved),
      };

      if (nextState.activeBlind && nextState.roundScore >= nextState.activeBlind.target) {
        const comeback =
          nextState.activeBlind.type === "boss" && nextState.submissionsLeft === 1
            ? ["the-comeback" as AchievementId]
            : [];
        const clearedState = {
          ...nextState,
          achievements: uniqueAchievements(nextState.achievements, comeback),
        };
        return finishBlind(clearedState, true);
      }

      if (nextState.submissionsLeft <= 0) {
        return finishBlind(nextState, false, 1);
      }

      return nextState;
    });
  }

  function useConsumable(consumableId: string) {
    update((current) => {
      const consumable = current.consumables.find((item) => item.id === consumableId);
      if (!consumable) return current;

      const remaining = current.consumables.filter((item) => item.id !== consumableId);

      if (consumable.id === "the-star") return { ...current, consumables: remaining, flags: { ...current.flags, starActive: true } };
      if (consumable.id === "the-sun") return { ...current, consumables: remaining, flags: { ...current.flags, sunActive: true } };
      if (consumable.id === "the-world") return { ...current, consumables: remaining, bonusPositiveMult: current.bonusPositiveMult + 2 };
      if (consumable.id === "the-moon") return { ...current, consumables: remaining, flags: { ...current.flags, freeSubmission: true } };
      if (consumable.id === "judgement") {
        const targets = current.jokers.map((joker) => joker.id).filter((id) => id !== "the-eternal-optimist");
        return {
          ...current,
          consumables: remaining,
          flags: {
            ...current.flags,
            judgementReady: targets.length > 0,
            judgementTarget: targets.length ? randomFrom(targets) : null,
          },
        };
      }
      if (consumable.id === "the-tower") {
        if (current.lives <= 1) return current;
        return finishBlind({ ...current, consumables: remaining, lives: current.lives - 1 }, true);
      }
      if (consumable.id === "wheel-of-fortune") {
        if (!current.jokers.length) return { ...current, consumables: remaining };
        const rarityUpgrade: Record<JokerRarity, JokerRarity> = {
          Common: "Uncommon",
          Uncommon: "Rare",
          Rare: "Legendary",
          Legendary: "Legendary",
        };
        const chosen = randomFrom(current.jokers);
        return {
          ...current,
          consumables: remaining,
          jokers: current.jokers.map((joker) =>
            joker.id === chosen.id ? { ...joker, rarity: rarityUpgrade[joker.rarity], upgraded: true } : joker
          ),
        };
      }
      if (consumable.id === "mercury") {
        return {
          ...current,
          consumables: remaining,
          positiveHandLevel: current.positiveHandLevel + 1,
          planetLevels: { ...current.planetLevels, positive: current.planetLevels.positive + 1 },
        };
      }
      if (consumable.id === "venus") {
        return {
          ...current,
          consumables: remaining,
          planetLevels: { ...current.planetLevels, grateful: current.planetLevels.grateful + 1 },
        };
      }
      if (consumable.id === "earth") {
        return {
          ...current,
          consumables: remaining,
          neutralHandLevel: current.neutralHandLevel + 1,
          planetLevels: { ...current.planetLevels, neutral: current.planetLevels.neutral + 1 },
        };
      }
      if (consumable.id === "mars") {
        return {
          ...current,
          consumables: remaining,
          planetLevels: { ...current.planetLevels, reframe: current.planetLevels.reframe + 1 },
        };
      }
      return { ...current, consumables: remaining };
    });
  }

  function buyJoker(jokerId: string) {
    update((current) => {
      const offer = current.shop.jokerOffers.find((joker) => joker.id === jokerId);
      if (!offer || current.goodVibes < offer.cost || current.jokers.length >= current.jokerSlots) return current;
      return {
        ...current,
        goodVibes: current.goodVibes - offer.cost,
        jokers: [...current.jokers, offer],
        discoveredJokers: Array.from(new Set([...current.discoveredJokers, offer.id])),
        shop: { ...current.shop, jokerOffers: current.shop.jokerOffers.filter((joker) => joker.id !== jokerId) },
      };
    });
  }

  function buyTarot() {
    update((current) => {
      const offer = current.shop.tarotOffer;
      if (!offer || current.goodVibes < offer.cost || current.consumables.length >= 2) return current;
      return {
        ...current,
        goodVibes: current.goodVibes - offer.cost,
        consumables: clampConsumables([...current.consumables, offer]),
        shop: { ...current.shop, tarotOffer: null },
      };
    });
  }

  function buyPlanet() {
    update((current) => {
      const offer = current.shop.planetOffer;
      if (!offer || current.goodVibes < offer.cost || current.consumables.length >= 2) return current;
      return {
        ...current,
        goodVibes: current.goodVibes - offer.cost,
        consumables: clampConsumables([...current.consumables, offer]),
        shop: { ...current.shop, planetOffer: null },
      };
    });
  }

  function buyVoucher(voucherId: VoucherId) {
    update((current) => {
      const offer = current.shop.voucherOffer;
      if (!offer || offer.id !== voucherId || current.goodVibes < offer.cost) return current;
      return {
        ...current,
        goodVibes: current.goodVibes - offer.cost,
        vouchers: [...current.vouchers, voucherId],
        shop: { ...current.shop, voucherOffer: null },
      };
    });
  }

  function sellJoker(jokerId: string) {
    update((current) => {
      const joker = current.jokers.find((entry) => entry.id === jokerId);
      if (!joker || joker.cannotSell) return current;
      return {
        ...current,
        goodVibes: current.goodVibes + joker.sellValue,
        jokers: current.jokers.filter((entry) => entry.id !== jokerId),
      };
    });
  }

  function leaveShop() {
    update((current) => ({ ...current, screen: "blind-select", shop: emptyShop }));
  }

  return {
    state,
    achievementDefinitions,
    blindTypeFromIndex,
    startNewRun,
    setScreen,
    setCollectionView,
    selectBlind,
    skipBlind,
    resolveHand,
    useConsumable,
    buyJoker,
    buyTarot,
    buyPlanet,
    buyVoucher,
    sellJoker,
    leaveShop,
  };
}
