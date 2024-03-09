import State, { Action } from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import { getColorAtPixel, getOffset, hexStringToUintClampedArray, isInValidPixel, setPixel } from "../utils/utils";
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

  private curAction: Action<FillToolAttributes>;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(baseLayer, connection, state);
    this.ctx = baseLayer.ctx;
    this.toolAttrib = new FillToolAttributes(DEFAULT_FILL_TOOL_ATTRIBUTES);

    this.mouseDownEventListener = this.mouseDown.bind(this);
    this.mouseUpEventListener = this.mouseUp.bind(this);
    this.mouseMoveEventListener = this.mouseMove.bind(this);

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
    const da = c1[3] - c2[3];
    return dr * dr + dg * dg + db * db + da * da < tolerance;
  }

  /**
  * Checks whether should two colors are exactly the same or not.
  */
  isExactColorMatch(
    c1: Uint8ClampedArray,
    c2: Uint8ClampedArray,
  ): boolean {
    return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
  }

  /**
  * Draw implement basic flood-fill algorithm based on iterative DFS.
  */
  draw() {
    const x = this.mouseLastClickPosition[0];
    const y = this.mouseLastClickPosition[1];

    const color = hexStringToUintClampedArray(this.toolAttrib.fillColor);

    const imageData = this.ctx.getImageData(0, 0, this.baseLayer.canvas.width, this.baseLayer.canvas.height);

    const visited = new Array<boolean>(imageData.width * imageData.height);

    const targetColor = getColorAtPixel(imageData, x, y);

    if (this.isExactColorMatch(color, targetColor)) {
      console.log('same color')
      return;
    }

    const TOLERANCE = 1000;

    const pixelsToCheck: [number, number][] = [];

    pixelsToCheck.push([x, y]);

    while (pixelsToCheck.length > 0) {
      const [curX, curY] = pixelsToCheck.pop()!;
      if (isInValidPixel(curX, curY, imageData.width, imageData.height)) {
        continue;
      }

      const currentColor = getColorAtPixel(imageData, curX, curY);

      if (
        !visited[curY * imageData.width + curX] &&
        this.isColorMatch(currentColor, targetColor, TOLERANCE)
      ) {
        setPixel(imageData, curX, curY, color);
        visited[curY * imageData.width + curX] = true;  // mark we were here already
        pixelsToCheck.push([curX + 1, curY]);
        pixelsToCheck.push([curX - 1, curY]);
        pixelsToCheck.push([curX, curY + 1]);
        pixelsToCheck.push([curX, curY - 1]);
        pixelsToCheck.push([curX + 1, curY + 1]);
        pixelsToCheck.push([curX - 1, curY - 1]);
        pixelsToCheck.push([curX - 1, curY + 1]);
        pixelsToCheck.push([curX + 1, curY - 1]);
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
