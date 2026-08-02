// Вспомогательные функции для работы с датами в формате YYYY-MM-DD
export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateRu(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
}

// Расчет реальной непрерывной серии дней (Стрика)
export function calculateStreak(history: Record<string, boolean>): number {
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    if (history[dateStr]) {
      streak++;
    } else if (i > 0) {
      // Если сегодня еще не отмечено — не сбрасываем стрик сразу, даем день
      break;
    }
  }
  return streak;
}