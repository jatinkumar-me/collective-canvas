import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection, UserCommand } from "../modules/network";
import { TextToolAttributes } from "./text";

import ToolAttributes, {
  DefaultToolAttributes, ToolAttributeInputParam,
} from "./toolAttributes";
import { ToolName } from "./toolManager";
import BaseTools from "./tools";


function getShapeToolAttributeMarkup(
  defaultAttrib: DefaultToolAttributes<ShapeToolAttributes>,
  equalLabel: string
): ToolAttributeInputParam<ShapeToolAttributes> {
  return {
    strokeStyle: {
      type: 'color',
      default: defaultAttrib.strokeStyle,
      label: 'Stroke Color',
    },
    strokeWidth: {
      type: 'range',
      label: 'Stroke Width',
      default: defaultAttrib.strokeWidth,
      min: 1,
      max: 50,
      step: 1,
    },
    isFilled: {
      type: 'checkbox',
      label: 'Fill',
      default: defaultAttrib.isFilled,
    },
    fillStyle: {
      type: 'color',
      label: 'Fill color',
      default: defaultAttrib.fillStyle,
    },
    isEqual: {
      type: 'checkbox',
      label: equalLabel,
      default: defaultAttrib.isEqual,
    },
  };
}

export abstract class ShapeToolAttributes extends ToolAttributes {
  strokeStyle: string;
  isFilled: boolean;
  fillStyle: string;
  strokeWidth: number;
  isEqual: boolean;

  private strokeStyleInput: HTMLInputElement;
  private isFilledInput: HTMLInputElement;
  private fillStyleInput: HTMLInputElement;
  private strokeWidthInput: HTMLInputElement;
  private isEqualInput: HTMLInputElement;

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

  constructor(
    defaultAttribs: DefaultToolAttributes<ShapeToolAttributes>,
    equalLabel: string,
    additionalAttrib?: ToolAttributeInputParam<any>
  ) {
    const baseShapeMarkup = getShapeToolAttributeMarkup(defaultAttribs, equalLabel);
    const toolInfo = `Press and hold <kbd>Shift</kbd> for toggling ${equalLabel}`;
    super(defaultAttribs, { ...baseShapeMarkup, ...additionalAttrib }, toolInfo);

    this.strokeStyle = defaultAttribs.strokeStyle;
    this.isFilled = defaultAttribs.isFilled;
    this.fillStyle = defaultAttribs.fillStyle;
    this.strokeWidth = defaultAttribs.strokeWidth;
    this.isEqual = defaultAttribs.isEqual;

    this.strokeStyleInput = document.getElementById(
      "strokeStyle"
    ) as HTMLInputElement;
    this.isFilledInput = document.getElementById(
      `isFilled`
    ) as HTMLInputElement;
    this.fillStyleInput = document.getElementById(
      `fillStyle`
    ) as HTMLInputElement;
    this.strokeWidthInput = document.getElementById(
      `strokeWidth`
    ) as HTMLInputElement;
    this.isEqualInput = document.getElementById(
      `isEqual`
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
    this.isEqualInput.addEventListener("change", this.isSquareListener);
    document.addEventListener("keydown", this.shiftKeyDownEventListener);
    document.addEventListener("keyup", this.shiftKeyUpEventListener);
  }

  removeEvents() {
    this.strokeStyleInput.removeEventListener("change", this.strokeStyleChangeListener);
    this.isFilledInput.removeEventListener("change", this.isFilledListener);
    this.fillStyleInput.removeEventListener("change", this.fillStyleChangeListener);
    this.strokeWidthInput.removeEventListener("change", this.strokeWidthChangeListener);
    this.isEqualInput.removeEventListener("change", this.isSquareListener);
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
    this.isEqualInput.checked = !this.isEqualInput.checked;
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

  abstract init(): void;

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

    if (this.toolName === 'text' && this.isValidMouseEvent(event)) {
      (this.toolAttrib as TextToolAttributes).focusTextArea();
    }
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
