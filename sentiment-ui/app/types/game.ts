export type Screen =
  | "menu"
  | "collection"
  | "high-scores"
  | "blind-select"
  | "game"
  | "shop"
  | "summary";

export type SentimentLabel = "positive" | "neutral" | "negative";
export type BlindType = "small" | "big" | "boss";
export type BlindStatus = "idle" | "active" | "cleared" | "failed";
export type JokerRarity = "Common" | "Uncommon" | "Rare" | "Legendary";
export type ConsumableKind = "tarot" | "planet";
export type PlanetHandType = "positive" | "grateful" | "neutral" | "reframe";

export type BossBlindId =
  | "the-critic"
  | "the-doomscroller"
  | "the-flint"
  | "the-mirror"
  | "the-wall"
  | "the-broadcast"
  | "the-foghorn"
  | "the-arm";

export type JokerId =
  | "the-optimist"
  | "hype-man"
  | "silver-lining"
  | "gratitude"
  | "the-journaler"
  | "word-wizard"
  | "mirror-of-reframing"
  | "mindful-monk"
  | "the-streak"
  | "polychrome-heart"
  | "swashbuckler"
  | "cosmic-shift"
  | "the-eternal-optimist";

export type TarotId =
  | "the-star"
  | "the-sun"
  | "the-world"
  | "the-moon"
  | "judgement"
  | "the-tower"
  | "wheel-of-fortune";

export type PlanetId = "mercury" | "venus" | "earth" | "mars";

export type VoucherId =
  | "lucky-pen"
  | "mood-tracker"
  | "focus-mode"
  | "abundance"
  | "positivity-loop";

export type TagId =
  | "rare-tag"
  | "double-tag"
  | "tarot-tag"
  | "planet-tag"
  | "juggle-tag";

export type AchievementId =
  | "glass-half-full"
  | "silver-lining"
  | "journaler"
  | "the-comeback"
  | "legendary-optimist";

export interface AnalysisMetrics {
  label: string;
  score: number;
  [key: string]: unknown;
}

export interface BackendAnalysisResult {
  original_phrase?: string;
  score: number;
  vibe?: SentimentLabel;
  detailed_metrics?: AnalysisMetrics;
  label?: SentimentLabel;
  details?: AnalysisMetrics[];
}

export interface BlindConfig {
  type: BlindType;
  title: string;
  icon: string;
  reward: number;
  hands: number;
}

export interface BossBlindConfig {
  id: BossBlindId;
  name: string;
  icon: string;
  description: string;
}

export interface BlindInstance extends BlindConfig {
  ante: number;
  target: number;
  boss?: BossBlindConfig;
}

export interface JokerDefinition {
  id: JokerId;
  name: string;
  description: string;
  art: string;
  rarity: JokerRarity;
  cost: number;
  sellValue: number;
  glow: string;
  cannotSell?: boolean;
}

export interface JokerInstance extends JokerDefinition {
  upgraded?: boolean;
}

export interface ConsumableDefinition {
  id: TarotId | PlanetId;
  name: string;
  kind: ConsumableKind;
  description: string;
  art: string;
  cost: number;
  glow: string;
}

export interface ConsumableInstance extends ConsumableDefinition {
  consumed?: boolean;
}

export interface TarotDefinition extends ConsumableDefinition {
  id: TarotId;
  kind: "tarot";
}

export interface PlanetDefinition extends ConsumableDefinition {
  id: PlanetId;
  kind: "planet";
  handType: PlanetHandType;
  levelBonus: {
    chips: number;
    mult: number;
  };
}

export interface VoucherDefinition {
  id: VoucherId;
  name: string;
  description: string;
  cost: number;
}

export interface TagDefinition {
  id: TagId;
  name: string;
  icon: string;
  description: string;
}

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
}

export interface PlanetLevels {
  positive: number;
  grateful: number;
  neutral: number;
  reframe: number;
}

export interface ShopState {
  jokerOffers: JokerInstance[];
  tarotOffer: TarotDefinition | null;
  planetOffer: PlanetDefinition | null;
  voucherOffer: VoucherDefinition | null;
}

export interface BlindResult {
  ante: number;
  blindType: BlindType;
  cleared: boolean;
  target: number;
  score: number;
  handsUsed: number;
  rewardEarned: number;
}

export interface PhraseResult {
  id: string;
  phrase: string;
  words: string[];
  originalLabel: SentimentLabel;
  effectiveLabel: SentimentLabel;
  confidence: number;
  chipsBeforeMult: number;
  baseChips: number;
  wordChips: number;
  baseMult: number;
  totalMult: number;
  score: number;
  runningBlindScore: number;
  runningRunScore: number;
  blindType: BlindType;
  ante: number;
  timestamp: number;
  isReframe: boolean;
  triggeredJokers: JokerTriggerEvent[];
  voiceLine: string;
}

export interface JokerTriggerContext {
  state: GameState;
  phrase: string;
  words: string[];
  originalLabel: SentimentLabel;
  effectiveLabel: SentimentLabel;
  confidence: number;
  positiveCountAfterPlay: number;
  positiveStreakBeforePlay: number;
  positiveStreakAfterPlay: number;
  gratitudeMatched: boolean;
  isReframe: boolean;
  blindPhraseCount: number;
  highestScoreThisBlind: number;
}

export interface JokerTriggerEvent {
  jokerId: JokerId;
  label: string;
  chipsDelta: number;
  multDelta: number;
  multMultiplier: number;
  triggered: boolean;
  replayCurrentHand?: boolean;
}

export interface ScoreComputation {
  originalLabel: SentimentLabel;
  effectiveLabel: SentimentLabel;
  confidence: number;
  words: string[];
  baseChips: number;
  wordChips: number;
  chipsBeforeMult: number;
  baseMult: number;
  totalMult: number;
  totalScore: number;
  jokerEvents: JokerTriggerEvent[];
  voiceLine: string;
  triggeredReplay: boolean;
  isReframe: boolean;
}

export interface RunSummary {
  id: string;
  createdAt: number;
  totalScore: number;
  anteReached: number;
  result: "win" | "loss";
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  longestPositiveStreak: number;
  highestSingleScore: number;
  insight: string;
  achievements: AchievementId[];
}

export interface CollectionEntry {
  jokerId: JokerId;
  unlocked: boolean;
}

export interface GameFlags {
  lastWasNegative: boolean;
  pendingReframePhrase: string | null;
  pendingReframeBonus: boolean;
  judgementReady: boolean;
  judgementTarget: JokerId | null;
  freeSubmission: boolean;
  starActive: boolean;
  sunActive: boolean;
  blindReplayUsed: boolean;
  nextShopGuaranteedRare: boolean;
  doubleNextBlindReward: boolean;
  bossPositiveChipPenalty: number;
}

export interface GameState {
  screen: Screen;
  ante: number;
  blindIndex: number;
  lives: number;
  goodVibes: number;
  runScore: number;
  roundScore: number;
  submissionsLeft: number;
  positiveStreak: number;
  longestPositiveStreak: number;
  positiveHandLevel: number;
  neutralHandLevel: number;
  gratefulness: number;
  jokers: JokerInstance[];
  consumables: ConsumableInstance[];
  vouchers: VoucherId[];
  phraseHistory: PhraseResult[];
  achievements: AchievementId[];
  bossBlindDebuff: BossBlindId | null;
  highScores: RunSummary[];
  currentSummary: RunSummary | null;
  discoveredJokers: JokerId[];
  jokerSlots: number;
  activeBlind: BlindInstance | null;
  blindStatus: BlindStatus;
  shop: ShopState;
  blindResults: BlindResult[];
  tags: TagId[];
  planetLevels: PlanetLevels;
  bonusPositiveMult: number;
  highestSingleScore: number;
  collectionView: "jokers" | "achievements";
  flags: GameFlags;
}

export interface UseConsumableResult {
  state: GameState;
  message: string;
}

export interface LocalPersistence {
  achievements: AchievementId[];
  highScores: RunSummary[];
  discoveredJokers: JokerId[];
}
