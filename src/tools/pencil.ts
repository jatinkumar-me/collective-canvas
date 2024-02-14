import BaseLayer from "../components/Layer";
import BaseTools from "./tools";

export default class Pencil extends BaseTools {
  ctx: CanvasRenderingContext2D;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  lineCap: CanvasLineCap;
  strokeWidth: number;
  speedDependenceFactor: number;
  readonly MAX_STROKE_WIDTH = 5;
  mouseSpeedCoefficient: number;

  constructor(baseLayer: BaseLayer) {
    super(baseLayer);
    this.strokeStyle = "#000000";
    this.strokeWidth = 2;
    this.lineCap = "square";
    this.speedDependenceFactor = 0;
    this.events();
    this.ctx = baseLayer.ctx;
    this.mouseSpeedCoefficient = 2;
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
    this.mouseSpeedCoefficient += event.deltaY * 0.01;
  }

  getStrokeWidth(): number {
    if (this.speedDependenceFactor === 0) {
      this.strokeWidth *= this.mouseSpeedCoefficient;
      this.strokeWidth = Math.min(this.MAX_STROKE_WIDTH, this.strokeWidth);
      return this.strokeWidth;
    }

    const temp =
      this.speedDependenceFactor > 0
        ? this.mouseAverageSpeed * this.speedDependenceFactor
        : this.MAX_STROKE_WIDTH +
          this.mouseAverageSpeed * this.speedDependenceFactor;

    this.strokeWidth = Math.min(
      this.MAX_STROKE_WIDTH * this.mouseSpeedCoefficient,
      temp
    );
    return this.strokeWidth;
  }

  draw() {
    this.ctx.lineWidth = this.getStrokeWidth();
    this.ctx.lineCap = this.lineCap;
    this.ctx.strokeStyle = this.strokeStyle;

    this.ctx.lineTo(this.mouseLastPosition[0], this.mouseLastPosition[1]);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouseLastPosition[0], this.mouseLastPosition[1]);
  }
}
