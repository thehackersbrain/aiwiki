/**
 * Where a technique stands in current practice — a judgement, not a fact, and
 * one with a shelf life. `STATUS_AS_OF` in consts.ts is the date these were
 * last reviewed; it is shown wherever the badges are explained, because a
 * "current standard" label with no date on it is worse than no label at all.
 */
export const STATUS = {
  standard: {
    label: 'Current standard',
    short: 'standard',
    tooltip:
      'In the default recipe. You would need a reason not to use this in a model trained today.',
    blurb:
      'Part of the default recipe. Present in most frontier models trained today, and the thing a new design departs from rather than argues for.',
  },
  common: {
    label: 'Commonly used',
    short: 'common',
    tooltip: 'Well established and often the right choice, but not the default everywhere.',
    blurb:
      'Established and frequently the right choice, but competing with live alternatives rather than having settled the question.',
  },
  emerging: {
    label: 'Promising',
    short: 'promising',
    tooltip: 'Promising results, not yet settled. Adopt with your own evaluation.',
    blurb:
      'Promising and actively moving. The results are real but narrow — one lab, one model family, or one benchmark suite — and the picture may look different in a year.',
  },
  superseded: {
    label: 'Stale',
    short: 'stale',
    tooltip: 'Historically important; something else is now used in its place.',
    blurb:
      'Load-bearing for understanding how the field arrived here, and replaced in practice by something on this list. Worth reading, not worth reaching for.',
  },
} as const;

export type Status = keyof typeof STATUS;

/** Badge order for legends: settled first, then live, then historical. */
export const STATUS_ORDER: Status[] = ['standard', 'common', 'emerging', 'superseded'];
