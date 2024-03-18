import State from "../actions/state";
import BaseLayer from "../components/Layer";
import { Connection } from "../modules/network";
import Ellipse from "./ellipse";
import Fill from "./fill";
import Line from "./line";
import Pencil from "./pencil";
import Rectangle from "./rectangle";
import Text from "./text";
import BaseTools from "./tools";

export enum ToolName {
  PENCIL = 'pencil',
  BEZIER = 'bezier',
  RECTANGLE = 'rectangle',
  LINE = 'line',
  ELLIPSE = 'ellipse',
  FILL = 'fill',
  TEXT = 'text',
  CLEAR = 'clear',
}

/**
 * Class to manage the selected tool in the app.
 */
export default class ToolManager {
  private selectedTool: BaseTools;
  private connection: Connection;
  selectedToolName: ToolName;
  state: State;

  constructor(private baseLayer: BaseLayer, connection: Connection, state: State) {
    this.connection = connection;
    this.state = state;
    this.selectedTool = new Pencil(baseLayer, connection, state);
    this.selectedToolName = ToolName.PENCIL;
    this.events();
  }

  public init() {
    const selectedToolButton = document.getElementById(this.selectedToolName) as HTMLButtonElement;
    selectedToolButton.setAttribute('disabled', 'true');
  }

  events() {
    const toolBoxDiv = document.getElementById('toolbox');
    if (!toolBoxDiv) {
      console.error('toolBoxDiv not present in the document');
      return;
    }

    toolBoxDiv.addEventListener('click', this.handleToolSelection.bind(this));
  }

  /**
   * Using event delegation for handling tool selection
   **/
  handleToolSelection(event: Event) {
    const target = (event.target as HTMLElement).closest('button') as HTMLButtonElement;
    const toolName = target.dataset.tool;
    if (!toolName) {
      console.warn('toolName not defined as dataset in markup');
      return;
    }

    if (this.selectedToolName === toolName) {
      return;
    }

    const tool = this.createToolFromName(toolName);
    if (!tool) {
      console.error('tool either not implemented or properly defined');
      return;
    }

    this.selectTool(tool, toolName as ToolName);
    target.setAttribute('disabled', 'true');
  }

  createToolFromName(toolName: string): BaseTools | null {
    switch (toolName) {
      case ToolName.PENCIL:
        return new Pencil(this.baseLayer, this.connection, this.state);
      case ToolName.BEZIER:
        // return new Bezier(this.baseLayer);
      case ToolName.RECTANGLE:
        return new Rectangle(this.baseLayer, this.connection, this.state);
      case ToolName.ELLIPSE:
        return new Ellipse(this.baseLayer, this.connection, this.state);
      case ToolName.LINE:
        return new Line(this.baseLayer, this.connection, this.state);
      case ToolName.FILL:
        return new Fill(this.baseLayer, this.connection, this.state);
      case ToolName.TEXT:
        return new Text(this.baseLayer, this.connection, this.state);
      default:
        return null;
    }
  }

  selectTool(tool: BaseTools, toolName: ToolName) {
    this.selectedTool.destroy();
    const selectedToolButton = document.getElementById(this.selectedToolName) as HTMLButtonElement;
    selectedToolButton.disabled = false;
    this.selectedTool = tool;
    this.selectedToolName = toolName;
  }
}
