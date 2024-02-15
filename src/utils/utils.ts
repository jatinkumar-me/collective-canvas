
/**
 * Clamps a value of a function between a min and max value;
 *
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
