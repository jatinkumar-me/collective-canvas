import Pencil from "../tools/pencil";
import ToolAttributes, { DefaultToolAttributes } from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";
import User, { UserId } from "./user";
import UserManager from "./userManager";

enum SocketMessageKind {
    USER_CONNECTED = 1,
    USER_DISCONNECTED = 2,
    USER_COMMAND = 3
}

export type UserCommand<T extends ToolAttributes> = {
    x: number;
    y: number;
    isDrag: boolean;
    toolName: ToolName
    toolAttributes: DefaultToolAttributes<T>
}

export type SocketMessage = {
    type: SocketMessageKind.USER_CONNECTED;
    user: User;
} | {
    type: SocketMessageKind.USER_DISCONNECTED;
    userId: UserId;
} | {
    type: SocketMessageKind.USER_COMMAND;
    command: UserCommand<any>
}


export class Connection {
    webSocket: WebSocket;
    userManager: UserManager;

    constructor(connectionURL: string, userManaager: UserManager) {
        this.webSocket = new WebSocket(connectionURL);
        this.userManager = userManaager;
        this.webSocket.onmessage = this.socketMessageHandler.bind(this);
        this.webSocket.onclose = this.connectionCloseHandler.bind(this);
        this.webSocket.onopen = this.connectionOpenHandler.bind(this);
    }

    connectionOpenHandler() {
        const message: SocketMessage = {
            type: SocketMessageKind.USER_CONNECTED,
            user: this.userManager.currentUser,
        }
        const messageString = JSON.stringify(message);
        this.webSocket.send(messageString);
    }

    connectionCloseHandler() {
        const message: SocketMessage = {
            type: SocketMessageKind.USER_DISCONNECTED,
            userId: this.userManager.currentUser.userId,
        }
        const messageString = JSON.stringify(message);
        this.webSocket.send(messageString);
    }

    socketMessageHandler(event: MessageEvent<string>) {
        const data = JSON.parse(event.data) as SocketMessage;
        console.log(data);
        switch (data.type) {
            case SocketMessageKind.USER_CONNECTED:
                this.handleUserConnected(data.user);
                break;
            case SocketMessageKind.USER_DISCONNECTED:
                this.handleUserDisconnected(data.userId);
                break;
            case SocketMessageKind.USER_COMMAND:
                this.handleUserCommand(data.command);
                break;
            default: {
                console.error("invalid message sent by the socket");
            }
        }
    }

    handleUserConnected(user: User) {
        this.userManager.addUser(user)
    }

    handleUserDisconnected(userId: UserId) {
        this.userManager.removeUser(userId);
    }

    handleUserCommand<T extends ToolAttributes>(command: UserCommand<T>) {
        switch(command.toolName) {
            case ToolName.PENCIL:
                Pencil.drawSegment
                break;
            case ToolName.BEZIER:
                break;
        }
    }

    sendUserCommand<T extends ToolAttributes>(command: UserCommand<T>) {
        const message: SocketMessage = {
            type: SocketMessageKind.USER_COMMAND,
            command: command
        }
        const messageString = JSON.stringify(message);
        this.webSocket.send(messageString);
    }
}
