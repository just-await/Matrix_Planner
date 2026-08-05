"use client";

import { useState } from "react";
import { Trophy, ChevronDown, ChevronUp, Trash2, Calendar as CalendarIcon, Check, CalendarRange } from "lucide-react";
import { soundFx } from "@/lib/sound";
import { formatDateRu, getTodayStr } from "@/lib/utils";
import { CyberDatePicker } from "./CyberDatePicker";

export interface Subtask {
  id: string;
  title: string;
  dueDate?: string;
  xpReward?: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  targetUnit: string;
  scheduleDays?: number[];
  subtasks: Subtask[];
  xpReward: number;
  subtaskXpReward: number;
}

interface QuestTrackerProps {
  quests: Quest[];
  expandedQuestIds?: Record<string, boolean>;
  onToggleQuestExpanded?: (questId: string) => void;
  onToggleSubtask: (questId: string, subtaskId: string) => void;
  onAddSubtask: (questId: string, title: string, dueDate?: string) => void;
  onDeleteQuest: (questId: string) => void;
}

const DAYS_NAMES = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

export const QuestTracker = ({ 
  quests, 
  expandedQuestIds = {}, 
  onToggleQuestExpanded, 
  onToggleSubtask, 
  onAddSubtask, 
  onDeleteQuest 
}: QuestTrackerProps) => {
  const [localExpandedId, setLocalExpandedId] = useState<string | null>(quests[0]?.id || null);
  
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [enableSubtaskDate, setEnableSubtaskDate] = useState(false);
  const [newSubtaskDate, setNewSubtaskDate] = useState(getTodayStr());

  return (
    <div className="space-y-4 font-mono">
      {quests.map((quest, index) => {
        const completedCount = quest.subtasks.filter(s => s.completed).length;
        const totalCount = quest.subtasks.length;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const isCompleted = totalCount > 0 && completedCount === totalCount;
        
        // По умолчанию первый квест открыт, если пользователь не переключал вручную
        const isExpanded = onToggleQuestExpanded 
          ? (expandedQuestIds[quest.id] !== undefined ? expandedQuestIds[quest.id] : index === 0)
          : localExpandedId === quest.id;

        const handleToggle = () => {
          if (onToggleQuestExpanded) {
            onToggleQuestExpanded(quest.id);
          } else {
            setLocalExpandedId(isExpanded ? null : quest.id);
          }
        };

        return (
          <div 
            key={quest.id}
            className={`rounded border transition-all ${
              isCompleted 
                ? "bg-[var(--matrix-bg)]/60 border-[var(--matrix-border)] opacity-70" 
                : "bg-[var(--matrix-dark-green)] border-yellow-500/40 glow-border"
            }`}
          >
            {/* Заголовок квеста */}
            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={handleToggle}>
              <div className="flex items-center gap-3">
                <button className="text-yellow-400 p-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 px-2 py-0.5 rounded font-bold tracking-widest flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> EPIC QUEST
                    </span>
                    <span className="text-xs text-yellow-400 font-bold">
                      +{quest.xpReward || 300} XP
                    </span>
                    <span className="text-[10px] text-yellow-300/70 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                      ЭТАП: +{quest.subtaskXpReward || 15} XP
                    </span>
                    {quest.scheduleDays && quest.scheduleDays.length > 0 && (
                      <span className="text-[10px] text-yellow-300/70 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                        ДНИ: {quest.scheduleDays.map(d => DAYS_NAMES[d]).join(", ")}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{quest.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-yellow-400 font-bold">
                  {completedCount}/{totalCount} {quest.targetUnit} ({percent}%)
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteQuest(quest.id);
                  }}
                  className="text-red-500/60 hover:text-red-400 p-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Прогресс-бар */}
            <div className="px-4 pb-2">
              <div className="w-full h-2 bg-[var(--matrix-bg)] border border-yellow-500/30 rounded p-0.5">
                <div 
                  className="h-full bg-yellow-400 rounded-xs transition-all duration-300 shadow-[0_0_8px_rgba(234,179,8,0.6)]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Подзадачи */}
            {isExpanded && (
              <div className="p-4 border-t border-yellow-500/20 bg-[var(--matrix-bg)]/80 space-y-3">
                <h4 className="text-xs text-yellow-400/80 uppercase tracking-widest">// ЭТАПЫ И ПОДЗАДАЧИ КВЕСТА:</h4>
                
                <div className="space-y-1.5">
                  {quest.subtasks.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-2 rounded bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!sub.completed) soundFx.playComplete();
                            onToggleSubtask(quest.id, sub.id);
                          }}
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            sub.completed ? "bg-yellow-400 border-yellow-400 text-black" : "border-[var(--matrix-border)]"
                          }`}
                        >
                          {sub.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span className={`text-xs ${sub.completed ? "line-through text-gray-500" : "text-white"}`}>
                          {sub.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded">
                          +{sub.xpReward || quest.subtaskXpReward || 15} XP
                        </span>
                        {sub.dueDate && (
                          <span className="text-[10px] text-yellow-400/70 flex items-center gap-1 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                            <CalendarIcon className="w-3 h-3 text-yellow-400" /> {formatDateRu(sub.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {quest.subtasks.length === 0 && (
                    <p className="text-xs text-yellow-500/40 text-center py-2">[НЕТ ЭТАПОВ В КВЕСТЕ]</p>
                  )}
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newSubtaskTitle.trim()) return;
                    onAddSubtask(quest.id, newSubtaskTitle, enableSubtaskDate ? newSubtaskDate : undefined);
                    setNewSubtaskTitle("");
                    setEnableSubtaskDate(false);
                  }}
                  className="space-y-2 mt-3 pt-2 border-t border-[var(--matrix-border)]"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="> Добавить этап квеста..."
                      className="flex-1 w-full sm:w-auto bg-[var(--matrix-bg)] border border-[var(--matrix-border)] focus:border-yellow-400 text-white px-2.5 py-1.5 rounded text-xs outline-none font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => setEnableSubtaskDate(!enableSubtaskDate)}
                      className={`px-2.5 py-1.5 rounded text-xs border font-bold transition-all shrink-0 flex items-center gap-1 ${
                        enableSubtaskDate
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                          : "bg-[var(--matrix-bg)] border-[var(--matrix-border)] text-gray-400 hover:border-yellow-500/50"
                      }`}
                    >
                      <CalendarRange className="w-3.5 h-3.5" />
                      {enableSubtaskDate ? "[x] ДАТА" : "+ Дата"}
                    </button>

                    {enableSubtaskDate && (
                      <CyberDatePicker value={newSubtaskDate} onChange={setNewSubtaskDate} />
                    )}

                    <button type="submit" className="bg-yellow-500 text-black font-bold px-3 py-1.5 rounded text-xs hover:bg-yellow-400 shrink-0 w-full sm:w-auto">
                      + ЭТАП
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};