"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, ShieldCheck, Flame, Star, Zap, Save, Check, LogOut, Mail, Lock, Sparkles, AlertTriangle } from "lucide-react";
import { RankInfo, toRomanNumeral, getPrestigeMultiplier } from "@/lib/gamification";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

type AuthMode = "login" | "register" | "forgot";

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
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [inputName, setInputName] = useState(username);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Синхронизируем инпут при каждом открытии или изменении позывного
  useEffect(() => {
    if (isOpen) {
      setInputName(username);
    }
  }, [isOpen, username]);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
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
        setSuccessMsg("Регистрация успешна! Проверьте почту для подтверждения.");
      } else if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        });
        if (error) throw error;
        setSuccessMsg("Инструкция по сбросу пароля отправлена на вашу почту!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка авторизации";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const redirectUrl = typeof window !== "undefined" ? window.location.origin : "https://matrix-planner-five.vercel.app";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка Google Входа";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await supabase.from("planner_data").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      localStorage.clear();
      onClose();
      alert("Ваш аккаунт и все связанные данные успешно удалены.");
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении аккаунта");
    } finally {
      setLoading(false);
    }
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

            <div className="bg-[var(--matrix-bg)] border border-[var(--matrix-border)] p-3 rounded text-xs space-y-1">
              <p className="text-gray-400 text-[10px] uppercase font-bold">ПРИВЯЗАННЫЙ EMAIL:</p>
              <p className="text-white font-bold truncate">{user.email}</p>
            </div>

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

            <div className="pt-2 border-t border-[var(--matrix-border)] space-y-2">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20 py-2 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> ВЫЙТИ ИЗ АККАУНТА
              </button>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-[10px] text-gray-500 hover:text-red-400 underline text-center block pt-1"
                >
                  Удалить аккаунт и данные...
                </button>
              ) : (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded text-xs space-y-2 text-center">
                  <p className="text-red-300 text-[11px] font-bold flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> ВНИМАНИЕ! ВСЕ ДАННЫЕ БУДУТ УДАЛЕНЫ!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-black/40 border border-gray-600 text-gray-300 py-1 rounded text-[10px]"
                    >
                      ОТМЕНА
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white font-bold py-1 rounded text-[10px] hover:bg-red-700"
                    >
                      {loading ? "УДАЛЕНИЕ..." : "ДА, УДАЛИТЬ"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ФОРМА АВТОРИЗАЦИИ */
          <div className="space-y-4">
            <div className="flex border-b border-[var(--matrix-border)] text-xs font-bold">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setErrorMsg(""); setSuccessMsg(""); }}
                className={`flex-1 py-2 text-center transition-colors ${
                  authMode === "login"
                    ? "border-b-2 border-[var(--matrix-green)] text-[var(--matrix-green)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                [ ВХОД ]
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setErrorMsg(""); setSuccessMsg(""); }}
                className={`flex-1 py-2 text-center transition-colors ${
                  authMode === "register"
                    ? "border-b-2 border-[var(--matrix-green)] text-[var(--matrix-green)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                [ РЕГИСТРАЦИЯ ]
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/40 text-red-400 text-xs rounded">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs rounded">
                {successMsg}
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

              {authMode !== "forgot" && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[var(--matrix-green)]" /> ПАРОЛЬ:
                    </label>
                    {authMode === "login" && (
                      <button
                        type="button"
                        onClick={() => setAuthMode("forgot")}
                        className="text-[9px] text-[var(--matrix-green)] hover:underline"
                      >
                        Забыли пароль?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[var(--matrix-bg)] border border-[var(--matrix-border)] text-white px-3 py-1.5 rounded text-xs outline-none focus:border-[var(--matrix-green)]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--matrix-green)] text-black font-bold py-2 rounded text-xs hover:bg-[#00CC52] transition-colors disabled:opacity-50"
              >
                {loading
                  ? "ОБРАБОТКА..."
                  : authMode === "login"
                    ? "[ ⚡ ВОЙТИ В СИСТЕМУ ]"
                    : authMode === "register"
                      ? "[ ⚡ СОЗДАТЬ АККАУНТ ]"
                      : "[ 📧 ОТПРАВИТЬ ССЫЛКУ СБРОСА ]"}
              </button>

              {authMode === "forgot" && (
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="w-full text-center text-xs text-gray-400 hover:text-white underline block pt-1"
                >
                  Вернуться к входу
                </button>
              )}
            </form>

            {authMode !== "forgot" && (
              <>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[var(--matrix-border)]"></div>
                  <span className="flex-shrink mx-2 text-[9px] text-gray-500 uppercase">ИЛИ</span>
                  <div className="flex-grow border-t border-[var(--matrix-border)]"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/20 hover:border-yellow-400 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>ПРОДОЛЖИТЬ ЧЕРЕЗ GOOGLE</span>
                </button>
              </>
            )}
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