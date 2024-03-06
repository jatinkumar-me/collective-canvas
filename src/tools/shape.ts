import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection, UserCommand } from "../modules/network";

import ToolAttributes, {
  DefaultToolAttributes,
  ToolAttributesMarkup,
} from "./toolAttributes";
import { ToolName } from "./toolManager";
import BaseTools from "./tools";


function getShapeToolAttributeMarkup(shapeName: string): ToolAttributesMarkup<ShapeToolAttributes> {
  return {
    strokeStyle: `<div><label for="${shapeName}-stroke-color-picker">Stroke color</label>
                  <input type="color" id="${shapeName}-stroke-color-picker" />
                  </div>`,
    strokeWidth: `<div>
                    <label for="${shapeName}-stroke-width-input">Stroke width</label>
                    <input type="range" id="${shapeName}-stroke-width-input" name="${shapeName}-stroke-width-input" min="1" max="50" step="1" value="1">
               </div>`,
    isFilled: `<div>
                  <input type="checkbox" id="${shapeName}-isfilled" />
                  <label for="${shapeName}-isfilled">fill</label>
              </div>`,
    fillStyle: `<div><label for="${shapeName}-fill-color-picker">Fill color</label>
                  <input type="color" id="${shapeName}-fill-color-picker"/>
                </div>`,
    isEqual: `<div>
                  <input type="checkbox" id="${shapeName}-isequal" />
                  <label for="${shapeName}-isequal" title="Press Shift to toggle this checkbox">fix aspect ratio </label>
              </div>`,
  };
}

export abstract class ShapeToolAttributes extends ToolAttributes {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  isFilled: boolean;
  fillStyle: string;
  strokeWidth: number;
  isEqual: boolean;

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

  constructor(shapeName: string, defaultAttribs: DefaultToolAttributes<ShapeToolAttributes>) {
    super(getShapeToolAttributeMarkup(shapeName));

    this.strokeStyle = defaultAttribs.strokeStyle;
    this.isFilled = defaultAttribs.isFilled;
    this.fillStyle = defaultAttribs.fillStyle;
    this.strokeWidth = defaultAttribs.strokeWidth;
    this.isEqual = defaultAttribs.isEqual;

    this.strokeStyleInput = document.getElementById(
      `${shapeName}-stroke-color-picker`
    ) as HTMLInputElement;
    this.isFilledInput = document.getElementById(
      `${shapeName}-isfilled`
    ) as HTMLInputElement;
    this.fillStyleInput = document.getElementById(
      `${shapeName}-fill-color-picker`
    ) as HTMLInputElement;
    this.strokeWidthInput = document.getElementById(
      `${shapeName}-stroke-width-input`
    ) as HTMLInputElement;
    this.isSquareInput = document.getElementById(
      `${shapeName}-isequal`
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
  }

  setFillStyle(e: Event) {
    this.fillStyle = (e.target as HTMLInputElement).value;
    this.isFilled = true;
    this.isFilledInput.checked = true;
  }

  setStrokeWidth(e: Event) {
    this.strokeWidth = parseInt((e.target as HTMLInputElement).value);
  }

  setIsSquare(e: Event) {
    this.isEqual = (e.target as HTMLInputElement).checked;
  }

  private toggleSetIsSquare() {
    this.isEqual = !this.isEqual;
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

  getAttributes(): DefaultToolAttributes<ShapeToolAttributes> {
    return {
      isEqual: this.isEqual,
      fillStyle: this.fillStyle,
      isFilled: this.isFilled,
      strokeStyle: this.strokeStyle,
      strokeWidth: this.strokeWidth,
    }
  }
}

/**
 * @class Shape - is an abstract class that has it's own eventlisteners
 * TODO:
 * - Add a functionality to cancel the draw. this can be done using a flag, I will see if I can make it work using the exising `shouldDraw` flag.
 * - Make it more extensible, so that tools can add additional functionality to it.
 */
export default abstract class Shape extends BaseTools {
  toolName: ToolName;
  toolAttrib: ShapeToolAttributes;

  mouseDownEventListener: (this: Document, ev: MouseEvent) => any;
  mouseUpEventListener: (this: Document, ev: MouseEvent) => any;
  mouseMoveEventListener: (this: Document, ev: MouseEvent) => any;

  /**
   * `shouldDraw` is a boolean value used as a flag, to be sent along with the command,
   * it tells the command receiver whether to draw the received command or not.
   * This is necessary because we are sending command on each mouse move to keep all the
   * users in sync.
   */
  shouldDraw: boolean;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State, toolName: ToolName, toolAttrib: ShapeToolAttributes) {
    super(baseLayer, connection, state);
    this.toolName = toolName;
    this.toolAttrib = toolAttrib;

    this.mouseDownEventListener = this.mouseDown.bind(this);
    this.mouseUpEventListener = this.mouseUp.bind(this);
    this.mouseMoveEventListener = this.mouseMove.bind(this);
    this.shouldDraw = false;

    this.events();
  }

  mouseMove(event: MouseEvent): void {
    this.shouldDraw = false;
    super.onMouseMove(event);
    if (this.isDrag) {
      this.drawPreview();
    }
  }

  mouseDown(event: MouseEvent): void {
    this.shouldDraw = false;
    if (!this.isValidMouseEvent(event)) {
      return;
    }
    super.onMouseDown(event);
  }

  mouseUp(event: MouseEvent): void {
    this.shouldDraw = false;
    if (this.isDrag) {
      this.shouldDraw = true;
      this.draw();
      this.recordCommand();
    }
    super.onMouseUp(event);
    this.baseLayer.clearPreview();
  }

  draw() {
    this.drawShape(this.baseLayer.ctx);
  }

  drawPreview() {
    this.baseLayer.clearPreview();
    this.drawShape(this.baseLayer.previewCtx);
  }

  abstract drawShape(ctx: CanvasRenderingContext2D): void;

  sendMessageOverConnection() {
    if (!this.connection?.isConnected()) {
      return;
    }
    const userCommand: UserCommand<ShapeToolAttributes> = {
      clickX: this.mouseLastClickPosition[0],
      clickY: this.mouseLastClickPosition[1],
      draw: this.shouldDraw,
      x: this.mouseLastPosition[0],
      y: this.mouseLastPosition[1],
      isDrag: this.isDrag,
      toolName: this.toolName,
      toolAttributes: this.toolAttrib.getAttributes(),
    }
    this.connection.sendUserCommand(userCommand);
  }

  recordCommand() {
    this.state.do({
      toolName: this.toolName,
      commands: [{
        toolName: this.toolName,
        toolAttributes: this.toolAttrib.getAttributes(),
        isDrag: false,
        x: this.mouseLastPosition[0],
        y: this.mouseLastPosition[1],
        clickX: this.mouseLastClickPosition[0],
        clickY: this.mouseLastClickPosition[1],
      }]
    })
  }
}
