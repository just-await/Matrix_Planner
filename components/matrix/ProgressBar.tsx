"use client";

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
}

export const ProgressBar = ({ value, label, sublabel, showPercent = true }: ProgressBarProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  // Генерация ASCII псевдографики [██████░░░░]
  const totalBlocks = 20;
  const filledBlocks = Math.round((clampedValue / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  
  const asciiBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  return (
    <div className="w-full font-mono my-2">
      {(label || sublabel) && (
        <div className="flex justify-between text-xs mb-1 opacity-90">
          <span className="font-bold tracking-wider">{label}</span>
          <span className="text-[#00B347]">{sublabel}</span>
        </div>
      )}
      
      <div className="relative bg-[#051A0B] border border-[#004D1F] rounded p-1.5 glow-border">
        {/* Графический Progress Bar */}
        <div 
          className="h-3 bg-[#00FF66] rounded-sm transition-all duration-500 ease-out shadow-[0_0_12px_#00FF66]"
          style={{ width: `${clampedValue}%` }}
        />
        
        {/* Текстовый ASCII прогресс бар внизу */}
        <div className="flex justify-between text-[10px] mt-1 text-[#00B347] tracking-widest select-none">
          <span>[{asciiBar}]</span>
          {showPercent && <span className="font-bold text-[#00FF66]">{clampedValue}%</span>}
        </div>
      </div>
    </div>
  );
};