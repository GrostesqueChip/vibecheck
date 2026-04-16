import type { VoucherDefinition } from "../types/game";

export const voucherDefinitions: VoucherDefinition[] = [
  {
    id: "lucky-pen",
    name: "Lucky Pen",
    description: "+1 submission per Blind every round.",
    cost: 10,
  },
  {
    id: "mood-tracker",
    name: "Mood Tracker",
    description: "Unlock a live graph of your sentiment history.",
    cost: 6,
  },
  {
    id: "focus-mode",
    name: "Focus Mode",
    description: "Boss Blind debuffs are shown before you commit.",
    cost: 8,
  },
  {
    id: "abundance",
    name: "Abundance",
    description: "The shop always shows 3 Jokers instead of 2.",
    cost: 12,
  },
  {
    id: "positivity-loop",
    name: "Positivity Loop",
    description: "Positive streak bonuses stack twice as fast.",
    cost: 9,
  },
];
