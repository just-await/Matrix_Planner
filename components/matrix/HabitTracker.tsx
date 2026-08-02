"use client";

import { Check, Flame, Trash2, Lock } from "lucide-react";
import { soundFx } from "@/lib/sound";
import { calculateStreak } from "@/lib/utils";

export interface Habit {
  id: string;
  title: string;
  xpReward: number;
  history: Record<string, boolean>;
}

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabitDate: (id: string, dateStr: string) => void;
  onDeleteHabit: (id: string) => void;
}

const WEEK_DAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

export const HabitTracker = ({ habits, onToggleHabitDate, onDeleteHabit }: HabitTrackerProps) => {
  const getWeekDays = () => {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const distanceToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMon);

    return WEEK_DAYS.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const isFuture = d > now && d.toDateString() !== now.toDateString();
      const isToday = d.toDateString() === now.toDateString();

      return { name, dateStr, dayNum: d.getDate(), isFuture, isToday };
    });
  };

  const week = getWeekDays();

  return (
    <div className="space-y-3 font-mono">
      {habits.map((habit) => {
        const streak = calculateStreak(habit.history);

        return (
          <div 
            key={habit.id}
            className="bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)] hover:border-[var(--matrix-green)] p-4 rounded glow-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-colors duration-300"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                {/* Полупрозрачная аккуратная плашка привычки */}
                <span 
                  style={{
                    backgroundColor: "rgba(var(--matrix-green-rgb), 0.12)",
                    borderColor: "rgba(var(--matrix-green-rgb), 0.3)",
                    color: "var(--matrix-green)",
                  }}
                  className="text-[10px] px-2 py-0.5 rounded border tracking-widest font-bold"
                >
                  DAEMON ROUTINE (+{habit.xpReward || 15} XP)
                </span>
                <span className="text-xs text-[var(--matrix-green)] flex items-center gap-1 font-bold">
                  <Flame className="w-3.5 h-3.5 text-[var(--matrix-green)]" /> {streak} ДНЕЙ СТРЕК
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{habit.title}</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {week.map((w) => {
                  const isDone = !!habit.history[w.dateStr];
                  return (
                    <button
                      key={w.dateStr}
                      disabled={w.isFuture}
                      onClick={() => {
                        if (!isDone) soundFx.playComplete();
                        onToggleHabitDate(habit.id, w.dateStr);
                      }}
                      title={w.isFuture ? "День еще не наступил" : w.dateStr}
                      className={`flex flex-col items-center justify-center w-8 h-10 rounded border text-[10px] transition-all relative ${
                        w.isFuture
                          ? "bg-[var(--matrix-bg)] border-[var(--matrix-border)] border-opacity-30 text-gray-600 cursor-not-allowed"
                          : isDone 
                            ? "bg-[var(--matrix-green)] border-[var(--matrix-green)] text-black font-bold shadow-[0_0_8px_var(--matrix-green)]" 
                            : w.isToday
                              ? "bg-[var(--matrix-bg)] border-[var(--matrix-green)] text-[var(--matrix-green)]"
                              : "bg-[var(--matrix-bg)] border-[var(--matrix-border)] text-[var(--matrix-green)] text-opacity-80 hover:border-[var(--matrix-green)]"
                      }`}
                    >
                      <span className="text-[8px] opacity-80">{w.name}</span>
                      <span className="text-[10px] font-bold">{w.dayNum}</span>
                      {w.isFuture ? (
                        <Lock className="w-2.5 h-2.5 opacity-40 mt-0.5" />
                      ) : isDone ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onDeleteHabit(habit.id)}
                className="text-red-500/60 hover:text-red-400 p-1.5 transition-colors"
                title="Удалить привычку"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};