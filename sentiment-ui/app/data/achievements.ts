import type { AchievementDefinition } from "../types/game";

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "glass-half-full",
    title: "Glass Half Full",
    description: "Submit 5 consecutive positive phrases.",
    icon: "🥂",
  },
  {
    id: "silver-lining",
    title: "Silver Lining",
    description: "Submit a positive reframe right after a negative phrase.",
    icon: "🌤️",
  },
  {
    id: "journaler",
    title: "Journaler",
    description: "Submit 20 phrases in a single run.",
    icon: "📚",
  },
  {
    id: "the-comeback",
    title: "The Comeback",
    description: "Clear a Boss Blind with only 1 submission remaining.",
    icon: "🏁",
  },
  {
    id: "legendary-optimist",
    title: "Legendary Optimist",
    description: "Hold The Eternal Optimist Joker in a winning run.",
    icon: "🌟",
  },
];
