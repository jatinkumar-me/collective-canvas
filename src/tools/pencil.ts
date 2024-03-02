import State, { Action } from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection, UserCommand } from "../modules/network";
import { clamp } from "../utils/utils";
import ToolAttributes, {
  DefaultToolAttributes,
  ToolAttributesMarkup,
} from "./toolAttributes";
import { ToolName } from "./toolManager";
import BaseTools from "./tools";

const DEFAULT_PENCIL_TOOL_ATTRIBUTES: DefaultToolAttributes<PencilToolAttributes> =
  {
    strokeStyle: "#000000",
    lineCap: "round",
    strokeWidth: 5,
    speedDependenceFactor: 0,
  };

const PENCIL_TOOL_ATTRIBUTE_MARKUP: ToolAttributesMarkup<PencilToolAttributes> =
  {
    strokeStyle: `<input type="color" id="pencil-color-picker" />`,
    lineCap: `<select name="linecap" id="pencil-line-cap">
                <option value="butt">butt</option>
                <option value="round" selected>round</option>
                <option value="square">square</option>
              </select>`,
    strokeWidth: `<div>
                    <label for="pencil-stroke-width-input">Pencil stroke width</label>
                    <input type="range" id="pencil-stroke-width-input" name="pencil-stroke-width-input" min="1" max="50" step="1" value="${DEFAULT_PENCIL_TOOL_ATTRIBUTES.strokeWidth}">
               </div>`,
  };


class PencilToolAttributes extends ToolAttributes {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineCap: CanvasLineCap;
  strokeWidth: number;
  speedDependenceFactor: number;

  private strokeStyleInput: HTMLInputElement;
  private strokeWidthInput: HTMLInputElement;
  private linecapInput: HTMLInputElement;

  private canvasContainer: HTMLDivElement;

  /**
   * Holding on to references to the eventlisteners to remove them when the component is destroyed
   */
  private strokeStyleChangeListener: EventListener;
  private lineCapChangeListener: EventListener;
  private strokeWidthChangeListener: EventListener;
  private wheelEventListener: (this: HTMLDivElement, ev: WheelEvent) => any;


  constructor(
    defaultPencilToolAttributes: DefaultToolAttributes<PencilToolAttributes>
  ) {
    super(PENCIL_TOOL_ATTRIBUTE_MARKUP);
    this.strokeWidth = defaultPencilToolAttributes.strokeWidth;
    this.lineCap = defaultPencilToolAttributes.lineCap;
    this.strokeStyle = defaultPencilToolAttributes.strokeStyle;
    this.speedDependenceFactor =
      defaultPencilToolAttributes.speedDependenceFactor;

    this.strokeStyleInput = document.getElementById(
      "pencil-color-picker"
    ) as HTMLInputElement;

    this.linecapInput = document.getElementById(
      "pencil-line-cap"
    ) as HTMLInputElement;

    this.strokeWidthInput = document.getElementById(
      "pencil-stroke-width-input"
    ) as HTMLInputElement;

    this.canvasContainer = document.getElementById('canvas-container') as HTMLDivElement;

    this.strokeStyleChangeListener = this.setStrokeStyleInput.bind(this);
    this.lineCapChangeListener = this.setLineCap.bind(this);
    this.strokeWidthChangeListener = this.setStrokeWidth.bind(this);
    this.wheelEventListener = this.onWheel.bind(this);

    this.events();
  }

  getAttributes(): DefaultToolAttributes<PencilToolAttributes> {
    return {
      strokeWidth: this.strokeWidth,
      lineCap: this.lineCap,
      strokeStyle: this.strokeStyle,
      speedDependenceFactor: this.speedDependenceFactor,
    };
  }

  events() {
    this.strokeStyleInput.addEventListener(
      "change",
      this.strokeStyleChangeListener
    );
    this.linecapInput.addEventListener("change", this.lineCapChangeListener);
    this.strokeWidthInput.addEventListener(
      "change",
      this.strokeWidthChangeListener
    );
    this.canvasContainer.addEventListener("wheel", this.wheelEventListener, {
      passive: false,
    });
  }

  removeEvents() {
    this.strokeStyleInput.removeEventListener(
      "change",
      this.strokeStyleChangeListener
    );
    this.linecapInput.removeEventListener("change", this.lineCapChangeListener);
    this.strokeWidthInput.removeEventListener(
      "change",
      this.strokeWidthChangeListener
    );
    this.canvasContainer.removeEventListener("wheel", this.wheelEventListener);
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = Math.round(event.deltaY / 149);
    const currentVal = parseInt(this.strokeWidthInput.value);
    const newVal = clamp(currentVal - delta, 1, 50);
    this.strokeWidthInput.value = newVal.toString();
    this.strokeWidth = newVal;
  }

  setStrokeStyleInput(e: Event) {
    this.strokeStyle = (e.target as HTMLInputElement).value;
  }

  setLineCap(e: Event) {
    this.lineCap = (e.target as HTMLInputElement).value as CanvasLineCap;
  }

  setStrokeWidth(e: Event) {
    this.strokeWidth = parseInt((e.target as HTMLInputElement).value);
  }
}


export default class Pencil extends BaseTools {
  ctx: CanvasRenderingContext2D;
  toolAttrib: PencilToolAttributes;
  readonly MAX_STROKE_WIDTH: number;

  private mouseDownEventListener: (this: Document, ev: MouseEvent) => any;
  private mouseUpEventListener: (this: Document, ev: MouseEvent) => any;
  private mouseMoveEventListener: (this: Document, ev: MouseEvent) => any;

  /**
   * Storing the current action, it will be sent to the state
   */
  private curAction: Action<PencilToolAttributes>;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(baseLayer, connection, state);
    this.ctx = baseLayer.ctx;
    this.MAX_STROKE_WIDTH = 100;
    this.toolAttrib = new PencilToolAttributes(DEFAULT_PENCIL_TOOL_ATTRIBUTES);

    this.mouseDownEventListener = this.onMouseDown.bind(this);
    this.mouseUpEventListener = this.onMouseUp.bind(this);
    this.mouseMoveEventListener = this.onMouseMove.bind(this);

    this.events();
    this.curAction = {
      toolName: ToolName.PENCIL,
      commands: [],
    };
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
    this.sendMessageOverConnection();
    super.onMouseMove(event);
    if (!this.isDrag) {
      return;
    }
    this.draw();
    this.recordCommand();
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isValidMouseEvent(event)) {
      return;
    }
    super.onMouseDown(event);
    this.ctx.beginPath();
    this.curAction = {
      toolName: ToolName.PENCIL,
      commands: [],
    };
  }

  onMouseUp(event: MouseEvent): void {
    super.onMouseUp(event);
    this.sendMessageOverConnection();
    this.state.do(this.curAction);
  }

  getStrokeWidth(): number {
    if (this.toolAttrib.speedDependenceFactor === 0) {
      this.toolAttrib.strokeWidth = Math.min(
        this.MAX_STROKE_WIDTH,
        this.toolAttrib.strokeWidth
      );
      return this.toolAttrib.strokeWidth;
    }

    const temp =
      this.toolAttrib.speedDependenceFactor > 0
        ? this.mouseAverageSpeed * this.toolAttrib.speedDependenceFactor
        : this.MAX_STROKE_WIDTH +
          this.mouseAverageSpeed * this.toolAttrib.speedDependenceFactor;

    this.toolAttrib.strokeWidth = Math.min(this.MAX_STROKE_WIDTH, temp);
    return this.toolAttrib.strokeWidth;
  }

  draw() {
    this.ctx.lineWidth = this.getStrokeWidth();
    this.ctx.lineCap = this.toolAttrib.lineCap;
    this.ctx.strokeStyle = this.toolAttrib.strokeStyle;

    this.ctx.lineTo(this.mouseLastPosition[0], this.mouseLastPosition[1]);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouseLastPosition[0], this.mouseLastPosition[1]);
  }

  /**
   * Static method for drawing a small line segment, using two points
   */
  static drawSegment(
    ctx: CanvasRenderingContext2D,
    toolAttrib: DefaultToolAttributes<PencilToolAttributes>,
    newMouseCoord: [number, number],
    oldMouseCoord: [number, number]
  ) {
    ctx.lineWidth = toolAttrib.strokeWidth;
    ctx.lineCap = toolAttrib.lineCap;
    ctx.strokeStyle = toolAttrib.strokeStyle;

    ctx.beginPath();
    ctx.moveTo(oldMouseCoord[0], oldMouseCoord[1]);
    ctx.lineTo(newMouseCoord[0], newMouseCoord[1]);
    ctx.stroke();
  }

  /**
   * Static method for drawing whole path, given an array of line commands
   * @param ctx CanvasRenderingContext2D for rending the path
   * @param commands an array of user commands to be drawn at once.
   */
  static drawPath(
    ctx: CanvasRenderingContext2D,
    commands: UserCommand<PencilToolAttributes>[]
  ) {
    if (commands.length < 2) {
      console.warn("Path require atmost two commands");
      return;
    }

    for (let i = 1; i < commands.length; i++) {
      const curCommand = commands[i];
      const prevCommand = commands[i - 1];
      Pencil.drawSegment(
        ctx,
        curCommand.toolAttributes,
        [curCommand.x, curCommand.y],
        [prevCommand.x, prevCommand.y]
      );
    }
  }

  getCommand(): UserCommand<PencilToolAttributes> {
    return {
      x: this.mouseLastPosition[0],
      y: this.mouseLastPosition[1],
      isDrag: this.isDrag,
      toolName: ToolName.PENCIL,
      toolAttributes: this.toolAttrib.getAttributes(),
    }
  }

  sendMessageOverConnection() {
    if (!this.connection?.isConnected()) {
      return;
    }
    this.connection.sendUserCommand(this.getCommand());
  }

  recordCommand() {
    this.curAction.commands.push(this.getCommand())
  }

  /**
   * override Basetool destroy method
   */
  destroy() {
    super.destroy();
    this.toolAttrib.destroy();
    this.removeEvents();
    this.toolAttrib.removeEvents();
  }
}
