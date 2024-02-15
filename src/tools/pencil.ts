import BaseLayer from "../components/Layer";
import { clamp } from "../utils/utils";
import ToolAttributes, {
  DefaultToolAttributes,
  ToolAttributesMarkup,
} from "./toolAttributes";
import BaseTools from "./tools";

const DEFAULT_PENCIL_TOOL_ATTRIBUTES: DefaultToolAttributes<PencilToolAttributes> =
  {
    strokeStyle: "#000000",
    lineCap: "round",
    strokeWidth: 5,
    speedDependenceFactor: 0,
    mouseSpeedCoefficient: 1,
  };

const PENCIL_TOOL_ATTRIBUTE_MARKUP: ToolAttributesMarkup<PencilToolAttributes> =
  {
    mouseSpeedCoefficient: `<input type="range" value="10" min="1" max="10" step="1" aria-label="tool settings" >`,
    strokeStyle: `<input type="color" id="pencil-color-picker" />`,
    lineCap: `<select name="linecap" id="pencil-line-cap">
                <option value="butt">butt</option>
                <option value="round" selected>round</option>
                <option value="square">square</option>
              </select>`,
    strokeWidth: `<div>
                    <label for="pencil-stroke-width-input">Pencil stroke width</label>
                    <input type="range" id="pencil-stroke-width-input" name="pencil-stroke-width-input" min="1" max="50" step="1">
                  </div>`,
  };

class PencilToolAttributes extends ToolAttributes {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineCap: CanvasLineCap;
  strokeWidth: number;
  speedDependenceFactor: number;
  mouseSpeedCoefficient: number;

  constructor(
    defaultPencilToolAttributes: DefaultToolAttributes<PencilToolAttributes>
  ) {
    super(PENCIL_TOOL_ATTRIBUTE_MARKUP);
    this.strokeWidth = defaultPencilToolAttributes.strokeWidth;
    this.lineCap = defaultPencilToolAttributes.lineCap;
    this.strokeStyle = defaultPencilToolAttributes.strokeStyle;
    this.speedDependenceFactor =
      defaultPencilToolAttributes.speedDependenceFactor;
    this.mouseSpeedCoefficient =
      defaultPencilToolAttributes.mouseSpeedCoefficient;
    this.events();
  }

  events() {
    const strokeStyleInput = document.getElementById(
      "pencil-color-picker"
    ) as HTMLInputElement;
    strokeStyleInput.addEventListener(
      "change",
      this.setStrokeStyleInput.bind(this)
    );

    const linecapInput = document.getElementById(
      "pencil-line-cap"
    ) as HTMLInputElement;
    linecapInput.addEventListener("change", this.setLineCap.bind(this));

    const strokeWidthInput = document.getElementById(
      "pencil-stroke-width-input"
    ) as HTMLInputElement;
    strokeWidthInput.addEventListener("change", this.setStrokeWidth.bind(this));

    document.addEventListener(
      "wheel",
      (event: WheelEvent) => {
        if ((event.target as HTMLElement).id != "canvas") {
          return;
        }
        event.preventDefault();
        const delta = Math.floor(event.deltaY / 149);
        const currentVal = parseInt(strokeWidthInput.value);
        const newVal = clamp(currentVal - delta, 1, 50);
        strokeWidthInput.value = newVal.toString();
        this.strokeWidth = newVal;
      },
      {
        passive: false,
      }
    );
  }

  setStrokeStyleInput(e: Event) {
    this.strokeStyle = (e.target as HTMLInputElement).value;
  }

  setLineCap(e: Event) {
    this.lineCap = (e.target as HTMLInputElement).value as CanvasLineCap;
  }

  setStrokeWidth(e: Event) {
    this.strokeWidth = parseInt((e.target as HTMLInputElement).value);
    console.log("stroke width changed", this.strokeWidth);
  }
}

export default class Pencil extends BaseTools {
  ctx: CanvasRenderingContext2D;
  toolAttrib: PencilToolAttributes;
  readonly MAX_STROKE_WIDTH: number;

  constructor(baseLayer: BaseLayer) {
    super(baseLayer);
    this.events();
    this.ctx = baseLayer.ctx;
    this.MAX_STROKE_WIDTH = 100;
    this.toolAttrib = new PencilToolAttributes(DEFAULT_PENCIL_TOOL_ATTRIBUTES);
  }

  events() {
    document.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrag) {
      return;
    }
    super.onMouseMove(event);
    this.draw();
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isValidMouseEvent(event)) {
      return;
    }
    super.onMouseDown(event);
    this.ctx.beginPath();
  }

  onMouseUp(): void {
    super.onMouseUp();
  }

  getStrokeWidth(): number {
    if (this.toolAttrib.speedDependenceFactor === 0) {
      this.toolAttrib.strokeWidth *= this.toolAttrib.mouseSpeedCoefficient;
      this.toolAttrib.strokeWidth = Math.min(
        this.MAX_STROKE_WIDTH,
        this.toolAttrib.strokeWidth
      );
      console.log(this.toolAttrib.strokeWidth);
      return this.toolAttrib.strokeWidth;
    }

    const temp =
      this.toolAttrib.speedDependenceFactor > 0
        ? this.mouseAverageSpeed * this.toolAttrib.speedDependenceFactor
        : this.MAX_STROKE_WIDTH +
          this.mouseAverageSpeed * this.toolAttrib.speedDependenceFactor;

    this.toolAttrib.strokeWidth = Math.min(
      this.MAX_STROKE_WIDTH * this.toolAttrib.mouseSpeedCoefficient,
      temp
    );
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
}
