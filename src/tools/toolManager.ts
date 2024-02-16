import BaseLayer from "../components/Layer";
import Pencil from "./pencil";
import BaseTools from "./tools";

/**
 * Class to manage the selected tool in the app.
 */
export default class ToolManager {
  private selectedTool: BaseTools;

  constructor(private baseLayer: BaseLayer) {
    this.selectedTool = new Pencil(baseLayer);
    this.events();
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
    
    const tool = this.createToolFromName(toolName);
    if (!tool) {
      console.error('tool either not implemented or properly defined');
      return;
    }

    this.selectTool(tool);
  }

  createToolFromName(toolName: string): BaseTools | null {
    switch (toolName) {
      case 'pencil':
        return new Pencil(this.baseLayer);
      default:
        return null;
    }
  }

  selectTool(tool: BaseTools) {
    this.selectedTool = tool;
  }
}
