import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateFlexibilityScore(answers: { itemId: string; value: number }[]) {
  // Группируем ответы по процессам (4 пункта на процесс)
  const processAnswers: Record<string, number[]> = {
    acceptance: [],
    defusion: [],
    presentMoment: [],
    selfAsContext: [],
    values: [],
    committedAction: [],
  };

  // Пример распределения (в реальности нужно маппировать по ID вопросов)
  const processKeys = Object.keys(processAnswers);
  answers.forEach((answer, index) => {
    const processIndex = Math.floor(index / 4);
    const process = processKeys[processIndex] as keyof typeof processAnswers;
    
    // Реверс-кодирование для "застревающих" пунктов (нечётные индексы в группе)
    const isInflexItem = (index % 4) >= 2;
    const value = isInflexItem ? 8 - answer.value : answer.value;
    processAnswers[process].push(value);
  });

  // Вычисляем среднее по каждому процессу и нормализуем к 0-100
  const scores: Record<string, number> = {};
  let total = 0;

  Object.entries(processAnswers).forEach(([process, values]) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    // Нормализация с шкалы 1-7 к 0-100
    const normalized = ((avg - 1) / 6) * 100;
    scores[process] = Math.round(normalized);
    total += normalized;
  });

  return {
    acceptance: scores.acceptance,
    defusion: scores.defusion,
    presentMoment: scores.presentMoment,
    selfAsContext: scores.selfAsContext,
    values: scores.values,
    committedAction: scores.committedAction,
    composite: Math.round(total / 6),
  };
}

export function calculateValuesGap(importance: number, consistency: number): number {
  return importance - consistency;
}

export function getPriorityDomains(valuesEntries: Array<{ domain: string; importance: number; gap: number }>): string[] {
  return valuesEntries
    .sort((a, b) => {
      // Сначала по gap (убывание), затем по importance (убывание)
      if (b.gap !== a.gap) return b.gap - a.gap;
      return b.importance - a.importance;
    })
    .slice(0, 3)
    .map(entry => entry.domain);
}

export function formatTokenAmount(amount: number): string {
  return amount >= 0 ? `+${amount}` : `${amount}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getProcessName(process: string): string {
  const names: Record<string, string> = {
    ACCEPTANCE: 'Принятие',
    DEFUSION: 'Разделение',
    PRESENT_MOMENT: 'Контакт с настоящим моментом',
    SELF_AS_CONTEXT: 'Наблюдающее Я',
    VALUES: 'Ценности',
    COMMITTED_ACTION: 'Проактивность',
  };
  return names[process] || process;
}

export function getProcessColor(process: string): string {
  const colors: Record<string, string> = {
    ACCEPTANCE: 'bg-blue-500',
    DEFUSION: 'bg-purple-500',
    PRESENT_MOMENT: 'bg-green-500',
    SELF_AS_CONTEXT: 'bg-indigo-500',
    VALUES: 'bg-pink-500',
    COMMITTED_ACTION: 'bg-orange-500',
  };
  return colors[process] || 'bg-gray-500';
}
