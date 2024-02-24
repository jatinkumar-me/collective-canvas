import Pencil from "../tools/pencil";
import ToolAttributes, { DefaultToolAttributes } from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";
import { UserCommand } from "./network";

export type UserId = string;

export default class User {
    userId: UserId;
    userName: string;
    userElement: HTMLDivElement;

    constructor(userId: string, userName: string) {
        this.userId = userId;
        this.userName = userName;
        this.userElement = this.createUserDiv();
    }

    private createUserDiv(): HTMLDivElement {
        const userDiv = document.createElement("div");
        userDiv.classList.add("user-div");
        userDiv.innerHTML = `<strong>${this.userName}</strong>`;
        return userDiv;
    }
}

export class ExternalUser extends User {
    private x: number;
    private y: number;
    private isDrag: boolean;
    private toolName: ToolName;
    private toolAttributes: DefaultToolAttributes<any>;

    constructor(userId: string, userName: string) {
        super(userId, userName);
        this.x = 0;
        this.y = 0;
        this.isDrag = false;
        this.toolName = ToolName.PENCIL;
        this.toolAttributes = {};
    }

    receiveCommand<T extends ToolAttributes>(
        command: UserCommand<T>,
        ctx: CanvasRenderingContext2D
    ) {
        this.toolName = command.toolName;
        this.isDrag = command.isDrag;

        if (this.x === 0 && this.y === 0) {
            this.x = command.x;
            this.y = command.y;
            return;
        }

        if (!this.isDrag) {
            this.x = 0;
            this.y = 0;
            ctx.closePath();
            return;
        }

        this.toolAttributes = command.toolAttributes;
        Pencil.drawSegment(
            ctx,
            this.toolAttributes,
            [command.x, command.y],
            [this.x, this.y]
        );

        this.x = command.x;
        this.y = command.y;
    }
}
