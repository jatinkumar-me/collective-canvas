import BaseLayer from "../components/Layer";
import { UserCommand } from "../modules/network";
import Pencil from "../tools/pencil";
import ToolAttributes from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";

interface Action<T extends ToolAttributes> {
  toolName: ToolName;
  commands: UserCommand<T>[];
}

/**
 * Maintaining state for undoing and redoing.
 * The state maintains two stacks actions and redoActions
 */
export default class State {
  private actions: Action<any>[];
  private redoActions: Action<any>[];
  private baseLayer: BaseLayer;

  constructor(baseLayer: BaseLayer) {
    this.actions = [];
    this.redoActions = [];
    this.#setEventListeners();
    this.baseLayer = baseLayer;
  }

  #setEventListeners() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      const key = (event.key || '').toLowerCase();

      if (key == "u") {
        this.undo();
        event.preventDefault();
      }
      if (key == "r" && (event.ctrlKey == true || event.metaKey)) {
        this.redo();
        event.preventDefault();
      }
    }, false);
  }

  canUndo(): boolean {
    return this.actions.length > 0;
  }

  canRedo(): boolean {
    return this.redoActions.length > 0;
  }

  undo() {
    if (!this.canUndo()) {
      console.log("Already the last change");
      return;
    }
    const lastAction = this.actions.pop();
    if (!lastAction) {
      return;
    }
    this.redoActions.push(lastAction);
    this.drawAllActions();
  }

  redo() {
    if (!this.canRedo) {
      console.log("Already the newest change");
      return;
    }

  }

  drawAllActions() {
    for (let action of this.actions) {
      this.drawAction(action);
    }
  }

  drawAction(action: Action<any>): void {
    if (action.commands.length < 1) {
      console.warn("Invalid action in the state");
      return;
    }
    switch (action.toolName) {
      case ToolName.PENCIL: {
        Pencil.drawPath(this.baseLayer.ctx, action.commands);
        break;
      }
      case ToolName.BEZIER:
      case ToolName.RECTANGLE:
      case ToolName.LINE:
    }
  }
}
