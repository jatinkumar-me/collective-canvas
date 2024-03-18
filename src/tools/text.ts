import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import Shape, { ShapeToolAttributes } from "./shape";
import { DefaultToolAttributes, ToolAttributeInputParam } from "./toolAttributes";
import { ToolName } from "./toolManager";

const DEFAULT_TEXT_TOOL_ATTRIBUTES: DefaultToolAttributes<TextToolAttributes> = {
  font: 'serif',
  fontSize: 12,
  align: 'left',
  textContent: '',
  strokeStyle: "#000000",
  strokeWidth: 1,
  isFilled: false,
  fillStyle: "#000000",
  isEqual: false,
}

const TEXT_TOOL_ATTRIBUTE_INPUT: ToolAttributeInputParam<TextToolAttributes> = {
  fontSize: {
    type: 'range',
    label: 'Font size',
    default: 12,
    max: 50,
    min: 3,
    step: 1
  },
  font: {
    type: 'select',
    label: 'Font',
    default: DEFAULT_TEXT_TOOL_ATTRIBUTES.font,
    options: [
      'serif',
      'sans-serif',
      'monospace'
    ],
  },
  align: {
    type: 'select',
    label: 'Align',
    default: DEFAULT_TEXT_TOOL_ATTRIBUTES.align,
    options: [
      'left',
      'right',
      'center'
    ]
  },
  textContent: {
    type: 'text-area',
    placeholder: 'Type your text here',
    label: 'Text'
  }
}

export class TextToolAttributes extends ShapeToolAttributes {
  font: string;
  align: CanvasTextAlign;
  textContent: string;
  fontSize: number;

  private fontInput: HTMLInputElement;
  private alignInput: HTMLInputElement;
  private textContentInput: HTMLInputElement;
  private fontSizeInput: HTMLInputElement;

  private fontInputListener: EventListener;
  private alignInputListener: EventListener;
  private textContentInputListener: EventListener;
  private fontSizeInputListener: EventListener;

  constructor(defaultAttribs: DefaultToolAttributes<TextToolAttributes>) {
    super(defaultAttribs, 'Fix font size', TEXT_TOOL_ATTRIBUTE_INPUT);
    this.font = defaultAttribs.font
    this.align = defaultAttribs.align
    this.textContent = defaultAttribs.textContent
    this.fontSize = defaultAttribs.fontSize

    this.fontInput = document.getElementById(
      "font"
    ) as HTMLInputElement;
    this.alignInput = document.getElementById(
      "align"
    ) as HTMLInputElement;
    this.textContentInput = document.getElementById(
      "textContent"
    ) as HTMLInputElement;
    this.fontSizeInput = document.getElementById(
      "fontSize"
    ) as HTMLInputElement;

    this.fontInputListener = this.setFont.bind(this);
    this.alignInputListener = this.setAlign.bind(this);
    this.textContentInputListener = this.setTextContent.bind(this);
    this.fontSizeInputListener = this.setFontSize.bind(this);

    this.additionalEvents();
  }

  additionalEvents(): void {
    this.fontInput.addEventListener("change", this.fontInputListener);
    this.alignInput.addEventListener("change", this.alignInputListener);
    this.textContentInput.addEventListener("change", this.textContentInputListener);
    this.fontSizeInput.addEventListener("change", this.fontSizeInputListener);
  }

  removeEvents(): void {
    super.removeEvents();
    this.fontInput.removeEventListener("change", this.fontInputListener);
    this.alignInput.removeEventListener("change", this.alignInputListener);
    this.textContentInput.removeEventListener("change", this.textContentInputListener);
    this.fontSizeInput.removeEventListener("change", this.fontSizeInputListener);
  }

  getAttributes(): DefaultToolAttributes<TextToolAttributes> {
    const baseShapeAttribute = super.getAttributes();
    return {
      ...baseShapeAttribute,
      font: this.font,
      textContent: this.textContent,
      align: this.align,
      fontSize: this.fontSize
    }
  }

  setAlign(e: Event) {
    this.align = (e.target as HTMLInputElement).value as CanvasTextAlign;
  }
  setTextContent(e: Event) {
    this.textContent = (e.target as HTMLInputElement).value;
  }
  setFontSize(e: Event) {
    this.fontSize = parseInt((e.target as HTMLInputElement).value)
  }
  setFont(e: Event) {
    this.font = (e.target as HTMLInputElement).value
  }
}

export default class Text extends Shape {
  constructor(baseLayer: BaseLayer, connection: Connection, state: State) {
    super(
      baseLayer,
      connection,
      state,
      ToolName.TEXT,
      new TextToolAttributes(DEFAULT_TEXT_TOOL_ATTRIBUTES)
    );
  }

  drawShape(ctx: CanvasRenderingContext2D): void {
    if (this.toolAttrib.isEqual) {
      this.dynamicFontSize(
        this.mouseLastPosition,
        this.mouseLastClickPosition,
      )
    }

    Text.drawText(
      ctx,
      this.mouseLastClickPosition,
      this.toolAttrib as TextToolAttributes
    )
  }

  dynamicFontSize(
    mouseLastPosition: [number, number],
    mouseLastClickPosition: [number, number],
  ) {
    const dist = Math.abs(mouseLastClickPosition[1] - mouseLastPosition[1]);
    (this.toolAttrib as TextToolAttributes).fontSize = dist;
  }

  static drawText(
    ctx: CanvasRenderingContext2D,
    mouseLastClickPosition: [number, number],
    toolAttrib: DefaultToolAttributes<TextToolAttributes>
  ) {
    if (toolAttrib.textContent.length < 1) {
      console.warn("Text field is empty");
      return;
    }
    ctx.strokeStyle = toolAttrib.strokeStyle;
    ctx.fillStyle = toolAttrib.fillStyle;
    ctx.font = toolAttrib.fontSize + 'px ' + toolAttrib.font;
    ctx.textAlign = toolAttrib.align;
    ctx.textBaseline = 'top'

    ctx.fillText(toolAttrib.textContent, mouseLastClickPosition[0], mouseLastClickPosition[1])
  }

  sendMessageOverConnection() {
    if (!this.connection?.isConnected()) {
      return;
    }
    this.connection.sendUserCommand(this.getCommand(this.shouldDraw));
  }

  recordCommand() {
    this.state.do({
      toolName: this.toolName,
      commands: [this.getCommand(false)]
    })
  }
}
