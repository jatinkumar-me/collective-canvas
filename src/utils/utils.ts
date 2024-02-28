/**
 * Clamps a value of a function between a min and max value;
 *
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * function to get the square dimensions of the rectangle
 * @param width
 * @param height
 * @returns [squareWidth, squareHeight]
 */
export function getSquareDimensions(
  width: number,
  height: number
): [number, number] {
  const signX = Math.sign(width);
  const signY = Math.sign(height);
  const absWidth = Math.abs(width);
  const absHeight = Math.abs(height);
  const minDimension = Math.max(absWidth, absHeight);
  width = signX * minDimension;
  height = signY * minDimension;
  return [width, height];
}
