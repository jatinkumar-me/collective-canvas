import State, { Reversible } from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection, UserCommand } from "../modules/network";
import ToolAttributes, { DefaultToolAttributes } from "./toolAttributes";
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

  protected abstract mouseDownEventListener: (this: Document, ev: MouseEvent | TouchEvent) => any;
  protected abstract mouseUpEventListener: (this: Document, ev: MouseEvent | TouchEvent) => any;
  protected abstract mouseMoveEventListener: (this: Document, ev: MouseEvent | TouchEvent) => any;

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

    document.addEventListener("touchstart", this.mouseDownEventListener);
    document.addEventListener("touchend", this.mouseUpEventListener);
    document.addEventListener("touchmove", this.mouseMoveEventListener, { passive: false });
  }

  removeEvents() {
    this.baseLayer.canvas.removeEventListener('blur', this.canvasFocusEventListener);
    document.removeEventListener("mousedown", this.mouseDownEventListener);
    document.removeEventListener("mouseup", this.mouseUpEventListener);
    document.removeEventListener("mousemove", this.mouseMoveEventListener);

    document.removeEventListener("touchstart", this.mouseDownEventListener);
    document.removeEventListener("touchend", this.mouseUpEventListener);
    document.removeEventListener("touchmove", this.mouseMoveEventListener);
  }


  onMouseDown(event: MouseEvent | TouchEvent) {
    this.isDrag = true;
    this.mouseAverageSpeed = 0;
    this.mouseLastPosition = this.getMouseCoordinates(event);
    this.mouseLastClickPosition = this.mouseLastPosition;
    this.sendMessageOverConnection();
  }

  onMouseMove(event: MouseEvent | TouchEvent) {
    if (event instanceof TouchEvent && this.isValidMouseEvent(event)) {
      event.preventDefault();
    }
    const currentMousePosition = this.getMouseCoordinates(event);

    this.mouseAverageSpeed = this.getMouseAverageSpeed(currentMousePosition);
    this.mouseLastPosition = currentMousePosition;
    this.sendMessageOverConnection();
  }

  onMouseUp(_event: MouseEvent | TouchEvent) {
    this.isDrag = false;
    this.sendMessageOverConnection();
  }

  isValidMouseEvent(event: MouseEvent | TouchEvent): boolean {
    const rect = this.baseLayer.canvas.getBoundingClientRect();
    const [clientX, clientY] = this.getClientCoordinates(event);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return (x >= 0 && x <= this.baseLayer.canvas.width && y >= 0 && y <= this.baseLayer.canvas.height); 
  }

  getClientCoordinates(event: MouseEvent | TouchEvent): [number, number] {
    let clientX: number, clientY: number;
    if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    return [clientX, clientY];
  }

  getMouseCoordinates(event: MouseEvent | TouchEvent): [number, number] {
    const { x, y } = this.baseLayer.canvas.getBoundingClientRect();
    const [clientX, clientY] = this.getClientCoordinates(event);
    const mouseX = Math.round(clientX - x);
    const mouseY = Math.round(clientY - y);

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

  saveToolAttributes() {
    const toolAttribString = JSON.stringify(this.toolAttrib.getAttributes());
    localStorage.setItem(this.toolName, toolAttribString);
  }

  retrieveToolAttributes(): DefaultToolAttributes<any> | null {
    const toolAttribString = localStorage.getItem(this.toolName);
    if (!toolAttribString) {
      return null;
    }
    return JSON.parse(toolAttribString) as DefaultToolAttributes<any>;
  }

  destroy() {
    this.removeEvents();
    this.toolAttrib.removeEvents();
    this.saveToolAttributes();
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
