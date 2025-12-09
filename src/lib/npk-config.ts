export const NPK_THRESHOLDS = {
  n: { low: 140, high: 280, max: 350 },
  p: { low: 30, high: 70, max: 100 },
  k: { low: 150, high: 300, max: 400 },
} as const;

export type NPKType = keyof typeof NPK_THRESHOLDS;
export type NPKStatus = 'low' | 'optimal' | 'high';

export const getNPKStatus = (value: number, type: NPKType): NPKStatus => {
  const { low, high } = NPK_THRESHOLDS[type];
  if (value < low) return 'low';
  if (value > high) return 'high';
  return 'optimal';
};

export const getNPKProgressValue = (value: number, type: NPKType) => {
    const { max } = NPK_THRESHOLDS[type];
    return Math.min((value / max) * 100, 100);
};
