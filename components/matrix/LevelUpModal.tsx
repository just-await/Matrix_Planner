"use client";

import { RankInfo } from "@/lib/gamification";
import { getThemeById } from "@/lib/themes";
import { ShieldCheck, Trophy, Sparkles } from "lucide-react";

interface LevelUpModalProps {
  data: {
    newLevel: number;
    newRank: RankInfo;
    unlockedThemeId?: string;
  } | null;
  onClose: () => void;
}

export const LevelUpModal = ({ data, onClose }: LevelUpModalProps) => {
  if (!data) return null;

  const unlockedTheme = data.unlockedThemeId ? getThemeById(data.unlockedThemeId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-[#051A0B] border-2 border-[#00FF66] p-6 rounded-lg max-w-md w-full text-center relative glow-border space-y-4">
        
        <div className="w-14 h-14 mx-auto bg-[#00FF66]/20 border border-[#00FF66] rounded-full flex items-center justify-center animate-bounce">
          <Trophy className="w-8 h-8 text-[#00FF66]" />
        </div>

        <div>
          <span className="text-[10px] bg-[#00FF66]/20 border border-[#00FF66] text-[#00FF66] px-2.5 py-0.5 rounded font-bold tracking-widest uppercase">
            // SYSTEM_OVERRIDE // LEVEL UP!
          </span>
          <h2 className="text-2xl font-black text-white glow-text mt-2">
            ДОСТИГНУТ LVL {data.newLevel}
          </h2>
        </div>

        <div className="bg-[#030703] border border-[#004D1F] p-3 rounded text-left space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
            <span className="text-xs text-gray-400">ПРИСВОЕНО ЗВАНИЕ:</span>
          </div>
          <p className="text-base font-bold text-[#00FF66] tracking-wider pl-6">
            {data.newRank.title}
          </p>
          <p className="text-[11px] text-gray-400 pl-6">
            {data.newRank.description}
          </p>
        </div>

        {unlockedTheme && (
          <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded flex items-center gap-3 text-left">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
                🔓 НОВАЯ ТЕМА РАЗБЛОКИРОВАНА:
              </p>
              <p className="text-xs font-bold text-white">
                {unlockedTheme.name}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[#00FF66] text-black font-bold py-2.5 rounded text-xs tracking-widest hover:bg-[#00CC52] transition-colors shadow-[0_0_12px_#00FF66]"
        >
          [ ПРИНЯТЬ_НАГРАДУ ]
        </button>
      </div>
    </div>
  );
};