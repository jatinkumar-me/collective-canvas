import { PixelData } from "./utilTypes";

/**
 * Clamps a value of a function between a min and max value;
 *
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Find distance between two points
 */
export function calcDistance(
  a: [number, number],
  b: [number, number],
): number {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
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

/**
 * function to get the aspect ratio preserved dimensions of a rectangle
 * @param width
 * @param height
 * @param aspectRatio - width/height
 * @returns [newWidth, newHeight]
 */
export function getPreservedDimension(
  width: number,
  height: number,
  aspectRatio: number
): [number, number] {
  const signX = Math.sign(width);
  const signY = Math.sign(height);
  const absWidth = Math.abs(width);
  const absHeight = Math.abs(height);
  const maxDimension = Math.max(absWidth, absHeight);
  width = signX * maxDimension * aspectRatio;
  height = signY * maxDimension;
  return [width, height];
}

/**
 * function to get the circle dimensions of the ellipse
 * @param radiusX
 * @param radiusY
 * @returns maximumRadius
 */
export function getCircleDimensions(
  radiusX: number,
  radiusY: number
): number {
  return Math.max(radiusX, radiusY);
}

/**
 * Returns the offset for imageData
 * @param imageData width
 * @param x
 * @param y
 * @returns offset
 */
export function getOffset(
  imageDataWidth: number,
  x: number,
  y: number,
): number {
  return ((y * imageDataWidth) + x) << 2;
}

/**
 * Returns whether a pixel is within the canvas or not
 * @param x 
 * @param y 
 * @param width
 * @param height
 * @returns {boolean} isValid
 */
export function isInValidPixel(
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return x < 0 || y < 0 || x >= width || y >= height;
}

/**
 * function to get RGBA value at a particular coordinate.
 * @param x 
 * @param y 
 * @param pixelData 
 * @returns {number} - Returns a 32bit unsigned integer
 */
export function getColorAtPixel(
  pixelData: PixelData,
  x: number,
  y: number,
): number {
  const { width } = pixelData;
  return pixelData.data[y * width + x];
}

/**
 * function to set RGBA value at a particular coordinate.
 * @param pixelData 
 * @param x 
 * @param y 
 * @param number - Uint32 number representing RGBA value
 */
export function setPixel(
  pixelData: PixelData,
  x: number,
  y: number,
  color: number
): void {
  const red = (color >> 24) & 0xFF;     // Extract Red (most significant byte)
  const green = (color >> 16) & 0xFF;   // Extract Green (second byte from the left)
  const blue = (color >> 8) & 0xFF;     // Extract Blue (third byte from the left)
  const alpha = color & 0xFF;           // Extract Alpha (third byte from the left)

  const abgrColor = (alpha << 24) | (blue << 16) | (green << 8) | red;
  pixelData.data[y * pixelData.width + x] = abgrColor;
}

/**
 * Convert hexColor obtained from color picker to a Uint32 number
 * It adds alpha channel if it's not present.
 */
export function hexStringToUintClampedArray(
  hex: string,
): number {
  hex = hex.replace('#', '');

  // Append alpha channel in the color
  if (hex.length <= 6) {
    hex += 'FF';
  }

  return parseInt(hex, 16) >>> 0;
}

/**
 * Snap the 'free' end of a line to a point such that the new line
 * makes an angle that is a multiple of 15deg with the x axis.
 * 
 */
export function snapFreeEndAngle(
  startPoint: [number, number],
  endPoint: [number, number],
): void {
  const SNAP_ANGLE = Math.PI / 12;

  let currentAngle = Math.atan2(endPoint[1] - startPoint[1], endPoint[0] - startPoint[0]);
  currentAngle = Math.round(currentAngle/SNAP_ANGLE) * SNAP_ANGLE;

  const distance = calcDistance(startPoint, endPoint);

  endPoint[0] = startPoint[0] + distance * Math.cos(currentAngle);
  endPoint[1] = startPoint[1] + distance * Math.sin(currentAngle);
}
