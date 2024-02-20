import ToolAttributes, { DefaultToolAttributes } from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";
import User from "./user";

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
} | {
    type: SocketMessageKind.USER_COMMAND;
    command: UserCommand<any>
}


export class Connection {
    webSocket: WebSocket;

    constructor(connectionURL: string) {
        this.webSocket = new WebSocket(connectionURL);
        this.webSocket.onmessage = this.socketMessageHandler.bind(this);
    }

    socketMessageHandler(event: MessageEvent<string>) {
        const data = JSON.parse(event.data) as SocketMessage;
        console.log(data);
        switch (data.type) {
            case SocketMessageKind.USER_CONNECTED:
                break;
            case SocketMessageKind.USER_DISCONNECTED:
                break;
            case SocketMessageKind.USER_COMMAND:
                console.log(data.command);
                break;
            default: {
                console.error("invalid message sent by the socket");
            }
        }
    }

    handleUserConnected() {
    }

    handleUserDisconnected() {
    }

    handleUserCommand() {
    }

    sendUserCommand<T extends ToolAttributes>(command: UserCommand<T>) {
        const message: SocketMessage = {
            type: SocketMessageKind.USER_COMMAND,
            command: command
        }
        const messageString = JSON.stringify(message);
        this.webSocket.send(messageString);
    }

    closeConnection() {
        this.webSocket.close(WebSocket.CLOSED);
    }
}
