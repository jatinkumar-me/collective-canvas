import State, { Action } from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import { PixelData } from "../utils/utilTypes";
import { getColorAtPixel, hexStringToUintClampedArray as hexStringToUint32, isInValidPixel, setPixel } from "../utils/utils";
import ToolAttributes, {
  DefaultToolAttributes,
  ToolAttributesMarkup,
} from "./toolAttributes";
import { ToolName } from "./toolManager";
import BaseTools from "./tools";

const DEFAULT_FILL_TOOL_ATTRIBUTES: DefaultToolAttributes<FillToolAttributes> =
{
  fillColor: "#000000",
};

const FILL_TOOL_ATTRIBUTE_MARKUP: ToolAttributesMarkup<FillToolAttributes> =
{
  fillColor: `<div><label for="fill-color-picker">Fill color </label><input type="color" id="fill-color-picker" /></div>`,
};


class FillToolAttributes extends ToolAttributes {
  fillColor: string;

  private fillColorInput: HTMLInputElement;
  private fillColorChangeListener: EventListener;

  constructor(
    defaultFillToolAttributes: DefaultToolAttributes<FillToolAttributes>
  ) {
    super(FILL_TOOL_ATTRIBUTE_MARKUP);
    this.fillColor = defaultFillToolAttributes.fillColor;
    this.fillColorInput = document.getElementById(
      "fill-color-picker"
    ) as HTMLInputElement;
    this.fillColorChangeListener = this.setFillColorInput.bind(this);
    this.events();
  }

  getAttributes(): DefaultToolAttributes<FillToolAttributes> {
    return {
      fillColor: this.fillColor,
    };
  }

  events() {
    this.fillColorInput.addEventListener("change", this.fillColorChangeListener);
  }

  removeEvents() {
    this.fillColorInput.removeEventListener("change", this.fillColorChangeListener);
  }

  setFillColorInput(e: Event) {
    this.fillColor = (e.target as HTMLInputElement).value;
  }
}


export default class Fill extends BaseTools {
  ctx: CanvasRenderingContext2D;
  toolAttrib: FillToolAttributes;

  mouseDownEventListener: (this: Document, ev: MouseEvent) => any;
  mouseUpEventListener: (this: Document, ev: MouseEvent) => any;
  mouseMoveEventListener: (this: Document, ev: MouseEvent) => any;
  maxTol: number;

  private curAction: Action<FillToolAttributes>;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(baseLayer, connection, state);
    this.ctx = baseLayer.ctx;
    this.toolAttrib = new FillToolAttributes(DEFAULT_FILL_TOOL_ATTRIBUTES);

    this.mouseDownEventListener = this.mouseDown.bind(this);
    this.mouseUpEventListener = this.mouseUp.bind(this);
    this.mouseMoveEventListener = this.mouseMove.bind(this);
    this.maxTol = 0;

    this.events();
    this.curAction = {
      toolName: ToolName.FILL,
      commands: [],
    };
  }

  mouseMove(event: MouseEvent): void {
    super.onMouseMove(event);
    if (!this.isDrag) {
      return;
    }
  }

  mouseDown(event: MouseEvent): void {
    if (!this.isValidMouseEvent(event)) {
      return;
    }
    super.onMouseDown(event);
    this.draw();
    this.recordCommand();
    this.curAction = {
      toolName: ToolName.FILL,
      commands: [],
    };
  }

  mouseUp(event: MouseEvent): void {
    super.onMouseUp(event);
  }

  /**
  * Checks whether should two colors are same or not.
  */
  isColorMatch(
    c1: Uint8ClampedArray,
    c2: Uint8ClampedArray,
    tolerance: number,
  ): boolean {
    const dr = c1[0] - c2[0];
    const dg = c1[1] - c2[1];
    const db = c1[2] - c2[2];

    const delta = (dr * dr) + (dg * dg) + (db * db);
    return delta < tolerance;
  }

  /**
  * Checks whether should two colors are exactly the same or not.
  * both c1 and c2 are Uint32.
  */
  isExactColorMatch(
    c1: number,
    c2: number,
  ): boolean {
    return c1 === c2;
  }

  /**
  * Draw implement basic flood-fill algorithm based on iterative DFS.
  */
  draw() {
    const x = this.mouseLastClickPosition[0];
    const y = this.mouseLastClickPosition[1];

    const color = hexStringToUint32(this.toolAttrib.fillColor);

    const imageData = this.ctx.getImageData(0, 0, this.baseLayer.canvas.width, this.baseLayer.canvas.height);
    const { height, width, data } = imageData;

    // We will represent a color value by a 32 bit unsinged integer.
    // 32 bit integer includes 4 bytes each representing R, G, B and Alpha respectively.
    const pixelData: PixelData = {
      height: height,
      width: width,
      data: new Uint32Array(data.buffer),
    }

    const targetColor = getColorAtPixel(pixelData, x, y);

    if (color === targetColor) {
      console.log('same color')
      return;
    }

    const pixelsToCheck: number[] = [];
    pixelsToCheck.push(x, y);

    while (pixelsToCheck.length > 0) {
      const curY = pixelsToCheck.pop();
      const curX = pixelsToCheck.pop();

      if (!curX || !curY || isInValidPixel(curX, curY, imageData.width, imageData.height)) {
        continue;
      }

      const currentColor = getColorAtPixel(pixelData, curX, curY);

      if (
        currentColor === targetColor
      ) {
        setPixel(pixelData, curX, curY, color);

        pixelsToCheck.push(curX + 1, curY);
        pixelsToCheck.push(curX - 1, curY);
        pixelsToCheck.push(curX, curY + 1);
        pixelsToCheck.push(curX, curY - 1);
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  sendMessageOverConnection() {
    if (!this.connection?.isConnected()) {
      return;
    }
    // this.connection.sendUserCommand();
  }

  recordCommand() {
    this.state.do(this.curAction);
  }
}
