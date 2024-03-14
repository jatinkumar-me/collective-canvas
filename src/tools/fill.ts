import State, { Action } from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import { PixelData } from "../utils/utilTypes";
import { getColorAtPixel, hexStringToUintClampedArray as hexStringToUint32, isInValidPixel, setPixel } from "../utils/utils";
import ToolAttributes, {
  DefaultToolAttributes, ToolAttributeInputParam,
} from "./toolAttributes";
import { ToolName } from "./toolManager";
import BaseTools from "./tools";

const DEFAULT_FILL_TOOL_ATTRIBUTES: DefaultToolAttributes<FillToolAttributes> =
{
  fillColor: "#000000",
};

const FILL_TOOL_ATTRIBUTE_MARKUP: ToolAttributeInputParam<FillToolAttributes> =
{
  fillColor: {
      type: 'color',
      label: 'Fill color',
      default: DEFAULT_FILL_TOOL_ATTRIBUTES.fillColor,
      tooltip: 'Current flood fill algorithm is under beta'
    },
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


/**
 * Fill tool implement flood-fill algorithm
 * TODO:
 * - Add tolerance value in color match, to prevent fringes caused by antialiasing
 * - Make it faster?
 */
export default class Fill extends BaseTools {
  toolName: ToolName;
  ctx: CanvasRenderingContext2D;
  toolAttrib: FillToolAttributes;

  mouseDownEventListener: (this: Document, ev: MouseEvent) => any;
  mouseUpEventListener: (this: Document, ev: MouseEvent) => any;
  mouseMoveEventListener: (this: Document, ev: MouseEvent) => any;
  maxTol: number;

  private curAction: Action<FillToolAttributes>;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(baseLayer, connection, state);
    this.toolName = ToolName.FILL;
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
    c1: number,
    c2: number,
    tolerance: number,
  ): boolean {
    return false;
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
    Fill.drawFill(
      this.ctx,
      this.mouseLastClickPosition,
      this.toolAttrib,
    )
  }

  static drawFill(
    ctx: CanvasRenderingContext2D,
    clickPosition: [number, number],
    toolAttrib: DefaultToolAttributes<FillToolAttributes>,
  ) {
    const [x, y] = clickPosition;
    const color = hexStringToUint32(toolAttrib.fillColor);

    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
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

    ctx.putImageData(imageData, 0, 0);
  }

  sendMessageOverConnection() {
    if (!this.connection?.isConnected()) {
      return;
    }
    this.connection.sendUserCommand(
      this.getCommand()
    );
  }

  recordCommand() {
    this.curAction = {
      toolName: this.toolName,
      commands: [this.getCommand()]
    }
    this.state.do(this.curAction);
  }
}
