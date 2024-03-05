import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import { getCircleDimensions } from "../utils/utils";
import Shape, { ShapeToolAttributes } from "./shape";
import {
  DefaultToolAttributes,
} from "./toolAttributes";
import { ToolName } from "./toolManager";

const DEFAULT_ELLIPSE_TOOL_ATTRIBUTES: DefaultToolAttributes<EllipseToolAttributes> =
{
  strokeStyle: "#000000",
  strokeWidth: 1,
  isFilled: false,
  fillStyle: "#000000",
  isEqual: false,
};

export class EllipseToolAttributes extends ShapeToolAttributes {
  constructor(defaultAttribs: DefaultToolAttributes<EllipseToolAttributes>) {
    super('ellipse', defaultAttribs);
  }
}


export default class Ellipse extends Shape {

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(
      baseLayer,
      connection,
      state,
      ToolName.ELLIPSE,
      new EllipseToolAttributes(DEFAULT_ELLIPSE_TOOL_ATTRIBUTES),
    );
  }

  drawShape(ctx: CanvasRenderingContext2D): void {
    Ellipse.drawEllipse(
      ctx,
      this.mouseLastClickPosition,
      this.mouseLastPosition,
      this.toolAttrib
    );
  }

  /**
  * The current implementation of this method will only include expand from center
  * Later, rotation of axis will also be added.
  */
  static drawEllipse(
    ctx: CanvasRenderingContext2D,
    center: [number, number],
    endPoint: [number, number],
    toolAttrib: DefaultToolAttributes<EllipseToolAttributes>
  ) {
    ctx.beginPath();
    let radiusX = Math.abs(endPoint[0] - center[0]);
    let radiusY = Math.abs(endPoint[1] - center[1]);

    if (toolAttrib.isEqual) {
      const maxRadii = getCircleDimensions(radiusX, radiusY);
      radiusX = maxRadii;
      radiusY = maxRadii;
    }

    ctx.ellipse(
      center[0],
      center[1],
      radiusX,
      radiusY,
      0,
      0,
      2 * Math.PI
    );

    if (toolAttrib.isFilled) {
      ctx.fillStyle = toolAttrib.fillStyle;
      ctx.fill();
    }
    ctx.strokeStyle = toolAttrib.strokeStyle;
    ctx.lineWidth = toolAttrib.strokeWidth;
    ctx.stroke();
  }
}
