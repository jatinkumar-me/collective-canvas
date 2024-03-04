import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection, UserCommand } from "../modules/network";
import { getSquareDimensions } from "../utils/utils";
import ToolAttributes, {
  DefaultToolAttributes,
  ToolAttributesMarkup,
} from "./toolAttributes";
import { ToolName } from "./toolManager";
import BaseTools from "./tools";

const DEFAULT_RECTANGLE_TOOL_ATTRIBUTES: DefaultToolAttributes<RectangleToolAttributes> =
{
  strokeStyle: "#000000",
  strokeWidth: 1,
  isFilled: false,
  fillStyle: "#000000",
  isSquare: false,
};

const RECTANGLE_TOOL_ATTRIBUTE_MARKUP: ToolAttributesMarkup<RectangleToolAttributes> =
{
  strokeStyle: `<div><label for="rectangle-stroke-color-picker">Stroke color</label>
                  <input type="color" id="rectangle-stroke-color-picker" />
                  </div>`,
  strokeWidth: `<div>
                    <label for="rectangle-stroke-width-input">Stroke width</label>
                    <input type="range" id="rectangle-stroke-width-input" name="rectangle-stroke-width-input" min="1" max="50" step="1" value="${DEFAULT_RECTANGLE_TOOL_ATTRIBUTES.strokeWidth}">
               </div>`,
  isFilled: `<div>
                  <input type="checkbox" id="rectangle-isfilled" />
                  <label for="rectangle-isfilled">fill</label>
              </div>`,
  fillStyle: `<div><label for="rectangle-fill-color-picker">Fill color</label>
                  <input type="color" id="rectangle-fill-color-picker" disabled/>
                </div>`,
  isSquare: `<div>
                  <input type="checkbox" id="rectangle-issquare" />
                  <label for="rectangle-issquare" title="Press Shift to toggle this checkbox">square</label>
              </div>`,
};

export class RectangleToolAttributes extends ToolAttributes {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  isFilled: boolean;
  fillStyle: string;
  strokeWidth: number;
  isSquare: boolean;

  private strokeStyleInput: HTMLInputElement;
  private isFilledInput: HTMLInputElement;
  private fillStyleInput: HTMLInputElement;
  private strokeWidthInput: HTMLInputElement;
  private isSquareInput: HTMLInputElement;

  /**
   * Holding on to references to the eventlisteners to remove them when the component is destroyed
   */
  private strokeStyleChangeListener: EventListener;
  private isFilledListener: EventListener;
  private fillStyleChangeListener: EventListener;
  private strokeWidthChangeListener: EventListener;
  private isSquareListener: EventListener;
  // private wheelEventListener: (this: Document, ev: WheelEvent) => any;
  private shiftKeyDownEventListener: (this: Document, ev: KeyboardEvent) => void;
  private shiftKeyUpEventListener: (this: Document, ev: KeyboardEvent) => void;

  constructor(defaultAttribs: DefaultToolAttributes<RectangleToolAttributes>) {
    super(RECTANGLE_TOOL_ATTRIBUTE_MARKUP);

    this.strokeStyle = defaultAttribs.strokeStyle;
    this.isFilled = defaultAttribs.isFilled;
    this.fillStyle = defaultAttribs.fillStyle;
    this.strokeWidth = defaultAttribs.strokeWidth;
    this.isSquare = defaultAttribs.isSquare;

    this.strokeStyleInput = document.getElementById(
      "rectangle-stroke-color-picker"
    ) as HTMLInputElement;
    this.isFilledInput = document.getElementById(
      "rectangle-isfilled"
    ) as HTMLInputElement;
    this.fillStyleInput = document.getElementById(
      "rectangle-fill-color-picker"
    ) as HTMLInputElement;
    this.strokeWidthInput = document.getElementById(
      "rectangle-stroke-width-input"
    ) as HTMLInputElement;
    this.isSquareInput = document.getElementById(
      "rectangle-issquare"
    ) as HTMLInputElement;

    this.strokeStyleChangeListener = this.setStrokeStyleInput.bind(this);
    this.isFilledListener = this.setIsFilled.bind(this);
    this.fillStyleChangeListener = this.setFillStyle.bind(this);
    this.strokeWidthChangeListener = this.setStrokeWidth.bind(this);
    this.isSquareListener = this.setIsSquare.bind(this);
    // this.wheelEventListener = this.onWheel.bind(this);
    this.shiftKeyUpEventListener = this.onShiftKeyUp.bind(this);
    this.shiftKeyDownEventListener = this.onShiftKeyDown.bind(this);

    this.events();
  }

  events() {
    this.strokeStyleInput.addEventListener("change", this.strokeStyleChangeListener);
    this.isFilledInput.addEventListener("change", this.isFilledListener);
    this.fillStyleInput.addEventListener("change", this.fillStyleChangeListener);
    this.strokeWidthInput.addEventListener("change", this.strokeWidthChangeListener);
    this.isSquareInput.addEventListener("change", this.isSquareListener);
    // document.addEventListener("wheel", this.wheelEventListener, {
    //   passive: false,
    // });
    document.addEventListener("keydown", this.shiftKeyDownEventListener);
    document.addEventListener("keyup", this.shiftKeyUpEventListener);
  }

  removeEvents() {
    this.strokeStyleInput.removeEventListener("change", this.strokeStyleChangeListener);
    this.isFilledInput.removeEventListener("change", this.isFilledListener);
    this.fillStyleInput.removeEventListener("change", this.fillStyleChangeListener);
    this.strokeWidthInput.removeEventListener("change", this.strokeWidthChangeListener);
    this.isSquareInput.removeEventListener("change", this.isSquareListener);
    document.removeEventListener("keydown", this.shiftKeyDownEventListener);
    document.removeEventListener("keyup", this.shiftKeyUpEventListener);
    super.destroy();
  }

  setStrokeStyleInput(e: Event) {
    this.strokeStyle = (e.target as HTMLInputElement).value;
  }

  setIsFilled(e: Event) {
    this.isFilled = (e.target as HTMLInputElement).checked;
    this.fillStyleInput.disabled = !this.isFilled;
  }

  setFillStyle(e: Event) {
    this.fillStyle = (e.target as HTMLInputElement).value;
  }

  setStrokeWidth(e: Event) {
    this.strokeWidth = parseInt((e.target as HTMLInputElement).value);
  }

  setIsSquare(e: Event) {
    this.isSquare = (e.target as HTMLInputElement).checked;
  }

  private toggleSetIsSquare() {
      this.isSquare = !this.isSquare;
      this.isSquareInput.checked = !this.isSquareInput.checked;
  }

  onShiftKeyUp(e: KeyboardEvent) {
    if (e.code === 'ShiftLeft') {
      this.toggleSetIsSquare();
    }
  }
  
  onShiftKeyDown(e: KeyboardEvent) {
    if (e.code === 'ShiftLeft') {
      this.toggleSetIsSquare();
    }
  }

  getAttributes(): DefaultToolAttributes<RectangleToolAttributes> {
    return {
      isSquare: this.isSquare,
      fillStyle: this.fillStyle,
      isFilled: this.isFilled,
      strokeStyle: this.strokeStyle,
      strokeWidth: this.strokeWidth,
    }
  }
}

export default class Rectangle extends BaseTools {
  ctx: CanvasRenderingContext2D;
  previewCtx: CanvasRenderingContext2D;
  toolAttrib: RectangleToolAttributes;
  readonly MAX_STROKE_WIDTH: number;

  private mouseDownEventListener: (this: Document, ev: MouseEvent) => any;
  private mouseUpEventListener: (this: Document, ev: MouseEvent) => any;
  private mouseMoveEventListener: (this: Document, ev: MouseEvent) => any;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(baseLayer, connection, state);
    this.ctx = baseLayer.ctx;
    this.previewCtx = baseLayer.previewCtx;
    this.MAX_STROKE_WIDTH = 100;
    this.toolAttrib = new RectangleToolAttributes(
      DEFAULT_RECTANGLE_TOOL_ATTRIBUTES
    );

    this.mouseDownEventListener = this.onMouseDown.bind(this);
    this.mouseUpEventListener = this.onMouseUp.bind(this);
    this.mouseMoveEventListener = this.onMouseMove.bind(this);

    this.events();
  }

  /**
   * Override basetoolevents
   */
  events() {
    super.events();
    document.addEventListener("mousedown", this.mouseDownEventListener);
    document.addEventListener("mouseup", this.mouseUpEventListener);
    document.addEventListener("mousemove", this.mouseMoveEventListener);
  }

  removeEvents() {
    document.removeEventListener("mousedown", this.mouseDownEventListener);
    document.removeEventListener("mouseup", this.mouseUpEventListener);
    document.removeEventListener("mousemove", this.mouseMoveEventListener);
  }

  onMouseMove(event: MouseEvent): void {
    super.onMouseMove(event);
    if (this.isDrag) {
      this.drawPreview();
    }
    this.sendMessageOverConnection(false);
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isValidMouseEvent(event)) {
      return;
    }
    super.onMouseDown(event);
    this.sendMessageOverConnection(false);
  }

  onMouseUp(event: MouseEvent): void {
    let draw: boolean = false;
    if (this.isDrag) {
      draw = true;
      this.draw();
      this.state.do({
        toolName: ToolName.RECTANGLE,
        commands: [{
          toolName: ToolName.RECTANGLE,
          toolAttributes: this.toolAttrib.getAttributes(),
          isDrag: false,
          x: this.mouseLastPosition[0],
          y: this.mouseLastPosition[1],
          clickX: this.mouseLastClickPosition[0],
          clickY: this.mouseLastClickPosition[1],
        }]
      })
    }
    super.onMouseUp(event);
    this.baseLayer.clearPreview();
    this.sendMessageOverConnection(draw);
  }

  draw() {
    this.drawRect(this.ctx);
  }

  drawPreview() {
    this.baseLayer.clearPreview();
    this.drawRect(this.previewCtx);
  }

  drawRect(ctx: CanvasRenderingContext2D,) {
    Rectangle.drawRect(ctx, this.mouseLastClickPosition, this.mouseLastPosition, this.toolAttrib);
  }

  /**
   * Static method for drawing a rectangle, using a single point and dimensions
   */
  static drawRect(
    ctx: CanvasRenderingContext2D,
    startPoint: [number, number],
    endPoint: [number, number],
    toolAttrib: DefaultToolAttributes<RectangleToolAttributes>
  ) {
    ctx.beginPath();
    let width = endPoint[0] - startPoint[0];
    let height = endPoint[1] - startPoint[1];

    if (toolAttrib.isSquare) {
      [width, height] = getSquareDimensions(width, height);
    }

    ctx.rect(startPoint[0], startPoint[1], width, height);
    if (toolAttrib.isFilled) {
      ctx.fillStyle = toolAttrib.fillStyle;
      ctx.fill();
    }
    ctx.strokeStyle = toolAttrib.strokeStyle;
    ctx.lineWidth = toolAttrib.strokeWidth;
    ctx.stroke();
  }

  sendMessageOverConnection(draw: boolean) {
    if (!this.connection?.isConnected()) {
      return;
    }
    const userCommand: UserCommand<RectangleToolAttributes> = {
      clickX: this.mouseLastClickPosition[0],
      clickY: this.mouseLastClickPosition[1],
      draw: draw,
      x: this.mouseLastPosition[0],
      y: this.mouseLastPosition[1],
      isDrag: this.isDrag,
      toolName: ToolName.RECTANGLE,
      toolAttributes: this.toolAttrib.getAttributes(),
    }
    this.connection.sendUserCommand(userCommand);
  }

  /**
   * override Basetool destroy method
   */
  destroy() {
    super.destroy();
    this.removeEvents();
    this.toolAttrib.removeEvents();
  }
}
