"use client";

import { ChevronUp, ChevronDown, Calendar as CalendarIcon } from "lucide-react";

interface CyberDatePickerProps {
  value: string;
  onChange: (newDateStr: string) => void;
}

export const CyberDatePicker = ({ value, onChange }: CyberDatePickerProps) => {
  const dateObj = value ? new Date(value) : new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();

  const updateDate = (newY: number, newM: number, newD: number) => {
    const maxDays = new Date(newY, newM + 1, 0).getDate();
    const validD = Math.min(Math.max(1, newD), maxDays);
    const validM = Math.min(Math.max(0, newM), 11);

    const formattedY = newY;
    const formattedM = String(validM + 1).padStart(2, "0");
    const formattedD = String(validD).padStart(2, "0");

    onChange(`${formattedY}-${formattedM}-${formattedD}`);
  };

  const handleWheelDay = (e: React.WheelEvent) => {
    e.preventDefault();
    updateDate(year, month, day + (e.deltaY < 0 ? 1 : -1));
  };

  const handleWheelMonth = (e: React.WheelEvent) => {
    e.preventDefault();
    updateDate(year, month + (e.deltaY < 0 ? 1 : -1), day);
  };

  const handleWheelYear = (e: React.WheelEvent) => {
    e.preventDefault();
    updateDate(year + (e.deltaY < 0 ? 1 : -1), month, day);
  };

  return (
    <div className="flex items-center gap-1 bg-[var(--matrix-bg)] border border-[var(--matrix-border)] px-2 py-1 rounded font-mono text-xs select-none">
      <CalendarIcon className="w-4 h-4 text-[var(--matrix-green)] mr-1" />

      {/* ДЕНЬ */}
      <div className="flex flex-col items-center group cursor-pointer" onWheel={handleWheelDay}>
        <button type="button" onClick={() => updateDate(year, month, day + 1)} className="text-[var(--matrix-green)]/70 hover:text-[var(--matrix-green)]">
          <ChevronUp className="w-3 h-3" />
        </button>
        <span className="font-bold text-[var(--matrix-green)] bg-[var(--matrix-dark-green)] px-1.5 py-0.5 rounded border border-[var(--matrix-border)] hover:border-[var(--matrix-green)]">
          {String(day).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => updateDate(year, month, day - 1)} className="text-[var(--matrix-green)]/70 hover:text-[var(--matrix-green)]">
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <span className="text-[var(--matrix-green)] font-bold">.</span>

      {/* МЕСЯЦ */}
      <div className="flex flex-col items-center group cursor-pointer" onWheel={handleWheelMonth}>
        <button type="button" onClick={() => updateDate(year, month + 1, day)} className="text-[var(--matrix-green)]/70 hover:text-[var(--matrix-green)]">
          <ChevronUp className="w-3 h-3" />
        </button>
        <span className="font-bold text-[var(--matrix-green)] bg-[var(--matrix-dark-green)] px-1.5 py-0.5 rounded border border-[var(--matrix-border)] hover:border-[var(--matrix-green)]">
          {String(month + 1).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => updateDate(year, month - 1, day)} className="text-[var(--matrix-green)]/70 hover:text-[var(--matrix-green)]">
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <span className="text-[var(--matrix-green)] font-bold">.</span>

      {/* ГОД */}
      <div className="flex flex-col items-center group cursor-pointer" onWheel={handleWheelYear}>
        <button type="button" onClick={() => updateDate(year + 1, month, day)} className="text-[var(--matrix-green)]/70 hover:text-[var(--matrix-green)]">
          <ChevronUp className="w-3 h-3" />
        </button>
        <span className="font-bold text-[var(--matrix-green)] bg-[var(--matrix-dark-green)] px-1.5 py-0.5 rounded border border-[var(--matrix-border)] hover:border-[var(--matrix-green)]">
          {year}
        </span>
        <button type="button" onClick={() => updateDate(year - 1, month, day)} className="text-[var(--matrix-green)]/70 hover:text-[var(--matrix-green)]">
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};