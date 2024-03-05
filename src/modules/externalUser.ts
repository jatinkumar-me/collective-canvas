import State, { Action } from "../actions/state";
import Ellipse from "../tools/ellipse";
import Pencil from "../tools/pencil";
import Rectangle from "../tools/rectangle";
import ToolAttributes, { DefaultToolAttributes } from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";
import { UserCommand } from "./network";
import User from "./user";

export class ExternalUser extends User {
    private clickX: number;
    private clickY: number;
    private x: number;
    private y: number;
    private isDrag: boolean;
    private toolName: ToolName;
    private toolAttributes: DefaultToolAttributes<any>;

    private lastCommand: UserCommand<any> | null;
    private curAction: Action<any>;

    userCursor: HTMLDivElement;

    constructor(userId: string, userName: string, state: State) {
        super(userId, userName, state);
        this.clickX = 0;
        this.clickY = 0;
        this.x = 0;
        this.y = 0;
        this.isDrag = false;
        this.toolName = ToolName.PENCIL;
        this.toolAttributes = {};

        this.userCursor = this.createUserCursor();
        const canvas = document.getElementById('canvas-container') as HTMLElement;
        canvas.appendChild(this.userCursor);

        this.lastCommand = null;
        this.curAction = {
            toolName: ToolName.PENCIL,
            commands: [],
            isExternal: true,
        }
    }

    createUserCursor() {
        const userCursorDiv = document.createElement("div");
        userCursorDiv.classList.add("user-cursor");
        userCursorDiv.id = this.userId;
        userCursorDiv.innerHTML = this.userName;
        userCursorDiv.style.position = 'absolute'
        userCursorDiv.style.top = '0px'
        userCursorDiv.style.left = '0px'
        return userCursorDiv;
    }

    setUserCursorPosition() {
        this.userCursor.style.top = this.y.toString() + 'px'
        this.userCursor.style.left = this.x.toString() + 'px'
    }

    receiveCommand<T extends ToolAttributes>(
        command: UserCommand<T>,
        ctx: CanvasRenderingContext2D
    ) {
        this.toolName = command.toolName;
        this.isDrag = command.isDrag;
        this.toolAttributes = command.toolAttributes;

        if (this.isDrag && command.clickX && command.clickY) {
            this.clickX = command.clickX;
            this.clickY = command.clickY;
        }

        if (this.x === 0 && this.y === 0) {
            this.x = command.x;
            this.y = command.y;
            return;
        }

        switch (this.toolName) {
            case ToolName.PENCIL: {
                if (!this.isDrag) {
                    if (this.lastCommand && this.lastCommand.isDrag) {
                        this.recordState();
                        this.initCurAction(ToolName.PENCIL);
                    }
                    break;
                }
                Pencil.drawSegment(
                    ctx,
                    this.toolAttributes,
                    [command.x, command.y],
                    [this.x, this.y]
                );

                this.curAction.toolName = ToolName.PENCIL
                this.recordCommand(command);
                break;
            }
            case ToolName.BEZIER: {
                break;
            }
            case ToolName.RECTANGLE: {
                if (!command.draw || this.isDrag) {
                    break;
                }
                Rectangle.drawRect(
                    ctx,
                    [this.clickX, this.clickY],
                    [command.x, command.y],
                    this.toolAttributes
                )
                this.initCurAction(command.toolName)
                this.recordCommand(command);
                this.recordState();
                this.initCurAction(command.toolName)
                break;
            }
            case ToolName.ELLIPSE: {
                if (!command.draw || this.isDrag) {
                    break;
                }
                Ellipse.drawEllipse(
                    ctx,
                    [this.clickX, this.clickY],
                    [command.x, command.y],
                    this.toolAttributes
                )
                this.initCurAction(command.toolName)
                this.recordCommand(command);
                this.recordState();
                this.initCurAction(command.toolName)
                break;
            }
        }

        this.x = command.x;
        this.y = command.y;
        this.setUserCursorPosition();
        this.lastCommand = command;
    }

    initCurAction(toolName: ToolName) {
        this.curAction = {
            toolName,
            commands: [],
            isExternal: true,
        }
    }

    recordCommand<T extends ToolAttributes>(command: UserCommand<T>) {
        this.curAction.commands.push(command)
    }

    recordState() {
        this.state.do(this.curAction);
    }

    destroy() {
        const canvas = document.getElementById('canvas-container') as HTMLElement;
        canvas.removeChild(this.userCursor);
    }
}
