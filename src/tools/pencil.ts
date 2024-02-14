import BaseLayer from "../components/Layer";
import ToolAttributes, { DefaultToolAttributes } from "./toolAttributes";
import BaseTools from "./tools";

const DEFAULT_PENCIL_TOOL_ATTRIBUTES: DefaultToolAttributes<PencilToolAttributes> =
  {
    strokeStyle: "#000000",
    lineCap: "butt",
    strokeWidth: 5,
    speedDependenceFactor: 0,
    mouseSpeedCoefficient: 4,
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
    super();
    this.strokeWidth = defaultPencilToolAttributes.strokeWidth;
    this.lineCap = defaultPencilToolAttributes.lineCap;
    this.strokeStyle = defaultPencilToolAttributes.strokeStyle;
    this.speedDependenceFactor =
      defaultPencilToolAttributes.speedDependenceFactor;
    this.mouseSpeedCoefficient =
      defaultPencilToolAttributes.mouseSpeedCoefficient;
  }
}

export default class Pencil extends BaseTools {
  ctx: CanvasRenderingContext2D;
  pencilToolAttributes: PencilToolAttributes;
  readonly MAX_STROKE_WIDTH: number;

  constructor(baseLayer: BaseLayer) {
    super(baseLayer);
    this.events();
    this.ctx = baseLayer.ctx;
    this.MAX_STROKE_WIDTH = 5;
    this.pencilToolAttributes = new PencilToolAttributes(
      DEFAULT_PENCIL_TOOL_ATTRIBUTES
    );
  }

  events() {
    document.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("wheel", this.onWheel.bind(this), {
      passive: false,
    });
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

  onWheel(event: WheelEvent): void {
    if ((event.target as HTMLElement).id === "canvas") {
      event.preventDefault();
    }
    this.pencilToolAttributes.mouseSpeedCoefficient += event.deltaY * 0.01;
  }

  getStrokeWidth(): number {
    if (this.pencilToolAttributes.speedDependenceFactor === 0) {
      this.pencilToolAttributes.strokeWidth *=
        this.pencilToolAttributes.mouseSpeedCoefficient;
      this.pencilToolAttributes.strokeWidth = Math.min(
        this.MAX_STROKE_WIDTH,
        this.pencilToolAttributes.strokeWidth
      );
      return this.pencilToolAttributes.strokeWidth;
    }

    const temp =
      this.pencilToolAttributes.speedDependenceFactor > 0
        ? this.mouseAverageSpeed *
          this.pencilToolAttributes.speedDependenceFactor
        : this.MAX_STROKE_WIDTH +
          this.mouseAverageSpeed *
            this.pencilToolAttributes.speedDependenceFactor;

    this.pencilToolAttributes.strokeWidth = Math.min(
      this.MAX_STROKE_WIDTH * this.pencilToolAttributes.mouseSpeedCoefficient,
      temp
    );
    return this.pencilToolAttributes.strokeWidth;
  }

  draw() {
    this.ctx.lineWidth = this.getStrokeWidth();
    this.ctx.lineCap = this.pencilToolAttributes.lineCap;
    this.ctx.strokeStyle = this.pencilToolAttributes.strokeStyle;

    this.ctx.lineTo(this.mouseLastPosition[0], this.mouseLastPosition[1]);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouseLastPosition[0], this.mouseLastPosition[1]);
  }
}
