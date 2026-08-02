// lib/gamification.ts

export const XP_PRESETS = {
  LOW: 15,     // 🟢 EASY / LOW (Дефолт)
  MEDIUM: 40,  // 🟡 MEDIUM
  HARD: 100,   // 🔴 HARD
  EPIC: 300,   // 🏆 EPIC
} as const;

export type XpDifficulty = keyof typeof XP_PRESETS;

export interface XpOption {
  label: string;
  value: number;
  badgeColor: string;
  textColor: string;
  borderColor: string;
}

export const XP_OPTIONS: Record<XpDifficulty, XpOption> = {
  LOW: {
    label: "EASY",
    value: 15,
    badgeColor: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500",
  },
  MEDIUM: {
    label: "MEDIUM",
    value: 40,
    badgeColor: "bg-yellow-500/10 border-yellow-500/40 text-yellow-400",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500",
  },
  HARD: {
    label: "HARD",
    value: 100,
    badgeColor: "bg-rose-500/10 border-rose-500/40 text-rose-400",
    textColor: "text-rose-400",
    borderColor: "border-rose-500",
  },
  EPIC: {
    label: "EPIC",
    value: 300,
    badgeColor: "bg-amber-400/20 border-amber-400/60 text-amber-300 font-bold",
    textColor: "text-amber-300",
    borderColor: "border-amber-400",
  },
};

export interface RankInfo {
  title: string;
  minLevel: number;
  maxLevel: number;
  unlockedThemeId?: string;
  description: string;
}

export const OPERATIVE_RANKS: RankInfo[] = [
  {
    title: "NEOPHYTE",
    minLevel: 1,
    maxLevel: 4,
    unlockedThemeId: "classic-matrix",
    description: "Вне системы. Только подключился к терминалу.",
  },
  {
    title: "OPERATIVE",
    minLevel: 5,
    maxLevel: 9,
    unlockedThemeId: "cyberpunk-2077",
    description: "Уверенно взламывает ежедневную рутину.",
  },
  {
    title: "CYPHER PUNK",
    minLevel: 10,
    maxLevel: 14,
    unlockedThemeId: "synthwave-sunset",
    description: "Мастер виртуальной дисциплины.",
  },
  {
    title: "NET RUNNER",
    minLevel: 15,
    maxLevel: 19,
    unlockedThemeId: "rogue-ai",
    description: "Сетевой призрак. Легенда цифрового мира.",
  },
  {
    title: "SYSTEM ARCHITECT",
    minLevel: 20,
    maxLevel: 29,
    unlockedThemeId: "quantum-ice",
    description: "Полностью контролирует хаос своей жизни.",
  },
  {
    title: "THE ONE / NEO",
    minLevel: 30,
    maxLevel: Infinity,
    unlockedThemeId: "monarch-gold",
    description: "Избранный. Подчинил себе законы Матрицы.",
  },
];

export function getRankForLevel(level: number): RankInfo {
  return (
    OPERATIVE_RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) ||
    OPERATIVE_RANKS[OPERATIVE_RANKS.length - 1]
  );
}

export function getXpNeededForLevel(level: number): number {
  const calculated = 100 + (level - 1) * 25;
  return Math.min(300, calculated);
}

// Симметричное математическое округление для защиты от дюпов
export function roundSymmetric(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

export function toRomanNumeral(num: number): string {
  const lookup: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let roman = "";
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman || "I";
}

export function getPrestigeMultiplier(prestige: number): number {
  return 1 + prestige * 0.10;
}

export function getRankProgress(level: number, currentXp: number) {
  const currentRank = getRankForLevel(level);

  if (currentRank.maxLevel === Infinity) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      levelsRemaining: 0,
    };
  }

  const nextRankIndex = OPERATIVE_RANKS.findIndex((r) => r.title === currentRank.title) + 1;
  const nextRank = OPERATIVE_RANKS[nextRankIndex] || null;

  const totalLevelsInRank = currentRank.maxLevel - currentRank.minLevel + 1;
  const completedLevelsInRank = level - currentRank.minLevel;

  const xpForThisLevel = getXpNeededForLevel(level);
  const levelFraction = currentXp / xpForThisLevel;

  const progressPercent = Math.min(
    100,
    Math.round(((completedLevelsInRank + levelFraction) / totalLevelsInRank) * 100)
  );

  return {
    currentRank,
    nextRank,
    progressPercent,
    levelsRemaining: currentRank.maxLevel - level + 1,
  };
}