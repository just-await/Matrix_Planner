"use client";

import { useState, useEffect } from "react";
import { soundFx } from "@/lib/sound";
import { Flame, Shield, Volume2, VolumeX, Palette, Zap, Star, User } from "lucide-react";
import { getXpNeededForLevel, getRankProgress, toRomanNumeral, getPrestigeMultiplier } from "@/lib/gamification";

interface HeaderProps {
  username: string;
  level: number;
  currentXp: number;
  streak: number;
  prestige: number;
  onOpenProfileModal: () => void;
  onOpenThemeModal: () => void;
  onOpenPrestigeModal: () => void;
}

export const Header = ({
  username,
  level,
  currentXp,
  streak,
  prestige,
  onOpenProfileModal,
  onOpenThemeModal,
  onOpenPrestigeModal,
}: HeaderProps) => {
  const [muted, setMuted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    setCurrentDate(`${day}.${month}.${year}`);
  }, []);

  const maxXp = getXpNeededForLevel(level);
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXp / maxXp) * 100)));
  const rankInfo = getRankProgress(level, currentXp);

  const totalSegments = 24;
  const rankFilledSegments = Math.round((rankInfo.progressPercent / 100) * totalSegments);
  const prestigeBonusPercent = Math.round((getPrestigeMultiplier(prestige) - 1) * 100);

  const toggleSound = () => {
    setMuted(!muted);
    if (muted) soundFx.playComplete();
  };

  return (
    <header className="w-full bg-[var(--matrix-dark-green)] border-b border-[var(--matrix-border)] p-3 sm:p-4 sticky top-0 z-30 font-mono transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col gap-2.5 sm:gap-3 overflow-hidden">
        
        {/* Верхняя панель */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Логотип, ник и дата */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 border border-[var(--matrix-green)] rounded flex items-center justify-center bg-[var(--matrix-green)]/10 glow-border shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--matrix-green)] animate-pulse" />
            </div>

            <div className="min-w-0 flex flex-col justify-center gap-1 my-0.5">
              <h1 className="text-base sm:text-lg font-black tracking-widest glow-text uppercase text-[var(--matrix-green)] truncate leading-none">
                MATRIX<span className="text-white">_PLANNER</span>
              </h1>

              {/* Позывной и Престиж */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] hover:border-[var(--matrix-green)] px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold text-white transition-colors"
                  title="Открыть профиль оперативника"
                >
                  <User className="w-3 h-3 text-[var(--matrix-green)]" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{username}</span>
                </button>

                {prestige > 0 && (
                  <span 
                    title={`Престиж ${toRomanNumeral(prestige)} (+${prestigeBonusPercent}% EXP)`}
                    className="flex items-center gap-0.5 sm:gap-1 bg-yellow-500/20 border border-yellow-400 text-yellow-400 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                  >
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400" />
                    <span>P-{toRomanNumeral(prestige)}</span>
                  </span>
                )}
              </div>

              <p className="text-[9px] sm:text-[10px] text-[var(--matrix-green)]/70 tracking-widest font-bold leading-none">
                SYS_VER // {currentDate || "03.08.2026"}
              </p>
            </div>
          </div>

          {/* Инструменты справа */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {level >= 30 && (
              <button
                onClick={onOpenPrestigeModal}
                className="flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded text-[10px] sm:text-xs font-black animate-pulse shadow-[0_0_12px_rgba(234,179,8,0.8)] hover:bg-yellow-300"
                title="Активировать протокол перепрошивки Матрицы"
              >
                <Zap className="w-3 h-3 fill-black" />
                <span className="hidden sm:inline">REBIRTH</span>
              </button>
            )}

            <button
              onClick={onOpenThemeModal}
              className="flex items-center gap-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] hover:border-[var(--matrix-green)] p-1.5 sm:px-2.5 sm:py-1 rounded text-xs font-bold text-[var(--matrix-green)]"
              title="Сменить тему терминала"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">THEMES</span>
            </button>

            <div className="flex items-center gap-1 bg-[var(--matrix-green)]/10 border border-[var(--matrix-border)] px-2 sm:px-3 py-1 rounded text-xs font-bold text-[var(--matrix-green)]">
              <Flame className="w-3.5 h-3.5 text-[var(--matrix-green)] animate-bounce" />
              <span>{streak}<span className="hidden sm:inline"> DAY STREAK</span><span className="sm:hidden">d</span></span>
            </div>

            <button 
              onClick={toggleSound}
              className="p-1.5 border border-[var(--matrix-border)] hover:border-[var(--matrix-green)] rounded bg-[var(--matrix-bg)] transition-colors"
              title="Переключить звук"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-[var(--matrix-green)]" />}
            </button>
          </div>
        </div>

        {/* Шкалы прогресса БЕЗ лишней разделительной линии */}
        <div className="w-full space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs font-bold gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-[var(--matrix-green)]/10 border border-[var(--matrix-green)] text-[var(--matrix-green)] px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] tracking-wider">
                RANK: {rankInfo.currentRank.title}
              </span>
              <span className="text-gray-400 text-[10px] sm:text-[11px]">
                {rankInfo.nextRank ? `➔ ${rankInfo.nextRank.title}` : "(MAX)"}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] sm:text-[11px]">
              <span className="text-white font-bold">LVL {level}</span>
              <div className="flex-1 sm:w-16 h-2 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] rounded overflow-hidden">
                <div 
                  className="h-full bg-[var(--matrix-green)] transition-all duration-300" 
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[var(--matrix-green)]">{currentXp} / {maxXp} XP</span>
            </div>
          </div>

          <div className="w-full h-3 sm:h-3.5 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] p-0.5 rounded flex gap-0.5 sm:gap-1 glow-border">
            {Array.from({ length: totalSegments }).map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 h-full rounded-xs transition-all duration-300 ${
                  i < rankFilledSegments 
                    ? "bg-[var(--matrix-green)] shadow-[0_0_6px_var(--matrix-green)]" 
                    : "bg-[var(--matrix-dark-green)] opacity-30"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </header>
  );
};