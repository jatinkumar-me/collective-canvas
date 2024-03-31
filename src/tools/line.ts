import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import { snapFreeEndAngle } from "../utils/utils";
import Shape, { ShapeToolAttributes } from "./shape";
import { DefaultToolAttributes } from "./toolAttributes";
import { ToolName } from "./toolManager";

const DEFAULT_LINE_TOOL_ATTRIBUTES: DefaultToolAttributes<LineToolAttributes> =
{
  strokeStyle: "#000000",
  strokeWidth: 1,
  isEqual: false,
  isFilled: false,
  fillStyle: ""
};

export class LineToolAttributes extends ShapeToolAttributes {
  toolName: string;

  constructor(defaultAttribs: DefaultToolAttributes<LineToolAttributes>) {
    super(defaultAttribs, 'Snap angle (Multiple of 15 deg)');
    this.toolName = 'line';
  }
}


export default class Line extends Shape {
  toolAttrib: LineToolAttributes;

  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(baseLayer,
      connection,
      state,
      ToolName.LINE,
    );
    this.toolAttrib = new LineToolAttributes(this.retrieveToolAttributes() ?? DEFAULT_LINE_TOOL_ATTRIBUTES)
  }

  drawShape(ctx: CanvasRenderingContext2D,) {
    Line.drawLine(
      ctx,
      this.mouseLastClickPosition,
      this.mouseLastPosition,
      this.toolAttrib,
    );
  }

  static drawLine(
    ctx: CanvasRenderingContext2D,
    startPoint: [number, number],
    endPoint: [number, number],
    toolAttrib: DefaultToolAttributes<LineToolAttributes>
  ) {
    ctx.beginPath();
    ctx.moveTo(startPoint[0], startPoint[1]);
    if (toolAttrib.isEqual) {
      snapFreeEndAngle(startPoint, endPoint);
    }
    ctx.lineTo(endPoint[0], endPoint[1]);
    ctx.lineWidth = toolAttrib.strokeWidth;
    ctx.strokeStyle = toolAttrib.strokeStyle;
    ctx.stroke();
  }
}
