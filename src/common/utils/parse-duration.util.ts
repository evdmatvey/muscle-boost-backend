const DURATION_MULTIPLIERS: Record<string, number> = {
  d: 86_400_000,
  h: 3_600_000,
  m: 60_000,
  s: 1_000,
};

export const parseDurationToMs = (duration: string): number => {
  const match = /^(\d+)([dhms])$/.exec(duration);

  if (!match?.[1] || !match[2]) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  const multiplier = DURATION_MULTIPLIERS[unit];

  if (multiplier === undefined) {
    throw new Error(`Invalid duration unit: ${unit}`);
  }

  return value * multiplier;
};
