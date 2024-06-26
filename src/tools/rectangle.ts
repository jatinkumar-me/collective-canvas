import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import { getSquareDimensions } from "../utils/utils";
import Shape, { ShapeToolAttributes } from "./shape";
import {
  DefaultToolAttributes,
} from "./toolAttributes";
import { ToolName } from "./toolManager";

const DEFAULT_RECTANGLE_TOOL_ATTRIBUTES: DefaultToolAttributes<RectangleToolAttributes> =
{
  strokeStyle: "#000000",
  strokeWidth: 1,
  isFilled: false,
  fillStyle: "#000000",
  isEqual: false,
};

export class RectangleToolAttributes extends ShapeToolAttributes {
  toolName: string;
  constructor(defaultAttribs: DefaultToolAttributes<RectangleToolAttributes>) {
    super(defaultAttribs, 'Square');
    this.toolName = 'rectangle'
  }
}


export default class Rectangle extends Shape {
  toolAttrib: RectangleToolAttributes;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(
      baseLayer,
      connection,
      state,
      ToolName.RECTANGLE,
    );
    this.toolAttrib = new RectangleToolAttributes(
      this.retrieveToolAttributes() ?? DEFAULT_RECTANGLE_TOOL_ATTRIBUTES);
  }

  drawShape(ctx: CanvasRenderingContext2D,) {
    Rectangle.drawRect(ctx, this.mouseLastClickPosition, this.mouseLastPosition, this.toolAttrib);
  }

  /**
   * Static method for drawing a rectangle, using a single point and dimensions
   */
  static drawRect(
    ctx: CanvasRenderingContext2D,
    startPoint: [number, number],
    endPoint: [number, number],
    toolAttrib: DefaultToolAttributes<RectangleToolAttributes>
  ) {
    ctx.beginPath();
    let width = endPoint[0] - startPoint[0];
    let height = endPoint[1] - startPoint[1];

    if (toolAttrib.isEqual) {
      [width, height] = getSquareDimensions(width, height);
    }

    ctx.rect(startPoint[0], startPoint[1], width, height);
    if (toolAttrib.isFilled) {
      ctx.fillStyle = toolAttrib.fillStyle;
      ctx.fill();
    }
    ctx.strokeStyle = toolAttrib.strokeStyle;
    ctx.lineWidth = toolAttrib.strokeWidth;
    ctx.stroke();
  }
}
