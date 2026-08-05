"use client";

import { useState, useEffect } from "react";
import { Task } from "@/components/matrix/TaskCard";
import { Habit } from "@/components/matrix/HabitTracker";
import { Quest } from "@/components/matrix/QuestTracker";
import { soundFx } from "@/lib/sound";
import { getTodayStr, calculateStreak } from "@/lib/utils";
import { getXpNeededForLevel, getRankForLevel, RankInfo, XP_PRESETS, getPrestigeMultiplier, roundSymmetric } from "@/lib/gamification";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

const STORAGE_KEY = "matrix_planner_user_data_v3";

export function useMatrixData() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "habits" | "quests" | "calendar">("tasks");
  const [matrixRain, setMatrixRain] = useState(false);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoadedFromCloud, setIsLoadedFromCloud] = useState(false);

  // Профиль оперативника
  const [username, setUsername] = useState("OPERATIVE_101");
  const [level, setLevel] = useState(1);
  const [highestLevel, setHighestLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [prestige, setPrestige] = useState(0);
  const [currentTheme, setCurrentTheme] = useState("classic-matrix");

  // Состояние открытых квестов: { [questId]: true/false }
  const [expandedQuestIds, setExpandedQuestIds] = useState<Record<string, boolean>>({});

  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    newRank: RankInfo;
    unlockedThemeId?: string;
  } | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setIsLoadedFromCloud(false);
        loadFromSupabase(currentUser.id);
      } else {
        loadFromLocalStorage();
        setIsLoadedFromCloud(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setIsLoadedFromCloud(false);
        loadFromSupabase(currentUser.id);
      } else {
        loadFromLocalStorage();
        setIsLoadedFromCloud(true);
      }
    });

    setMounted(true);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && (window.location.hash || window.location.href.includes("#"))) {
      const timer = setTimeout(() => {
        const cleanUrl = window.location.origin + window.location.pathname + window.location.search;
        window.history.replaceState(null, "", cleanUrl);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUsername(parsed.username || "OPERATIVE_101");
        setLevel(parsed.level || 1);
        setHighestLevel(parsed.highestLevel || parsed.level || 1);
        setXp(parsed.xp || 0);
        setPrestige(parsed.prestige || 0);
        setCurrentTheme(parsed.currentTheme || "classic-matrix");
        setExpandedQuestIds(parsed.expandedQuestIds || {});
        setTasks(parsed.tasks || []);
        setHabits(parsed.habits || []);
        setQuests(parsed.quests || []);
        setMatrixRain(parsed.matrixRain || false);
      }
    } catch (e) {
      console.error("Ошибка загрузки из localStorage:", e);
    }
  };

  const loadFromSupabase = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
      }

      const { data: plannerData } = await supabase
        .from("planner_data")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (plannerData) {
        setLevel(plannerData.level || 1);
        setHighestLevel(plannerData.highest_level || plannerData.level || 1);
        setXp(plannerData.xp || 0);
        setPrestige(plannerData.prestige || 0);
        setCurrentTheme(plannerData.current_theme || "classic-matrix");
        setTasks(plannerData.tasks || []);
        setHabits(plannerData.habits || []);
        setQuests(plannerData.quests || []);
      }
    } catch (e) {
      console.error("Ошибка скачивания из Supabase:", e);
    } finally {
      setIsLoadedFromCloud(true);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    try {
      const dataToSave = { 
        username,
        level, 
        highestLevel,
        xp, 
        prestige, 
        currentTheme, 
        expandedQuestIds,
        tasks, 
        habits, 
        quests, 
        matrixRain 
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Ошибка сохранения в localStorage:", e);
    }

    if (user && isLoadedFromCloud) {
      syncToSupabase(user.id);
    }
  }, [username, level, highestLevel, xp, prestige, currentTheme, expandedQuestIds, tasks, habits, quests, matrixRain, mounted, user, isLoadedFromCloud]);

  const syncToSupabase = async (userId: string) => {
    try {
      await supabase
        .from("profiles")
        .update({ username, updated_at: new Date().toISOString() })
        .eq("id", userId);

      await supabase
        .from("planner_data")
        .upsert({
          user_id: userId,
          level,
          highest_level: highestLevel,
          xp,
          prestige,
          current_theme: currentTheme,
          tasks,
          habits,
          quests,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    } catch (e) {
      console.error("Ошибка синхронизации с Supabase:", e);
    }
  };

  // Переключение развернутости квеста
  const toggleQuestExpanded = (questId: string) => {
    setExpandedQuestIds(prev => ({
      ...prev,
      [questId]: prev[questId] === undefined ? false : !prev[questId]
    }));
  };

  const applyXpDelta = (baseDelta: number) => {
    if (baseDelta === 0) return;

    const multiplier = getPrestigeMultiplier(prestige);
    const finalDelta = roundSymmetric(baseDelta * multiplier);

    if (finalDelta > 0) {
      setXp((prevXp) => {
        let updatedXp = prevXp + finalDelta;
        let currentLvl = level;
        let neededXp = getXpNeededForLevel(currentLvl);
        const oldRank = getRankForLevel(currentLvl);

        let leveledUp = false;
        while (updatedXp >= neededXp) {
          updatedXp -= neededXp;
          currentLvl += 1;
          neededXp = getXpNeededForLevel(currentLvl);
          leveledUp = true;
        }

        if (leveledUp) {
          setLevel(currentLvl);
          setHighestLevel((prevMax) => Math.max(prevMax, currentLvl));

          const newRank = getRankForLevel(currentLvl);
          soundFx.playLevelUp();

          if (newRank.title !== oldRank.title) {
            setLevelUpData({
              newLevel: currentLvl,
              newRank,
              unlockedThemeId: newRank.unlockedThemeId,
            });
          }
        }

        return updatedXp;
      });
    } else {
      const absDelta = Math.abs(finalDelta);
      setXp((prevXp) => {
        let updatedXp = prevXp - absDelta;
        let currentLvl = level;

        while (updatedXp < 0 && currentLvl > 1) {
          currentLvl -= 1;
          const prevNeededXp = getXpNeededForLevel(currentLvl);
          updatedXp += prevNeededXp;
        }

        if (currentLvl !== level) {
          setLevel(currentLvl);
        }

        return Math.max(0, updatedXp);
      });
    }
  };

  const activatePrestige = () => {
    if (level < 30) return;
    setPrestige((prev) => prev + 1);
    setLevel(1);
    setXp(0);
    soundFx.playLevelUp();
  };

  const toggleTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const nextState = !target.completed;
    const reward = target.xpReward || XP_PRESETS.LOW;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextState } : t))
    );

    applyXpDelta(nextState ? reward : -reward);
  };

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const toggleHabitDate = (id: string, dateStr: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const nextState = !habit.history[dateStr];
    const reward = habit.xpReward || XP_PRESETS.LOW;

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          return { ...h, history: { ...h.history, [dateStr]: nextState } };
        }
        return h;
      })
    );

    applyXpDelta(nextState ? reward : -reward);
  };

  const deleteHabit = (id: string) => setHabits((prev) => prev.filter((h) => h.id !== id));

  const toggleSubtask = (questId: string, subtaskId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    const subtask = quest.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    const nextState = !subtask.completed;
    const subtaskReward = subtask.xpReward || quest.subtaskXpReward || XP_PRESETS.LOW;

    const wasQuestCompleted = quest.subtasks.every((s) => s.completed) && quest.subtasks.length > 0;

    const updatedSubtasks = quest.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: nextState } : s
    );

    const isQuestNowCompleted = updatedSubtasks.every((s) => s.completed) && updatedSubtasks.length > 0;

    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, subtasks: updatedSubtasks } : q))
    );

    let xpDelta = nextState ? subtaskReward : -subtaskReward;

    if (!wasQuestCompleted && isQuestNowCompleted) {
      xpDelta += (quest.xpReward || XP_PRESETS.EPIC);
    } else if (wasQuestCompleted && !isQuestNowCompleted) {
      xpDelta -= (quest.xpReward || XP_PRESETS.EPIC);
    }

    applyXpDelta(xpDelta);
  };

  const addSubtaskToQuest = (questId: string, title: string, dueDate?: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            subtasks: [
              ...q.subtasks,
              { 
                id: Date.now().toString(), 
                title, 
                dueDate, 
                xpReward: q.subtaskXpReward || XP_PRESETS.LOW, 
                completed: false 
              },
            ],
          };
        }
        return q;
      })
    );
  };

  const deleteQuest = (id: string) => setQuests((prev) => prev.filter((q) => q.id !== id));

  const exportData = () => {
    const dataStr = JSON.stringify({ username, level, highestLevel, xp, prestige, currentTheme, tasks, habits, quests }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `matrix_planner_backup_${getTodayStr()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.tasks && parsed.habits && parsed.quests) {
          setUsername(parsed.username || "OPERATIVE_101");
          setLevel(parsed.level || 1);
          setHighestLevel(parsed.highestLevel || parsed.level || 1);
          setXp(parsed.xp || 0);
          setPrestige(parsed.prestige || 0);
          setCurrentTheme(parsed.currentTheme || "classic-matrix");
          setTasks(parsed.tasks);
          setHabits(parsed.habits);
          setQuests(parsed.quests);
          soundFx.playLevelUp();
          alert("БЭКАП МАТРИЦЫ УСПЕШНО ЗАГРУЖЕН!");
        } else {
          alert("ОШИБКА: Неверный формат файла бэкапа!");
        }
      } catch (err) {
        alert("ОШИБКА чтения файла бэкапа!");
      }
    };
    reader.readAsText(file);
  };

  const totalStreak = habits.length > 0 ? Math.max(...habits.map((h) => calculateStreak(h.history))) : 0;

  return {
    mounted,
    activeTab,
    setActiveTab,
    matrixRain,
    setMatrixRain,
    user,
    username,
    setUsername,
    level,
    highestLevel,
    xp,
    prestige,
    currentTheme,
    setCurrentTheme,
    expandedQuestIds,
    toggleQuestExpanded,
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
  };
}