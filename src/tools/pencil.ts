import BaseLayer from "../components/Layer";
import Tools from "./tools";

export default class Pencil extends Tools {
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
    this.mouseSpeedCoefficient = 2
  }

  events() {
    document.addEventListener('mousedown', this.onMouseDown.bind(this))
    document.addEventListener('mouseup', this.onMouseUp.bind(this))
    document.addEventListener('mousemove', this.onMouseMove.bind(this))
    document.addEventListener('wheel', this.onWheel.bind(this), {
      passive: false
    })
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
    if ((event.target as HTMLElement).id === 'canvas') {
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

    const temp = (this.speedDependenceFactor > 0 ?
      this.mouseAverageSpeed * this.speedDependenceFactor :
      this.MAX_STROKE_WIDTH + this.mouseAverageSpeed * this.speedDependenceFactor);

    this.strokeWidth = Math.min(this.MAX_STROKE_WIDTH * this.mouseSpeedCoefficient, temp);
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

  // draw_v2() {
  //   var dist_x = from_x - to_x;
  //   var dist_y = from_y - to_y;
  //   var distance = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y));
  //   var radiance = Math.atan2(dist_y, dist_x);
  //
  //   for (var j = 0; j < distance; j++) {
  //     var x_tmp = Math.round(to_x + Math.cos(radiance) * j) - Math.floor(size / 2) - 1;
  //     var y_tmp = Math.round(to_y + Math.sin(radiance) * j) - Math.floor(size / 2) - 1;
  //
  //     ctx.fillRect(x_tmp, y_tmp, size, size);
  //   }
  // }
}
