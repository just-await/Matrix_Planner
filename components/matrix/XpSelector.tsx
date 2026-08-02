"use client";

import { XP_OPTIONS, XpDifficulty } from "@/lib/gamification";

interface XpSelectorProps {
  value: number; // 15, 40, 100, 300
  onChange: (newXp: number) => void;
  compact?: boolean;
}

const XP_CYCLE: number[] = [15, 40, 100, 300];

export const XpSelector = ({ value, onChange, compact = false }: XpSelectorProps) => {
  const optionKey = (Object.keys(XP_OPTIONS) as XpDifficulty[]).find(
    (k) => XP_OPTIONS[k].value === value
  ) || "LOW";

  const currentOption = XP_OPTIONS[optionKey];

  const handleCycle = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentIndex = XP_CYCLE.indexOf(value);
    const nextIndex = (currentIndex + 1) % XP_CYCLE.length;
    onChange(XP_CYCLE[nextIndex]);
  };

  return (
    <button
      type="button"
      onClick={handleCycle}
      title="Нажмите для смены награды XP (+15, +40, +100, +300)"
      className={`font-mono border rounded px-2 py-1 text-xs font-bold transition-all flex items-center gap-1 select-none cursor-pointer shrink-0 ${currentOption.badgeColor}`}
    >
      <span>+{currentOption.value} XP</span>
      {!compact && <span className="opacity-70 text-[9px]">({currentOption.label})</span>}
    </button>
  );
};