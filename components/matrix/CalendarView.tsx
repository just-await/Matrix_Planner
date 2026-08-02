"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Trash2, Calendar as CalendarIcon, ShieldCheck } from "lucide-react";
import { formatDateRu } from "@/lib/utils";
import { Task } from "./TaskCard";
import { Habit } from "./HabitTracker";
import { Quest } from "./QuestTracker";
import { soundFx } from "@/lib/sound";

interface CalendarViewProps {
  tasks: Task[];
  habits: Habit[];
  quests: Quest[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (questId: string, subtaskId: string) => void;
}

export const CalendarView = ({
  tasks,
  habits,
  quests,
  selectedDateStr,
  onSelectDate,
  onToggleTask,
  onDeleteTask,
  onToggleSubtask,
}: CalendarViewProps) => {
  const initialDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState(initialDate);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

  const monthNames = ["ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ", "МАЙ", "ИЮНЬ", "ИЮЛЬ", "АВГУСТ", "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"];

  const handlePrevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const getItemsForDate = (dateStr: string) => {
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    
    const questSubtasks: { questId: string; subtaskId: string; questTitle: string; title: string; xpReward?: number; completed: boolean }[] = [];
    quests.forEach(q => {
      q.subtasks.forEach(s => {
        if (s.dueDate === dateStr) {
          questSubtasks.push({ 
            questId: q.id, 
            subtaskId: s.id, 
            questTitle: q.title, 
            title: s.title, 
            xpReward: s.xpReward || q.subtaskXpReward || 15,
            completed: s.completed 
          });
        }
      });
    });

    const completedHabits = habits.filter(h => !!h.history[dateStr]);

    return { dayTasks, questSubtasks, completedHabits };
  };

  const selectedItems = getItemsForDate(selectedDateStr);

  return (
    <div className="space-y-4 font-mono">
      {/* Сетка месяца */}
      <div className="bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)] p-4 rounded glow-border">
        
        {/* Навигация Месяцев */}
        <div className="flex items-center justify-between mb-4 border-b border-[var(--matrix-border)] pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[var(--matrix-green)]" />
            <h3 className="text-sm tracking-widest text-[var(--matrix-green)] font-bold">
              DATA_STREAM // {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handlePrevMonth} className="p-1 border border-[var(--matrix-border)] hover:border-[var(--matrix-green)] rounded text-[var(--matrix-green)]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNextMonth} className="p-1 border border-[var(--matrix-border)] hover:border-[var(--matrix-green)] rounded text-[var(--matrix-green)]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map(d => (
            <div key={d} className="text-[10px] text-[var(--matrix-green)] font-bold opacity-80">{d}</div>
          ))}
        </div>

        {/* Сетка дат */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 opacity-0" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const { dayTasks, questSubtasks, completedHabits } = getItemsForDate(dStr);
            const totalCount = dayTasks.length + questSubtasks.length + completedHabits.length;
            const isSelected = selectedDateStr === dStr;

            return (
              <button
                key={dStr}
                onClick={() => onSelectDate(dStr)}
                style={{
                  backgroundColor: isSelected 
                    ? "var(--matrix-green)" 
                    : totalCount > 0 
                      ? "rgba(var(--matrix-green-rgb), 0.15)" 
                      : "var(--matrix-bg)",
                  borderColor: isSelected || totalCount > 0 
                    ? "var(--matrix-green)" 
                    : "rgba(var(--matrix-border-rgb), 0.4)",
                  color: isSelected 
                    ? "#000000" 
                    : "var(--matrix-green)"
                }}
                className={`h-11 rounded border flex flex-col items-center justify-center text-xs transition-all relative font-bold ${
                  isSelected ? "shadow-[0_0_10px_var(--matrix-green)]" : "hover:border-[var(--matrix-green)]"
                }`}
              >
                <span>{dayNum}</span>
                {totalCount > 0 && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--matrix-green)] shadow-[0_0_4px_var(--matrix-green)] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* События выбранного дня */}
      <div className="bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)] p-4 rounded glow-border">
        <div className="flex items-center justify-between border-b border-[var(--matrix-border)] pb-2 mb-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--matrix-green)]" /> ЛОГ ВЗЛОМА НА: <span className="text-[var(--matrix-green)]">{formatDateRu(selectedDateStr)}</span>
          </h4>
        </div>

        <div className="space-y-2">
          {selectedItems.dayTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between bg-[var(--matrix-bg)] p-2 rounded border border-[var(--matrix-border)]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!task.completed) soundFx.playComplete();
                    onToggleTask(task.id);
                  }}
                  className={`w-4 h-4 rounded border flex items-center justify-center ${task.completed ? "bg-[var(--matrix-green)] border-[var(--matrix-green)] text-black" : "border-[var(--matrix-border)]"}`}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span className={`text-xs ${task.completed ? "line-through text-gray-500" : "text-white"}`}>{task.title}</span>
              </div>
              <button onClick={() => onDeleteTask(task.id)} className="text-red-500/60 hover:text-red-400 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {selectedItems.questSubtasks.map((sub) => (
            <div key={sub.subtaskId} className="flex items-center justify-between bg-yellow-500/5 p-2 rounded border border-yellow-500/30 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!sub.completed) soundFx.playComplete();
                    onToggleSubtask(sub.questId, sub.subtaskId);
                  }}
                  className={`w-4 h-4 rounded border flex items-center justify-center ${sub.completed ? "bg-yellow-400 border-yellow-400 text-black" : "border-yellow-500/40"}`}
                >
                  {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span className="font-bold text-[9px] bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded">КВЕСТ: {sub.questTitle}</span>
                <span className={`text-xs ${sub.completed ? "line-through text-gray-500" : "text-yellow-200"}`}>{sub.title}</span>
              </div>
              <span className="text-[10px] text-yellow-400 font-bold">+{sub.xpReward} XP</span>
            </div>
          ))}

          {selectedItems.completedHabits.map(habit => (
            <div key={habit.id} className="flex items-center gap-2 bg-cyan-500/5 p-2 rounded border border-cyan-500/30 text-xs text-cyan-300">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              <span>Привычка выполнена: {habit.title} (+{habit.xpReward || 15} XP)</span>
            </div>
          ))}

          {selectedItems.dayTasks.length === 0 && selectedItems.questSubtasks.length === 0 && selectedItems.completedHabits.length === 0 && (
            <p className="text-xs text-[var(--matrix-green)]/50 text-center py-3">[НЕТ ЗАПЛАНИРОВАННЫХ СОБЫТИЙ В ЭТОТ ДЕНЬ]</p>
          )}
        </div>
      </div>
    </div>
  );
};