"use client";

import { Zap, Sparkles, RefreshCw } from "lucide-react";
import { toRomanNumeral, getPrestigeMultiplier } from "@/lib/gamification";

interface PrestigeModalProps {
  isOpen: boolean;
  prestige: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const PrestigeModal = ({ isOpen, prestige, onConfirm, onClose }: PrestigeModalProps) => {
  if (!isOpen) return null;

  const nextPrestige = prestige + 1;
  const nextMultiplierPercent = Math.round((getPrestigeMultiplier(nextPrestige) - 1) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-[var(--matrix-dark-green)] border-2 border-yellow-400 p-6 rounded-lg max-w-md w-full text-center relative glow-border space-y-4 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
        
        <div className="w-14 h-14 mx-auto bg-yellow-500/20 border border-yellow-400 rounded-full flex items-center justify-center animate-pulse">
          <Zap className="w-8 h-8 text-yellow-400" />
        </div>

        <div>
          <span className="text-[10px] bg-yellow-500/20 border border-yellow-400 text-yellow-400 px-2.5 py-0.5 rounded font-bold tracking-widest uppercase">
            // PROTOCOL: SYSTEM REBIRTH
          </span>
          <h2 className="text-xl font-black text-white glow-text mt-2">
            ПЕРЕПРОШИВКА МАТРИЦЫ
          </h2>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          Вы достигли пикового уровня и высшего звания <strong className="text-yellow-400">THE ONE / NEO</strong>. Готовы войти в новый цикл развития?
        </p>

        <div className="bg-[var(--matrix-bg)] border border-[var(--matrix-border)] p-3 rounded text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-yellow-400 font-bold border-b border-[var(--matrix-border)] pb-1.5">
            <span>ЗВАНИЕ ПРЕСТИЖА:</span>
            <span className="text-sm">★ PRESTIGE {toRomanNumeral(nextPrestige)}</span>
          </div>
          
          <div className="space-y-1 text-gray-300 text-[11px]">
            <p className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>Пассивный буст опыта: <strong className="text-yellow-400">+{nextMultiplierPercent}% EXP</strong></span>
            </p>
            <p className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>Уровень сбросится на <strong className="text-white">LVL 1</strong></span>
            </p>
            <p className="flex items-center gap-1.5 text-emerald-400">
              ✓ Все задачи, привычки, квесты и темы сохраняются!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] text-gray-300 py-2.5 rounded text-xs hover:border-yellow-400 transition-colors"
          >
            ОТМЕНА
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-yellow-400 text-black font-bold py-2.5 rounded text-xs tracking-wider hover:bg-yellow-300 transition-colors shadow-[0_0_12px_rgba(234,179,8,0.8)]"
          >
            [ ⚡ REBIRTH ]
          </button>
        </div>

      </div>
    </div>
  );
};