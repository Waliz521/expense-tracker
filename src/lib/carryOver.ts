/**
 * Carry-over: money remaining from previous month integrated into next month's income.
 * Source format: "Carried over from February 2026" — flagged so it's not counted as savings.
 */
export const CARRIED_OVER_SOURCE_PREFIX = 'Carried over from ';

export function isCarriedOverIncome(source: string): boolean {
  return source.startsWith(CARRIED_OVER_SOURCE_PREFIX);
}

export function getCarriedOverSourceLabel(monthLabel: string): string {
  return `${CARRIED_OVER_SOURCE_PREFIX}${monthLabel}`;
}
