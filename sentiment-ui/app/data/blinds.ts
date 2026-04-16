import type {
  BlindConfig,
  BlindInstance,
  BlindType,
  BossBlindConfig,
} from "../types/game";

export const blindTemplates: Record<BlindType, BlindConfig> = {
  small: {
    type: "small",
    title: "Small Blind",
    icon: "◐",
    reward: 3,
    hands: 4,
  },
  big: {
    type: "big",
    title: "Big Blind",
    icon: "◑",
    reward: 4,
    hands: 3,
  },
  boss: {
    type: "boss",
    title: "Boss Blind",
    icon: "✹",
    reward: 6,
    hands: 3,
  },
};

export const anteTargets: Record<number, Record<BlindType, number>> = {
  1: { small: 300, big: 600, boss: 1200 },
  2: { small: 600, big: 1200, boss: 2500 },
  3: { small: 1200, big: 2600, boss: 5500 },
  4: { small: 2500, big: 5500, boss: 12000 },
  5: { small: 5500, big: 12000, boss: 26000 },
  6: { small: 12000, big: 26000, boss: 57000 },
  7: { small: 26000, big: 57000, boss: 125000 },
  8: { small: 57000, big: 125000, boss: 275000 },
};

export const bossBlindCycle: BossBlindConfig[] = [
  {
    id: "the-critic",
    name: "The Critic",
    icon: "📝",
    description:
      "Speak about yourself. If no first-person pronoun appears, score is halved.",
  },
  {
    id: "the-doomscroller",
    name: "The Doomscroller",
    icon: "📱",
    description: "Negative phrases score 0 Chips this round.",
  },
  {
    id: "the-flint",
    name: "The Flint",
    icon: "🪨",
    description: "Base Chips are halved for all labels this round.",
  },
  {
    id: "the-mirror",
    name: "The Mirror",
    icon: "🪞",
    description: "Each phrase should be answered by a positive reframe to feel complete.",
  },
  {
    id: "the-wall",
    name: "The Wall",
    icon: "🧱",
    description: "Only 2 submissions this round.",
  },
  {
    id: "the-broadcast",
    name: "The Broadcast",
    icon: "📢",
    description: "Phrases under 5 words contribute 0 Word Chips.",
  },
  {
    id: "the-foghorn",
    name: "The Foghorn",
    icon: "🌫️",
    description: "The multiplier stays hidden until scoring is complete.",
  },
  {
    id: "the-arm",
    name: "The Arm",
    icon: "💪",
    description: "Positive base Chips drop by 10 after each submission, to a floor of 20.",
  },
];

export function getBossBlindForAnte(ante: number): BossBlindConfig {
  return bossBlindCycle[(ante - 1) % bossBlindCycle.length];
}

export function getBlindInstance(ante: number, type: BlindType): BlindInstance {
  const template = blindTemplates[type];

  return {
    ...template,
    ante,
    target: anteTargets[ante][type],
    boss: type === "boss" ? getBossBlindForAnte(ante) : undefined,
  };
}
