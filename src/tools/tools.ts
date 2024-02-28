import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";

/**
 * @class BaseTools
 */
export default abstract class BaseTools {
  baseLayer: BaseLayer;
  connection: Connection | null;

  isDrag: boolean;
  isTouch: boolean;
  mouseLastClickPosition: [number, number];
  mouseLastPosition: [number, number];
  mouseAverageSpeed: number;
  readonly MAX_AVERAGE_MOUSE_SPEED = 100;

  private canvasFocusEventListener: (this: HTMLCanvasElement, ev: FocusEvent) => any;

  constructor(baseLayer: BaseLayer, connection: Connection) {
    this.baseLayer = baseLayer;
    this.connection = connection;
    this.isDrag = false;
    this.isTouch = false;
    this.mouseLastClickPosition = [0, 0];
    this.mouseLastPosition = [0, 0];
    this.mouseAverageSpeed = 0;

    this.canvasFocusEventListener = this.onCanvasBlur.bind(this);
  }

  events() {
    this.baseLayer.canvas.addEventListener('blur', this.canvasFocusEventListener);
  }

  onMouseDown(event: MouseEvent) {
    this.isDrag = true;
    this.mouseAverageSpeed = 0;
    this.mouseLastPosition = this.getMouseCoordinates(event);
    this.mouseLastClickPosition = this.mouseLastPosition;
  }

  onMouseMove(event: MouseEvent) {
    const currentMousePosition = this.getMouseCoordinates(event);

    this.mouseAverageSpeed = this.getMouseAverageSpeed(currentMousePosition);
    this.mouseLastPosition = currentMousePosition;
  }

  onMouseUp(_event: MouseEvent) {
    this.isDrag = false;
  }

  isValidMouseEvent(event: MouseEvent): boolean {
    const rect = this.baseLayer.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return (x >= 0 && x <= this.baseLayer.canvas.width && y >= 0 && y <= this.baseLayer.canvas.height); 
  }

  getMouseCoordinates(event: MouseEvent): [number, number] {
    const { x, y } = this.baseLayer.canvas.getBoundingClientRect();
    const mouseX = Math.round(event.clientX - x);
    const mouseY = Math.round(event.clientY - y);

    return [mouseX, mouseY];
  }

  getMouseAverageSpeed([mouseX, mouseY]: [number, number]): number {
    if (this.isDrag == false) return 0;

    const movementX = Math.round(Math.abs(mouseX - this.mouseLastPosition[0]));
    const movementY = Math.round(Math.abs(mouseY - this.mouseLastPosition[1]));

    const distance = movementX + movementY;

    return Math.min(distance, this.MAX_AVERAGE_MOUSE_SPEED);
  }

  onCanvasBlur(_event: FocusEvent) {
    this.isDrag = false;
  }

  removeEvents() {
    this.baseLayer.canvas.removeEventListener('blur', this.canvasFocusEventListener);
  }

  destroy() {
    this.removeEvents();
  }
}
