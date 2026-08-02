"use client";

import { Check, Sparkles, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { soundFx } from "@/lib/sound";
import { formatDateRu } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  category: "quest" | "habit" | "todo";
  xpReward: number;
  completed: boolean;
  dueDate?: string;
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onToggle, onDelete }: TaskCardProps) => {
  const handleToggle = () => {
    if (!task.completed) {
      soundFx.playComplete();
    }
    onToggle(task.id);
  };

  return (
    <div 
      className={`group relative flex items-center justify-between p-3.5 my-2 border rounded transition-all duration-300 font-mono ${
        task.completed 
          ? "bg-[var(--matrix-bg)] opacity-60 border-[var(--matrix-border)]" 
          : "bg-[var(--matrix-dark-green)] border-[var(--matrix-border)] hover:border-[var(--matrix-green)] glow-border"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Галочка выполнения */}
        <button
          onClick={handleToggle}
          className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
            task.completed
              ? "bg-[var(--matrix-green)] border-[var(--matrix-green)] text-black"
              : "border-[var(--matrix-border)] hover:border-[var(--matrix-green)] bg-[var(--matrix-bg)]"
          }`}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span 
              style={{
                backgroundColor: "rgba(var(--matrix-green-rgb), 0.12)",
                borderColor: "rgba(var(--matrix-green-rgb), 0.3)",
                color: "var(--matrix-green)",
              }}
              className="text-[9px] px-1.5 py-0.5 rounded border tracking-widest font-bold"
            >
              PATCH DIRECTIVE
            </span>
            <span className="text-[10px] text-[var(--matrix-green)] flex items-center gap-0.5 font-bold">
              <Sparkles className="w-3 h-3" /> +{task.xpReward} XP
            </span>
            {task.dueDate && (
              <span className="text-[10px] text-[var(--matrix-green)] flex items-center gap-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] px-1.5 py-0.5 rounded">
                <CalendarIcon className="w-3 h-3 text-[var(--matrix-green)]" /> {formatDateRu(task.dueDate)}
              </span>
            )}
          </div>
          <p className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
            {task.title}
          </p>
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 p-1 transition-opacity"
        title="Удалить задачу"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};