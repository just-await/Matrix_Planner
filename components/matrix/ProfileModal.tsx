"use client";

import { useState } from "react";
import { User as UserIcon, ShieldCheck, Flame, Star, Zap, Save, Check, LogOut, Mail, Lock, Sparkles, KeyRound } from "lucide-react";
import { RankInfo, toRomanNumeral, getPrestigeMultiplier } from "@/lib/gamification";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface ProfileModalProps {
  isOpen: boolean;
  user: SupabaseUser | null;
  username: string;
  level: number;
  rank: RankInfo;
  prestige: number;
  streak: number;
  onSaveUsername: (newUsername: string) => void;
  onClose: () => void;
}

export const ProfileModal = ({
  isOpen,
  user,
  username,
  level,
  rank,
  prestige,
  streak,
  onSaveUsername,
  onClose,
}: ProfileModalProps) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [inputName, setInputName] = useState(username);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Вход по Email / Паролю
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (authMode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: inputName.trim().toUpperCase() || "OPERATIVE_101" },
          },
        });
        if (error) throw error;
        alert("Регистрация успешна! Проверьте почту для подтверждения или войдите.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка авторизации";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // Вход через Google
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка Google Входа";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  // Выход из аккаунта
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    onSaveUsername(inputName.trim().toUpperCase());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const prestigeBonusPercent = Math.round((getPrestigeMultiplier(prestige) - 1) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="bg-[var(--matrix-dark-green)] border border-[var(--matrix-green)] p-4 sm:p-6 rounded-lg max-w-md w-full relative glow-border space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Шапка */}
        <div className="flex items-center justify-between border-b border-[var(--matrix-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded border border-[var(--matrix-green)] bg-[var(--matrix-green)]/10 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-[var(--matrix-green)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">
                OPERATIVE_PROFILE
              </h3>
              <p className="text-[10px] text-[var(--matrix-green)]/70">
                STATUS: {user ? "🟢 ONLINE (CLOUD SYNC)" : "🟡 GUEST (LOCAL STORAGE)"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 text-xs border border-[var(--matrix-border)] rounded px-2"
          >
            ESC
          </button>
        </div>

        {/* ЕСЛИ ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН */}
        {user ? (
          <div className="space-y-4">
            {/* Смена позывного */}
            <form onSubmit={handleSaveName} className="space-y-2">
              <label className="text-[10px] text-[var(--matrix-green)] uppercase font-bold tracking-wider block">
                // CALLSIGN / ПОЗЫВНОЙ ОПЕРАТИВНИКА:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  maxLength={20}
                  className="flex-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] focus:border-[var(--matrix-green)] text-white px-3 py-1.5 rounded text-xs outline-none font-mono font-bold tracking-wider"
                />
                <button
                  type="submit"
                  className="bg-[var(--matrix-green)] text-black px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 hover:bg-[#00CC52] shrink-0"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? "SAVED" : "SAVE"}</span>
                </button>
              </div>
            </form>

            {/* Данные аккаунта */}
            <div className="bg-[var(--matrix-bg)] border border-[var(--matrix-border)] p-3 rounded text-xs space-y-1">
              <p className="text-gray-400 text-[10px] uppercase font-bold">ПРИВЯЗАННЫЙ EMAIL:</p>
              <p className="text-white font-bold truncate">{user.email}</p>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[var(--matrix-bg)] border border-[var(--matrix-border)] p-2.5 rounded space-y-1">
                <span className="text-[9px] text-gray-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[var(--matrix-green)]" /> РАНГ:
                </span>
                <p className="font-bold text-[var(--matrix-green)] text-[11px] truncate">
                  {rank.title}
                </p>
              </div>

              <div className="bg-[var(--matrix-bg)] border border-[var(--matrix-border)] p-2.5 rounded space-y-1">
                <span className="text-[9px] text-gray-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[var(--matrix-green)]" /> УРОВЕНЬ:
                </span>
                <p className="font-bold text-white text-[11px]">
                  LVL {level}
                </p>
              </div>

              <div className="bg-[var(--matrix-bg)] border border-[var(--matrix-border)] p-2.5 rounded space-y-1">
                <span className="text-[9px] text-gray-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" /> ПРЕСТИЖ:
                </span>
                <p className="font-bold text-yellow-400 text-[11px]">
                  {prestige > 0 ? `★ PRESTIGE ${toRomanNumeral(prestige)} (+${prestigeBonusPercent}%)` : "— NONE —"}
                </p>
              </div>

              <div className="bg-[var(--matrix-bg)] border border-[var(--matrix-border)] p-2.5 rounded space-y-1">
                <span className="text-[9px] text-gray-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[var(--matrix-green)]" /> СТРИК:
                </span>
                <p className="font-bold text-[var(--matrix-green)] text-[11px]">
                  {streak} ДНЕЙ
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> ВЫЙТИ ИЗ АККАУНТА
            </button>
          </div>
        ) : (
          /* ЕСЛИ ГОСТЬ — ФОРМА ВХОДА И РЕГИСТРАЦИИ */
          <div className="space-y-4">
            <div className="flex border-b border-[var(--matrix-border)] text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 text-center transition-colors ${
                  authMode === "login"
                    ? "border-b-2 border-[var(--matrix-green)] text-[var(--matrix-green)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                [ 🔑 ВХОД ]
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 text-center transition-colors ${
                  authMode === "register"
                    ? "border-b-2 border-[var(--matrix-green)] text-[var(--matrix-green)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                [ ⚡ РЕГИСТРАЦИЯ ]
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === "register" && (
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">ПОЗЫВНОЙ (CALLSIGN):</label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="NEO_99"
                    required
                    className="w-full bg-[var(--matrix-bg)] border border-[var(--matrix-border)] text-white px-3 py-1.5 rounded text-xs outline-none focus:border-[var(--matrix-green)]"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] text-gray-400 block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[var(--matrix-green)]" /> EMAIL:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@matrix.net"
                  required
                  className="w-full bg-[var(--matrix-bg)] border border-[var(--matrix-border)] text-white px-3 py-1.5 rounded text-xs outline-none focus:border-[var(--matrix-green)]"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[var(--matrix-green)]" /> ПАРОЛЬ:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[var(--matrix-bg)] border border-[var(--matrix-border)] text-white px-3 py-1.5 rounded text-xs outline-none focus:border-[var(--matrix-green)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--matrix-green)] text-black font-bold py-2 rounded text-xs hover:bg-[#00CC52] transition-colors disabled:opacity-50"
              >
                {loading ? "АВТОРИЗАЦИЯ..." : authMode === "login" ? "[ ⚡ ВОЙТИ В СИСТЕМУ ]" : "[ ⚡ СОЗДАТЬ АККАУНТ ]"}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[var(--matrix-border)]"></div>
              <span className="flex-shrink mx-2 text-[9px] text-gray-500 uppercase">ИЛИ</span>
              <div className="flex-grow border-t border-[var(--matrix-border)]"></div>
            </div>

            {/* Вход через Google */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white/5 border border-white/20 hover:border-yellow-400 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>ПРОДОЛЖИТЬ ЧЕРЕЗ GOOGLE</span>
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[var(--matrix-bg)] border border-[var(--matrix-border)] text-gray-300 py-2 rounded text-xs hover:border-[var(--matrix-green)] transition-colors"
        >
          ЗАКРЫТЬ
        </button>

      </div>
    </div>
  );
};