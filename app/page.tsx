"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/matrix/Header";
import { TaskCard } from "@/components/matrix/TaskCard";
import { HabitTracker } from "@/components/matrix/HabitTracker";
import { QuestTracker } from "@/components/matrix/QuestTracker";
import { CalendarView } from "@/components/matrix/CalendarView";
import { CyberDatePicker } from "@/components/matrix/CyberDatePicker";
import { MatrixRain } from "@/components/matrix/MatrixRain";
import { XpSelector } from "@/components/matrix/XpSelector";
import { LevelUpModal } from "@/components/matrix/LevelUpModal";
import { PrestigeModal } from "@/components/matrix/PrestigeModal";
import { ProfileModal } from "@/components/matrix/ProfileModal";
import { useMatrixData } from "@/hooks/useMatrixData";
import { getTodayStr, formatDateRu } from "@/lib/utils";
import { THEMES, getThemeById } from "@/lib/themes";
import { getRankForLevel } from "@/lib/gamification";
import { Plus, CheckSquare, Repeat, Calendar, Trophy, CalendarRange, Download, Upload, CloudRain, Palette } from "lucide-react";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    mounted,
    activeTab,
    setActiveTab,
    matrixRain,
    setMatrixRain,
    user, // <-- Добавили
    username,
    setUsername,
    level,
    highestLevel,
    xp,
    prestige,
    currentTheme,
    setCurrentTheme,
    levelUpData,
    setLevelUpData,
    activatePrestige,
    totalStreak,
    tasks,
    setTasks,
    habits,
    setHabits,
    quests,
    setQuests,
    toggleTask,
    deleteTask,
    toggleHabitDate,
    deleteHabit,
    toggleSubtask,
    addSubtaskToQuest,
    deleteQuest,
    exportData,
    importData,
  } = useMatrixData();

  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPrestigeModal, setShowPrestigeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const theme = getThemeById(currentTheme);
    const root = document.documentElement;
    root.style.setProperty("--matrix-bg", theme.cssVars.bg);
    root.style.setProperty("--matrix-green", theme.cssVars.primary);
    root.style.setProperty("--matrix-dark-green", theme.cssVars.darkPrimary);
    root.style.setProperty("--matrix-border", theme.cssVars.border);
    root.style.setProperty("--matrix-glow", theme.cssVars.glow);
    root.style.setProperty("--matrix-green-rgb", theme.cssVars.primaryRgb);
    root.style.setProperty("--matrix-border-rgb", theme.cssVars.borderRgb);
  }, [currentTheme]);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as unknown as { Telegram?: { WebApp?: { expand: () => void } } }).Telegram?.WebApp) {
      (window as unknown as { Telegram: { WebApp: { expand: () => void } } }).Telegram.WebApp.expand();
    }
  }, []);

  const [inputTitle, setInputTitle] = useState("");
  const [inputDueDate, setInputDueDate] = useState(getTodayStr());

  const [selectedXp, setSelectedXp] = useState(15);
  const [questXp, setQuestXp] = useState(300);
  const [questSubtaskXp, setQuestSubtaskXp] = useState(15);

  const [enableQuestSchedule, setEnableQuestSchedule] = useState(false);
  const [questStartDate, setQuestStartDate] = useState(getTodayStr());
  const [questEndDate, setQuestEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [questUnit, setQuestUnit] = useState("этапов");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#030703] text-[#00FF66] flex items-center justify-center font-mono tracking-widest animate-pulse">
        [INITIALIZING_MATRIX_CORE...]
      </div>
    );
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    if (activeTab === "tasks" || activeTab === "calendar") {
      setTasks(prev => [{
        id: Date.now().toString(),
        title: inputTitle,
        category: "todo",
        dueDate: inputDueDate,
        xpReward: selectedXp,
        completed: false
      }, ...prev]);
    } else if (activeTab === "habits") {
      setHabits(prev => [...prev, {
        id: Date.now().toString(),
        title: inputTitle,
        xpReward: selectedXp,
        history: {}
      }]);
    } else if (activeTab === "quests") {
      const generatedSubtasks: { id: string; title: string; dueDate?: string; xpReward: number; completed: boolean }[] = [];

      if (enableQuestSchedule && questStartDate && questEndDate && selectedDays.length > 0) {
        const start = new Date(questStartDate);
        const end = new Date(questEndDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (selectedDays.includes(dayOfWeek)) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const dayNum = String(d.getDate()).padStart(2, "0");
            const dateStr = `${y}-${m}-${dayNum}`;

            generatedSubtasks.push({
              id: `${Date.now()}-${generatedSubtasks.length}`,
              title: `${inputTitle} (${formatDateRu(dateStr)})`,
              dueDate: dateStr,
              xpReward: questSubtaskXp,
              completed: false
            });
          }
        }
      }

      setQuests(prev => [...prev, {
        id: Date.now().toString(),
        title: inputTitle,
        targetUnit: questUnit || "этапов",
        scheduleDays: enableQuestSchedule ? selectedDays : undefined,
        xpReward: questXp,
        subtaskXpReward: questSubtaskXp,
        subtasks: generatedSubtasks
      }]);

      setEnableQuestSchedule(false);
    }

    setInputTitle("");
  };

  const currentRank = getRankForLevel(level);

  return (
    <div className="min-h-screen bg-[var(--matrix-bg)] text-[var(--matrix-green)] crt-overlay pb-12 font-mono relative transition-colors duration-300">
      <MatrixRain active={matrixRain} themeId={currentTheme} />

      <Header 
        username={username}
        level={level} 
        currentXp={xp} 
        streak={totalStreak} 
        prestige={prestige}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onOpenThemeModal={() => setShowThemeModal(true)}
        onOpenPrestigeModal={() => setShowPrestigeModal(true)}
      />

      <LevelUpModal data={levelUpData} onClose={() => setLevelUpData(null)} />

      <PrestigeModal 
        isOpen={showPrestigeModal} 
        prestige={prestige} 
        onConfirm={activatePrestige} 
        onClose={() => setShowPrestigeModal(false)} 
      />

      <ProfileModal
        isOpen={showProfileModal}
        user={user} // <-- Добавили
        username={username}
        level={level}
        rank={currentRank}
        prestige={prestige}
        streak={totalStreak}
        onSaveUsername={setUsername}
        onClose={() => setShowProfileModal(false)}
      />

      {/* МОДАЛЬНОЕ ОКНО ВЫБОРА ТЕМ */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[var(--matrix-dark-green)] border border-[var(--matrix-green)] p-5 rounded-lg max-w-sm w-full space-y-4 glow-border">
            <h3 className="text-sm font-bold text-[var(--matrix-green)] tracking-widest flex items-center gap-2">
              <Palette className="w-4 h-4" /> SELECT TERMINAL THEME
            </h3>
            <div className="space-y-2">
              {THEMES.map((theme) => {
                const isUnlocked = prestige > 0 || highestLevel >= theme.levelRequired || level >= theme.levelRequired;
                const isSelected = currentTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      setCurrentTheme(theme.id);
                      setShowThemeModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded border text-xs transition-all ${
                      isSelected
                        ? "border-[var(--matrix-green)] bg-[var(--matrix-green)]/20 font-bold text-white shadow-[0_0_8px_var(--matrix-green)]"
                        : isUnlocked
                          ? "border-[var(--matrix-border)] bg-[var(--matrix-bg)] text-[var(--matrix-green)] hover:border-[var(--matrix-green)]"
                          : "border-[var(--matrix-border)]/30 bg-[var(--matrix-bg)]/40 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: theme.primaryHex }} />
                      <span>{theme.name}</span>
                    </div>
                    {!isUnlocked && (
                      <span className="text-[9px] border border-gray-700 px-1.5 py-0.5 rounded text-gray-500">
                        🔒 LVL {theme.levelRequired}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowThemeModal(false)}
              className="w-full bg-[var(--matrix-bg)] border border-[var(--matrix-border)] text-gray-300 py-2 rounded text-xs hover:border-[var(--matrix-green)]"
            >
              ЗАКРЫТЬ
            </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6 relative z-10">
        
        {/* ПАНЕЛЬ ИНСТРУМЕНТОВ */}
        <div className="flex items-center justify-between gap-2 mb-4 bg-[var(--matrix-dark-green)] p-2 rounded border border-[var(--matrix-border)] text-xs">
          <button
            onClick={() => setMatrixRain(!matrixRain)}
            className={`flex items-center gap-1 px-2 py-1 rounded border font-bold text-[11px] sm:text-xs transition-all ${
              matrixRain 
                ? "bg-[var(--matrix-green)] text-black border-[var(--matrix-green)] shadow-[0_0_8px_var(--matrix-green)]" 
                : "bg-[var(--matrix-bg)] border-[var(--matrix-border)] text-[var(--matrix-green)] hover:border-[var(--matrix-green)]"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>RAIN: {matrixRain ? "ON" : "OFF"}</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] hover:border-[var(--matrix-green)] px-2 py-1 rounded text-[11px] sm:text-xs text-[var(--matrix-green)]"
              title="Скачать бэкап (.json)"
            >
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">EXPORT</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] hover:border-[var(--matrix-green)] px-2 py-1 rounded text-[11px] sm:text-xs text-[var(--matrix-green)]"
              title="Загрузить бэкап (.json)"
            >
              <Upload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">IMPORT</span>
            </button>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => {
                if (e.target.files?.[0]) importData(e.target.files[0]);
              }} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>

        {/* ВКЛАДКИ НАВИГАЦИИ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded text-xs font-bold transition-all ${
              activeTab === "tasks"
                ? "bg-[var(--matrix-green)] text-black shadow-[0_0_10px_var(--matrix-green)]"
                : "bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)] text-[var(--matrix-green)] hover:border-[var(--matrix-green)]"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> [⚡ ЗАДАЧИ]
          </button>

          <button
            onClick={() => setActiveTab("habits")}
            className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded text-xs font-bold transition-all ${
              activeTab === "habits"
                ? "bg-[var(--matrix-green)] text-black shadow-[0_0_10px_var(--matrix-green)]"
                : "bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)] text-[var(--matrix-green)] hover:border-[var(--matrix-green)]"
            }`}
          >
            <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> [🔄 ПРИВЫЧКИ]
          </button>

          <button
            onClick={() => setActiveTab("quests")}
            className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded text-xs font-bold transition-all ${
              activeTab === "quests"
                ? "bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.6)]"
                : "bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)] text-yellow-500/80 hover:border-yellow-500"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> [🏆 КВЕСТЫ]
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded text-xs font-bold transition-all ${
              activeTab === "calendar"
                ? "bg-[var(--matrix-green)] text-black shadow-[0_0_10px_var(--matrix-green)]"
                : "bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)] text-[var(--matrix-green)] hover:border-[var(--matrix-green)]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> [📅 КАЛЕНДАРЬ]
          </button>
        </div>

        {/* УМНАЯ СТРОКА ДОБАВЛЕНИЯ */}
        <form onSubmit={handleAddItem} className="mb-6 p-3 sm:p-4 bg-[var(--matrix-dark-green)] border border-[var(--matrix-border)] rounded glow-border space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            <input 
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder={
                activeTab === "tasks" ? "> Добавить новую задачу..." :
                activeTab === "habits" ? "> Создать новую ежедневную привычку..." :
                activeTab === "quests" ? "> Название эпического квеста (напр: Прочитать 5 книг)..." :
                "> Запланировать задачу в календарь..."
              }
              className="flex-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] focus:border-[var(--matrix-green)] text-white px-3 py-2 rounded text-xs sm:text-sm outline-none font-mono"
            />
            
            {(activeTab === "tasks" || activeTab === "habits" || activeTab === "calendar") && (
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <XpSelector value={selectedXp} onChange={setSelectedXp} />
                {(activeTab === "tasks" || activeTab === "calendar") && (
                  <CyberDatePicker value={inputDueDate} onChange={setInputDueDate} />
                )}
              </div>
            )}

            {activeTab === "quests" && (
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-yellow-400 font-bold">КВЕСТ:</span>
                  <XpSelector value={questXp} onChange={setQuestXp} compact />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-yellow-400 font-bold">ЭТАП:</span>
                  <XpSelector value={questSubtaskXp} onChange={setQuestSubtaskXp} compact />
                </div>
                <input
                  type="text"
                  value={questUnit}
                  onChange={(e) => setQuestUnit(e.target.value)}
                  placeholder="Ед. (этапов)"
                  className="w-24 bg-[var(--matrix-bg)] border border-yellow-500/50 text-yellow-400 px-2 py-1.5 rounded text-xs outline-none font-mono"
                />
              </div>
            )}

            <button 
              type="submit"
              className={`font-bold px-4 py-2 rounded text-xs flex items-center justify-center gap-1 transition-colors shrink-0 ${
                activeTab === "quests" ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-[var(--matrix-green)] text-black hover:bg-[#00CC52]"
              }`}
            >
              <Plus className="w-4 h-4 stroke-[3]" /> ADD
            </button>
          </div>

          {activeTab === "quests" && (
            <div className="pt-2 border-t border-[var(--matrix-border)] space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEnableQuestSchedule(!enableQuestSchedule)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border font-bold transition-all ${
                    enableQuestSchedule
                      ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                      : "bg-[var(--matrix-bg)] border-[var(--matrix-border)] text-gray-400 hover:border-yellow-500/50"
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5" />
                  {enableQuestSchedule ? "[x] ДАТА ДОБАВЛЕНА" : "+ Авто-график"}
                </button>
              </div>

              {enableQuestSchedule && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--matrix-bg)] p-3 rounded border border-yellow-500/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-yellow-400/80 text-[10px]">СТАРТ:</span>
                    <CyberDatePicker value={questStartDate} onChange={setQuestStartDate} />
                    <span className="text-yellow-400/80 text-[10px]">ФИНИШ:</span>
                    <CyberDatePicker value={questEndDate} onChange={setQuestEndDate} />
                  </div>

                  <div className="flex items-center gap-1">
                    {["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"].map((dName, dayIdx) => {
                      const selected = selectedDays.includes(dayIdx);
                      return (
                        <button
                          key={dName}
                          type="button"
                          onClick={() => {
                            if (selected) setSelectedDays(selectedDays.filter(d => d !== dayIdx));
                            else setSelectedDays([...selectedDays, dayIdx]);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] border ${
                            selected ? "bg-yellow-500 border-yellow-500 text-black font-bold" : "border-[var(--matrix-border)] text-gray-400"
                          }`}
                        >
                          {dName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* ВКЛАДКИ СОДЕРЖИМОГО */}
        {activeTab === "tasks" && (
          <section>
            <h2 className="text-xs font-mono text-[var(--matrix-green)]/80 mb-3 tracking-widest uppercase">
              // ACTIVE_DIRECTIVES ({tasks.filter(t => !t.completed).length})
            </h2>
            <div className="space-y-1">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask} 
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === "habits" && (
          <section>
            <h2 className="text-xs font-mono text-[var(--matrix-green)]/80 mb-3 tracking-widest uppercase">
              // DAILY_DAEMON_ROUTINES ({habits.length})
            </h2>
            <HabitTracker 
              habits={habits} 
              onToggleHabitDate={toggleHabitDate} 
              onDeleteHabit={deleteHabit} 
            />
          </section>
        )}

        {activeTab === "quests" && (
          <section>
            <h2 className="text-xs font-mono text-yellow-400/80 mb-3 tracking-widest uppercase">
              // EPIC_LONG_TERM_QUESTS ({quests.length})
            </h2>
            <QuestTracker 
              quests={quests} 
              onToggleSubtask={toggleSubtask} 
              onAddSubtask={addSubtaskToQuest} 
              onDeleteQuest={deleteQuest} 
            />
          </section>
        )}

        {activeTab === "calendar" && (
          <section>
            <CalendarView 
              tasks={tasks}
              habits={habits}
              quests={quests}
              selectedDateStr={inputDueDate}
              onSelectDate={setInputDueDate}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onToggleSubtask={toggleSubtask}
            />
          </section>
        )}

      </main>
    </div>
  );
}