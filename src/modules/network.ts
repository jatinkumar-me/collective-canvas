import { ToolName } from "../tools/toolManager";
import BaseTools from "../tools/tools";
import User from "./user";

enum SocketMessageKind {
    USER_CONNECTED = 1,
    USER_DISCONNECTED = 2,
    USER_COMMAND = 3
}

type UserCommand = {
    x: number;
    y: number;
    isDrag: boolean;
    toolName: ToolName
    tool: BaseTools
}

type SocketMessage = {
    type: SocketMessageKind.USER_CONNECTED;
    user: User;
} | {
    type: SocketMessageKind.USER_DISCONNECTED;
} | {
    type: SocketMessageKind.USER_COMMAND;
    command: UserCommand
}

export class Connection {
    webSocket: WebSocket;

    constructor(connectionURL: string) {
        this.webSocket = new WebSocket(connectionURL);
        this.webSocket.onmessage = this.socketMessageHandler.bind(this);
    }

    socketMessageHandler(event: MessageEvent<SocketMessage>) {
        const data = event.data;
        switch (data.type) {
            case SocketMessageKind.USER_CONNECTED:
            case SocketMessageKind.USER_DISCONNECTED:
            case SocketMessageKind.USER_COMMAND:
            default: {
                console.error("invalid message sent by the socket");
            }
        }
    }

    closeConnection() {
        this.webSocket.close(WebSocket.CLOSED);
    }
}
