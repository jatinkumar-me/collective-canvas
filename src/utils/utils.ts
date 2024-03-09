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
 * @param imageData 
 * @returns {Uint8ClampedArray} - Returns an array of length 4 consisting of RGBA value.
 */
export function getColorAtPixel(
  imageData: ImageData,
  x: number,
  y: number,
): Uint8ClampedArray {
  const { width } = imageData;
  const offset = getOffset(width, x, y);

  return imageData.data.slice(offset, offset + 4);
}

/**
 * function to get RGBA value at a particular coordinate.
 * @param x 
 * @param y 
 * @param imageData 
 * @returns {Uint8ClampedArray} - Returns an array of length 4 consisting of RGBA value.
 */
export function setPixel(
  imageData: ImageData,
  x: number,
  y: number,
  color: Uint8ClampedArray
): void {
  const offset = (y * imageData.width + x) * 4;
  imageData.data[offset + 0] = color[0];
  imageData.data[offset + 1] = color[1];
  imageData.data[offset + 2] = color[2];
  imageData.data[offset + 3] = 255;
}

/**
 * Convert hexColor obtained from color picker to a UintClampedArray
 */
export function hexStringToUintClampedArray(
  hex: string,
): Uint8ClampedArray {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return new Uint8ClampedArray([r, g, b, 0]);
}
