import BaseLayer from "../components/Layer";
import { UserCommand } from "../modules/network";
import Ellipse from "../tools/ellipse";
import Fill from "../tools/fill";
import ImageTool from "../tools/image";
import Line from "../tools/line";
import Pencil from "../tools/pencil";
import Rectangle from "../tools/rectangle";
import Text from "../tools/text";
import ToolAttributes from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";

export interface Action<T extends ToolAttributes> {
  toolName: ToolName;
  commands: UserCommand<T>[];
  isExternal?: boolean
}

/**
 * Using Reversible because `Undoable` doesn't make much sense
 */
export interface Reversible {
  /**
   * `recordCommand` method must call `do` method from `state` class
   */
  recordCommand(): void;
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

    this.initBaseLayerState();
    this.retrieveState();
  }

  saveState() {
    const stateString = JSON.stringify({ actions: this.actions, redoActions: this.redoActions });
    localStorage.setItem('state', stateString);
  }

  retrieveState() {
    const stateString = localStorage.getItem('state');
    if (!stateString) {
      return;
    }
    type StaticState = { actions: Action<any>[], redoActions: Action<any>[] }
    const { actions, redoActions } = JSON.parse(stateString) as StaticState;
    this.actions = actions;
    this.redoActions = redoActions;
    try {
      this.drawAllActions();
    } catch {
      console.warn("Invalid data in state, removing all state actions");
      this.actions = [];
      this.redoActions = [];
      this.drawAllActions();
    }
  }

  initBaseLayerState() {
    this.baseLayer.onCanvasClear = this.resetState.bind(this);
  }

  #setEventListeners() {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      const key = (event.key || '').toLowerCase();

      if (key == "z" && (event.ctrlKey == true || event.metaKey)) {
        event.preventDefault();
        this.undo();
      }
      if (key == "r" && (event.ctrlKey == true || event.metaKey)) {
        event.preventDefault();
        this.redo();
      }
    }, false);
  }

  resetState() {
    this.actions = [];
    this.redoActions = [];
    localStorage.removeItem('state');
  }

  onCanvasClearAction() {
    this.do({
      toolName: ToolName.CLEAR,
      commands: [],
    })
  }

  canUndo(): boolean {
    return this.actions.length > 0;
  }

  canRedo(): boolean {
    return this.redoActions.length > 0;
  }

  do(action: Action<any>) {
    this.actions.push(action);
    this.saveState();
  }

  undo() {
    if (!this.canUndo()) {
      console.info("Already the last change");
      alert("Already the last change");
      return;
    }
    const lastAction = this.actions.pop();
    if (!lastAction) {
      return;
    }
    this.redoActions.push(lastAction);
    this.drawAllActions();
    this.saveState();
  }

  redo() {
    if (!this.canRedo()) {
      console.info("Already the newest change");
      alert("Already the newest change");
      return;
    }

    const lastAction = this.redoActions.pop();
    if (!lastAction) {
      return;
    }
    this.drawAction(lastAction);
    this.actions.push(lastAction);
    this.saveState();
  }

  drawAllActions() {
    this.baseLayer.clearCanvas();
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
      case ToolName.RECTANGLE: {
        const command = action.commands[0];
        if (!command.clickX || !command.clickY) {
          break;
        }
        Rectangle.drawRect(this.baseLayer.ctx, [command.clickX, command.clickY], [command.x, command.y], command.toolAttributes)
        break;
      }
      case ToolName.ELLIPSE: {
        const command = action.commands[0];
        if (!command.clickX || !command.clickY) {
          break;
        }
        Ellipse.drawEllipse(this.baseLayer.ctx, [command.clickX, command.clickY], [command.x, command.y], command.toolAttributes)
        break;
      }
      case ToolName.LINE: {
        const command = action.commands[0];
        if (!command.clickX || !command.clickY) {
          break;
        }
        Line.drawLine(this.baseLayer.ctx, [command.clickX, command.clickY], [command.x, command.y], command.toolAttributes)
        break;
      }
      case ToolName.FILL: {
        const command = action.commands[0];
        if (!command.clickX || !command.clickY) {
          break;
        }
        Fill.drawFill(this.baseLayer.ctx, [command.clickX, command.clickY], command.toolAttributes)
        break;
      }
      case ToolName.TEXT: {
        const command = action.commands[0];
        if (!command.clickX || !command.clickY) {
          break;
        }
        Text.drawText(this.baseLayer.ctx, [command.clickX, command.clickY], command.toolAttributes)
        break;
      }
      case ToolName.IMAGE: {
        const command = action.commands[0];
        if (!command.clickX || !command.clickY) {
          break;
        }
        ImageTool.drawImage(this.baseLayer.ctx, [command.clickX, command.clickY], [command.x, command.y], command.toolAttributes)
        break;

      }
      case ToolName.CLEAR: {
        this.baseLayer.clearCanvas();
      }
    }
  }
}
