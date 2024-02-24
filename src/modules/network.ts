import ToolAttributes, { DefaultToolAttributes } from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";
import User, { ExternalUser, UserId } from "./user";
import UserManager from "./userManager";

enum SocketMessageKind {
    USER_CONNECTED = 1,
    USER_DISCONNECTED = 2,
    USER_COMMAND = 3,
    USER_CONNECTION_ACKNOWLEDGED = 4,
}

export type UserCommand<T extends ToolAttributes> = {
    x: number;
    y: number;
    isDrag: boolean;
    toolName: ToolName;
    toolAttributes: DefaultToolAttributes<T>;
};

export type SocketMessage =
    | {
        type: SocketMessageKind.USER_CONNECTED;
        user: ExternalUser;
    }
    | {
        type: SocketMessageKind.USER_DISCONNECTED;
        userId: UserId;
    }
    | {
        type: SocketMessageKind.USER_COMMAND;
        userId: UserId;
        command: UserCommand<any>;
    }
    | {
        type: SocketMessageKind.USER_CONNECTION_ACKNOWLEDGED;
        user: User;
        users: ExternalUser[];
    };

export class Connection {
    private webSocket: WebSocket;
    private userManager: UserManager;

    constructor(connectionURL: string, userManaager: UserManager) {
        this.webSocket = new WebSocket(connectionURL);
        this.userManager = userManaager;
        this.webSocket.onmessage = this.socketMessageHandler.bind(this);
        this.webSocket.onclose = this.connectionCloseHandler.bind(this);
        this.webSocket.onopen = this.connectionOpenHandler.bind(this);
    }

    private isConnected(): boolean {
        return this.webSocket.readyState === WebSocket.OPEN;
    }

    connectionOpenHandler() {
        const message: SocketMessage = {
            type: SocketMessageKind.USER_CONNECTED,
            user: this.userManager.getCurrentUser() as ExternalUser,
        };
        const messageString = JSON.stringify(message);
        this.webSocket.send(messageString);
    }

    connectionCloseHandler() {
        const message: SocketMessage = {
            type: SocketMessageKind.USER_DISCONNECTED,
            userId: this.userManager.getCurrentUser().userId,
        };
        const messageString = JSON.stringify(message);
        this.webSocket.send(messageString);
    }

    socketMessageHandler(event: MessageEvent<string>) {
        const data = JSON.parse(event.data) as SocketMessage;
        console.log("Incoming message", data);
        switch (data.type) {
            case SocketMessageKind.USER_CONNECTED:
                this.handleUserConnected(data.user);
                break;
            case SocketMessageKind.USER_DISCONNECTED:
                this.handleUserDisconnected(data.userId);
                break;
            case SocketMessageKind.USER_COMMAND:
                this.userManager.handleUserCommand(data.userId, data.command);
                break;
            case SocketMessageKind.USER_CONNECTION_ACKNOWLEDGED:
                this.handlUserConnectionAcknowledged(data.user, data.users);
                break;
            default: {
                console.error("invalid message sent by the socket");
            }
        }
    }

    handlUserConnectionAcknowledged(user: User, existingUsers: ExternalUser[]) {
        this.userManager.setCurrentUser(user.userId, user.userName);
        this.userManager.addMany(existingUsers);
    }

    handleUserConnected(user: ExternalUser) {
        this.userManager.addUser(user);
    }

    handleUserDisconnected(userId: UserId) {
        this.userManager.removeUser(userId);
    }

    sendUserCommand<T extends ToolAttributes>(command: UserCommand<T>) {
        if (!this.isConnected()) {
            return;
        }
        const message: SocketMessage = {
            type: SocketMessageKind.USER_COMMAND,
            userId: this.userManager.getCurrentUser().userId,
            command: command,
        };
        const messageString = JSON.stringify(message);
        this.webSocket.send(messageString);
    }
}
