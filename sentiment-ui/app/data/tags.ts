import type { TagDefinition } from "../types/game";

export const tagDefinitions: TagDefinition[] = [
  {
    id: "rare-tag",
    name: "Rare Tag",
    icon: "🔴",
    description: "Next shop has a guaranteed Rare Joker.",
  },
  {
    id: "double-tag",
    name: "Double Tag",
    icon: "🔁",
    description: "Double your Good Vibes from the next Blind.",
  },
  {
    id: "tarot-tag",
    name: "Tarot Tag",
    icon: "🔮",
    description: "Receive a random Tarot card immediately.",
  },
  {
    id: "planet-tag",
    name: "Planet Tag",
    icon: "🪐",
    description: "Receive a random Planet card immediately.",
  },
  {
    id: "juggle-tag",
    name: "Juggle Tag",
    icon: "🤹",
    description: "Gain +1 Joker slot for the run.",
  },
];
