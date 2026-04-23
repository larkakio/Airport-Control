const STORAGE_KEY = 'airport-control-v1';

export type Progress = {
  maxUnlockedLevel: number;
};

export function loadProgress(levelCount: number): Progress {
  if (typeof window === 'undefined') {
    return { maxUnlockedLevel: 1 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { maxUnlockedLevel: 1 };
    }
    const parsed = JSON.parse(raw) as Progress;
    const n = Math.max(1, Math.min(levelCount, parsed.maxUnlockedLevel ?? 1));
    return { maxUnlockedLevel: n };
  } catch {
    return { maxUnlockedLevel: 1 };
  }
}

export function saveMaxUnlockedLevel(level: number, levelCount: number) {
  const n = Math.max(1, Math.min(levelCount, level));
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ maxUnlockedLevel: n }));
}
