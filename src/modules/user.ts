import { DefaultToolAttributes } from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";

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
        const userDiv = document.createElement('div');
        userDiv.classList.add('user-div');
        userDiv.innerHTML = `<strong>${this.userName}</strong>`;
        return userDiv;
    }
}

export class ExternalUser extends User {
    x: number;
    y: number;
    isDrag: boolean;
    toolName: ToolName
    toolAttributes: DefaultToolAttributes<any>

    constructor(userId: string, userName: string) {
        super(userId, userName);
        this.x = 0;
        this.y = 0;
        this.isDrag = false;
        this.toolName = ToolName.PENCIL;
        this.toolAttributes = {};
        super(userId, userName);
    }
}
