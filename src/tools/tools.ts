import BaseLayer from "../components/Layer";

export default abstract class Tools {
  baseLayer: BaseLayer;
  isDrag: boolean;
  isTouch: boolean;
  mouseLastClickPosition: [number, number];
  mouseLastPosition: [number, number];
  mouseAverageSpeed: number;
  readonly MAX_AVERAGE_MOUSE_SPEED = 100;

  constructor(baseLayer: BaseLayer) {
    this.baseLayer = baseLayer;
    this.isDrag = false;
    this.isTouch = false;
    this.mouseLastClickPosition = [0, 0];
    this.mouseLastPosition = [0, 0];
    this.mouseAverageSpeed = 0;
  }

  onMouseDown(event: MouseEvent) {
    this.isDrag = true;
    this.mouseAverageSpeed = 0;
    this.mouseLastPosition = this.getMouseCoordinates(event);
    this.mouseLastClickPosition = this.mouseLastPosition;
  }

  onMouseMove(event: MouseEvent) {
    const currentMousePosition = this.getMouseCoordinates(event);

    this.mouseAverageSpeed = this.getMouseAverageSpeed(currentMousePosition);
    this.mouseLastPosition = currentMousePosition;
  }

  onMouseUp() {
    this.isDrag = false;
  }

  isValidMouseEvent(event: MouseEvent): boolean {
    return (event.target as HTMLElement).id === 'canvas';
  }

  getMouseCoordinates(event: MouseEvent): [number, number] {
    const mouseX = event.clientX - this.baseLayer.canvas.offsetLeft;
    const mouseY = event.clientY - this.baseLayer.canvas.offsetTop;

    return [mouseX, mouseY]
  }

  getMouseAverageSpeed([mouseX, mouseY]: [number, number]): number {
    if (this.isDrag == false)
      return 0;

    const movementX = Math.abs(mouseX - this.mouseLastPosition[0]);
    const movementY = Math.abs(mouseY - this.mouseLastPosition[1]);

    const distance = movementX + movementY;
    console.log(distance);

    return Math.min(distance, this.MAX_AVERAGE_MOUSE_SPEED)
  }
}
