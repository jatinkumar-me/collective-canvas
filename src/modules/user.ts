import Pencil from "../tools/pencil";
import Rectangle from "../tools/rectangle";
import ToolAttributes, { DefaultToolAttributes } from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";
import { UserCommand } from "./network";

export type UserId = string;

export default class User {
    userId: UserId;
    userName: string;
    userElement: HTMLDivElement;
    isInternal: boolean;

    constructor(userId: string, userName: string, isInternal?: boolean) {
        this.userId = userId;
        this.userName = userName;
        this.isInternal = isInternal ?? false;
        this.userElement = this.createUserDiv();
    }

    private createUserDiv(): HTMLDivElement {
        const userDiv = document.createElement("div");
        userDiv.classList.add("user-div");
        userDiv.innerHTML = `<strong>${this.userName}</strong>`;
        if (this.isInternal) {
            userDiv.classList.add("internal");
            userDiv.innerHTML = userDiv.innerHTML + '<span>(You)</span>'
        }
        return userDiv;
    }
}

export class ExternalUser extends User {
    private clickX: number;
    private clickY: number;
    private x: number;
    private y: number;
    private isDrag: boolean;
    private toolName: ToolName;
    private toolAttributes: DefaultToolAttributes<any>;

    userCursor: HTMLDivElement;

    constructor(userId: string, userName: string) {
        super(userId, userName);
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
                    break;
                }
                Pencil.drawSegment(
                    ctx,
                    this.toolAttributes,
                    [command.x, command.y],
                    [this.x, this.y]
                );
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
                break;
            }
        }

        this.x = command.x;
        this.y = command.y;
        this.setUserCursorPosition();
    }

    destroy() {
        const canvas = document.getElementById('canvas-container') as HTMLElement;
        canvas.removeChild(this.userCursor);
    }
}
