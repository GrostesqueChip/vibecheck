import type {
  JokerDefinition,
  JokerId,
  JokerTriggerContext,
  JokerTriggerEvent,
} from "../types/game";

function containsAny(source: string, needles: string[]) {
  const lower = source.toLowerCase();
  return needles.some((needle) => lower.includes(needle));
}

function createEvent(
  jokerId: JokerId,
  label: string,
  chipsDelta = 0,
  multDelta = 0,
  multMultiplier = 1,
  triggered = true,
  replayCurrentHand = false
): JokerTriggerEvent {
  return {
    jokerId,
    label,
    chipsDelta,
    multDelta,
    multMultiplier,
    triggered,
    replayCurrentHand,
  };
}

export interface JokerRuntimeDefinition extends JokerDefinition {
  transformLabel?: (context: JokerTriggerContext) => JokerTriggerContext["effectiveLabel"] | null;
  trigger?: (context: JokerTriggerContext) => JokerTriggerEvent;
}

export const jokerDefinitions: JokerRuntimeDefinition[] = [
  {
    id: "the-optimist",
    name: "The Optimist",
    description: "+2 Mult for every positive phrase submitted this session.",
    art: "🙂",
    rarity: "Common",
    cost: 0,
    sellValue: 0,
    glow: "var(--shadow-glow-green)",
    trigger: (context) => {
      if (context.effectiveLabel !== "positive") {
        return createEvent("the-optimist", "Waiting for a brighter hand.", 0, 0, 1, false);
      }

      const mult = context.positiveCountAfterPlay * 2;
      return createEvent("the-optimist", `+${mult} Mult`, 0, mult);
    },
  },
  {
    id: "hype-man",
    name: "Hype Man",
    description: "After 3 positive phrases in a row, the 4th gets x2 Mult.",
    art: "📣",
    rarity: "Common",
    cost: 5,
    sellValue: 3,
    glow: "var(--shadow-glow-gold)",
    trigger: (context) => {
      const triggered =
        context.effectiveLabel === "positive" && context.positiveStreakBeforePlay >= 3;
      return createEvent(
        "hype-man",
        triggered ? "x2 Mult" : "The crowd is warming up.",
        0,
        0,
        triggered ? 2 : 1,
        triggered
      );
    },
  },
  {
    id: "silver-lining",
    name: "Silver Lining",
    description: "Negative phrases get +30 bonus Chips.",
    art: "🌧️",
    rarity: "Common",
    cost: 5,
    sellValue: 3,
    glow: "var(--shadow-glow-blue)",
    trigger: (context) =>
      createEvent(
        "silver-lining",
        context.effectiveLabel === "negative" ? "+30 Chips" : "Still looking for the upside.",
        context.effectiveLabel === "negative" ? 30 : 0,
        0,
        1,
        context.effectiveLabel === "negative"
      ),
  },
  {
    id: "gratitude",
    name: "Gratitude",
    description: `If your phrase contains "thank", "grateful", "appreciate", or "love", +3 Mult.`,
    art: "🙏",
    rarity: "Uncommon",
    cost: 6,
    sellValue: 3,
    glow: "var(--shadow-glow-green)",
    trigger: (context) =>
      createEvent(
        "gratitude",
        context.gratitudeMatched ? "+3 Mult" : "No gratitude keyword found.",
        0,
        context.gratitudeMatched ? 3 : 0,
        1,
        context.gratitudeMatched
      ),
  },
  {
    id: "the-journaler",
    name: "The Journaler",
    description: "Every 5 phrases submitted permanently adds +1 to base Mult.",
    art: "📔",
    rarity: "Uncommon",
    cost: 6,
    sellValue: 3,
    glow: "var(--shadow-glow-purple)",
    trigger: (context) => {
      const bonus = Math.floor((context.state.phraseHistory.length + 1) / 5);
      return createEvent(
        "the-journaler",
        bonus > 0 ? `+${bonus} Mult` : "Fill more pages.",
        0,
        bonus,
        1,
        bonus > 0
      );
    },
  },
  {
    id: "word-wizard",
    name: "Word Wizard",
    description: "Phrases with 8+ words get +20 bonus Chips.",
    art: "🪄",
    rarity: "Common",
    cost: 5,
    sellValue: 3,
    glow: "var(--shadow-glow-blue)",
    trigger: (context) =>
      createEvent(
        "word-wizard",
        context.words.length >= 8 ? "+20 Chips" : "Needs a longer spell.",
        context.words.length >= 8 ? 20 : 0,
        0,
        1,
        context.words.length >= 8
      ),
  },
  {
    id: "mirror-of-reframing",
    name: "Mirror of Reframing",
    description: "Negative followed by positive? That positive hand gets x3 Mult.",
    art: "🪞",
    rarity: "Rare",
    cost: 8,
    sellValue: 4,
    glow: "var(--shadow-glow-purple)",
    trigger: (context) => {
      const triggered = context.state.flags.lastWasNegative && context.effectiveLabel === "positive";
      return createEvent(
        "mirror-of-reframing",
        triggered ? "x3 Mult" : "Waiting for the turn.",
        0,
        0,
        triggered ? 3 : 1,
        triggered
      );
    },
  },
  {
    id: "mindful-monk",
    name: "Mindful Monk",
    description: "Neutral phrases gain x1.5 Mult.",
    art: "🧘",
    rarity: "Uncommon",
    cost: 6,
    sellValue: 3,
    glow: "var(--shadow-glow-blue)",
    trigger: (context) =>
      createEvent(
        "mindful-monk",
        context.effectiveLabel === "neutral" ? "x1.5 Mult" : "Breath steady.",
        0,
        0,
        context.effectiveLabel === "neutral" ? 1.5 : 1,
        context.effectiveLabel === "neutral"
      ),
  },
  {
    id: "the-streak",
    name: "The Streak",
    description: "Current positive streak x 5 adds bonus Chips each submission.",
    art: "🔥",
    rarity: "Common",
    cost: 5,
    sellValue: 3,
    glow: "var(--shadow-glow-red)",
    trigger: (context) => {
      const streak = context.effectiveLabel === "positive" ? context.positiveStreakAfterPlay : 0;
      const multiplier = context.state.vouchers.includes("positivity-loop") ? 10 : 5;
      const chips = streak * multiplier;

      return createEvent(
        "the-streak",
        chips > 0 ? `+${chips} Chips` : "No heat yet.",
        chips,
        0,
        1,
        chips > 0
      );
    },
  },
  {
    id: "polychrome-heart",
    name: "Polychrome Heart",
    description: "Once per Blind, your highest-scoring phrase is replayed.",
    art: "🌈",
    rarity: "Rare",
    cost: 8,
    sellValue: 4,
    glow: "var(--shadow-glow-purple)",
    trigger: (context) => {
      const triggered =
        !context.state.flags.blindReplayUsed &&
        context.highestScoreThisBlind <= 0 &&
        context.effectiveLabel === "positive";

      return createEvent(
        "polychrome-heart",
        triggered ? "Replay!" : "Saving the encore.",
        0,
        0,
        1,
        triggered,
        triggered
      );
    },
  },
  {
    id: "swashbuckler",
    name: "Swashbuckler",
    description: "+Mult equal to total number of Jokers you own.",
    art: "🏴‍☠️",
    rarity: "Uncommon",
    cost: 6,
    sellValue: 3,
    glow: "var(--shadow-glow-gold)",
    trigger: (context) =>
      createEvent(
        "swashbuckler",
        `+${context.state.jokers.length} Mult`,
        0,
        context.state.jokers.length
      ),
  },
  {
    id: "cosmic-shift",
    name: "Cosmic Shift",
    description: "Negative phrases flip to Neutral for scoring.",
    art: "🌌",
    rarity: "Rare",
    cost: 8,
    sellValue: 4,
    glow: "var(--shadow-glow-blue)",
    transformLabel: (context) =>
      context.originalLabel === "negative" ? "neutral" : null,
    trigger: (context) =>
      createEvent(
        "cosmic-shift",
        context.originalLabel === "negative" ? "Negative becomes Neutral" : "The cosmos waits.",
        0,
        0,
        1,
        context.originalLabel === "negative"
      ),
  },
  {
    id: "the-eternal-optimist",
    name: "The Eternal Optimist",
    description: "All Joker Mult values are multiplied by 1.5. Cannot be sold.",
    art: "✨",
    rarity: "Legendary",
    cost: 12,
    sellValue: 0,
    glow: "var(--shadow-glow-rainbow)",
    cannotSell: true,
    trigger: () => createEvent("the-eternal-optimist", "Radiance hums quietly.", 0, 0, 1, false),
  },
];

export const jokerDefinitionsById = Object.fromEntries(
  jokerDefinitions.map((joker) => [joker.id, joker])
) as Record<JokerId, JokerRuntimeDefinition>;

export const gratitudeKeywords = ["thank", "grateful", "appreciate", "love"];

export function phraseHasGratitude(phrase: string) {
  return containsAny(phrase, gratitudeKeywords);
}
