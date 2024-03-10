import State, { Reversible } from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection, UserCommand } from "../modules/network";
import ToolAttributes from "./toolAttributes";
import { ToolName } from "./toolManager";

/**
 * @class BaseTools
 * TODO:
 * - Add support for touch devices.
 * - Make the code a lot more cleaner.
 */
export default abstract class BaseTools implements Reversible {
  baseLayer: BaseLayer;
  connection: Connection | null;
  state: State;

  abstract toolAttrib: ToolAttributes;
  abstract toolName: ToolName;

  isDrag: boolean;
  isTouch: boolean;
  mouseLastClickPosition: [number, number];
  mouseLastPosition: [number, number];
  mouseAverageSpeed: number;
  readonly MAX_AVERAGE_MOUSE_SPEED = 100;

  private canvasFocusEventListener: (this: HTMLCanvasElement, ev: FocusEvent) => any;

  protected abstract mouseDownEventListener: (this: Document, ev: MouseEvent) => any;
  protected abstract mouseUpEventListener: (this: Document, ev: MouseEvent) => any;
  protected abstract mouseMoveEventListener: (this: Document, ev: MouseEvent) => any;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    this.baseLayer = baseLayer;
    this.state = state;
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
    document.addEventListener("mousedown", this.mouseDownEventListener);
    document.addEventListener("mouseup", this.mouseUpEventListener);
    document.addEventListener("mousemove", this.mouseMoveEventListener);
  }

  removeEvents() {
    this.baseLayer.canvas.removeEventListener('blur', this.canvasFocusEventListener);
    document.removeEventListener("mousedown", this.mouseDownEventListener);
    document.removeEventListener("mouseup", this.mouseUpEventListener);
    document.removeEventListener("mousemove", this.mouseMoveEventListener);
  }


  onMouseDown(event: MouseEvent) {
    this.isDrag = true;
    this.mouseAverageSpeed = 0;
    this.mouseLastPosition = this.getMouseCoordinates(event);
    this.mouseLastClickPosition = this.mouseLastPosition;
    this.sendMessageOverConnection();
  }

  onMouseMove(event: MouseEvent) {
    const currentMousePosition = this.getMouseCoordinates(event);

    this.mouseAverageSpeed = this.getMouseAverageSpeed(currentMousePosition);
    this.mouseLastPosition = currentMousePosition;
    this.sendMessageOverConnection();
  }

  onMouseUp(_event: MouseEvent) {
    this.isDrag = false;
    this.sendMessageOverConnection();
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

  getCommand<T extends ToolAttributes>(draw?: boolean): UserCommand<T> {
    return {
      x: this.mouseLastPosition[0],
      y: this.mouseLastPosition[1],
      isDrag: this.isDrag,
      toolName: this.toolName,
      toolAttributes: this.toolAttrib.getAttributes(),
      draw: draw,
      clickX: this.mouseLastClickPosition[0],
      clickY: this.mouseLastClickPosition[1],
    }
  }

  destroy() {
    this.removeEvents();
    this.toolAttrib.removeEvents();
  }

  /**
  * Abstract methods needs to implemented by the child tool class.
  */
  abstract draw(): void;
  abstract sendMessageOverConnection(): void;
  abstract recordCommand(): void;

  abstract mouseDown(event: MouseEvent): void;
  abstract mouseUp(event: MouseEvent): void;
  abstract mouseMove(event: MouseEvent): void;
}
