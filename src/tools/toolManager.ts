import BaseLayer from "../components/Layer";
import Bezier from "./bezier";
import Pencil from "./pencil";
import BaseTools from "./tools";

enum ToolIds {
  PENCIL = 'pencil',
  BEZIER = 'bezier',
}

/**
 * Class to manage the selected tool in the app.
 */
export default class ToolManager {
  private selectedTool: BaseTools;
  selectedToolName: ToolIds;

  constructor(private baseLayer: BaseLayer) {
    this.selectedTool = new Pencil(baseLayer);
    this.selectedToolName = ToolIds.PENCIL;
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

    this.selectTool(tool, toolName as ToolIds);
    target.setAttribute('disabled', 'true');
  }

  createToolFromName(toolName: string): BaseTools | null {
    switch (toolName) {
      case ToolIds.PENCIL:
        return new Pencil(this.baseLayer);
      case ToolIds.BEZIER:
        return new Bezier(this.baseLayer);
      default:
        return null;
    }
  }

  selectTool(tool: BaseTools, toolName: ToolIds) {
    this.selectedTool.destroy();
    const selectedToolButton = document.getElementById(this.selectedToolName) as HTMLButtonElement;
    selectedToolButton.disabled = false;
    this.selectedTool = tool;
    this.selectedToolName = toolName;
  }
}
