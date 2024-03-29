import ToolAttributes, { DefaultToolAttributes } from "../tools/toolAttributes";
import { ToolName } from "../tools/toolManager";
import UserChat from "./chat";
import User, { UserData, UserId }  from "./user";
import UserManager from "./userManager";

enum SocketMessageKind {
    USER_CONNECTED = 1,
    USER_DISCONNECTED = 2,
    USER_COMMAND = 3,
    USER_CONNECTION_ACKNOWLEDGED = 4,
    USER_MESSAGE = 5,
}

export type UserCommand<T extends ToolAttributes> = {
    x: number;
    y: number;
    clickX?: number;
    clickY?: number;
    draw?: boolean;
    isDrag: boolean;
    toolName: ToolName;
    toolAttributes: DefaultToolAttributes<T>;
};

export type SocketMessage =
    | {
        type: SocketMessageKind.USER_CONNECTED;
        user: UserData;
    }
    | {
        type: SocketMessageKind.USER_DISCONNECTED;
        userId: UserId;
    }
    | {
        type: SocketMessageKind.USER_COMMAND;
        userId: UserId;
        command: UserCommand<any>;
    } | {
        type: SocketMessageKind.USER_CONNECTION_ACKNOWLEDGED;
        user: UserData;
        users: UserData[];
    } | {
        type: SocketMessageKind.USER_MESSAGE;
        userId: UserId;
        message: string;
    };

export class Connection {
    private webSocket: WebSocket;
    private userManager: UserManager;
    private userChat: UserChat;

    constructor(connectionURL: string, userManaager: UserManager, userChat: UserChat) {
        this.webSocket = new WebSocket(connectionURL);
        this.userManager = userManaager;
        this.userChat = userChat;
        this.webSocket.onmessage = this.socketMessageHandler.bind(this);
        this.webSocket.onclose = this.connectionCloseHandler.bind(this);
        this.webSocket.onopen = this.connectionOpenHandler.bind(this);
    }

    isConnected(): boolean {
        return this.webSocket.readyState === WebSocket.OPEN;
    }

    connectionOpenHandler() {
        const message: SocketMessage = {
            type: SocketMessageKind.USER_CONNECTED,
            user: this.userManager.getCurrentUser() as User,
        };
        const messageString = JSON.stringify(message);
        this.webSocket.send(SocketMessageKind.USER_CONNECTED + messageString);
    }

    connectionCloseHandler() {
        const message: SocketMessage = {
            type: SocketMessageKind.USER_DISCONNECTED,
            userId: this.userManager.getCurrentUser().userId,
        };
        const messageString = JSON.stringify(message);
        this.webSocket.send(SocketMessageKind.USER_DISCONNECTED + messageString);
    }

    socketMessageHandler(event: MessageEvent<string>) {
        const data = JSON.parse(event.data) as SocketMessage;
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
            case SocketMessageKind.USER_MESSAGE:
                this.handleUserMessage(data.userId, data.message);
                break;
            default: {
                console.error("invalid message sent by the socket");
            }
        }
    }

    handlUserConnectionAcknowledged(user: UserData, existingUsers: UserData[]) {
        this.userManager.setCurrentUser(user.userId, user.userName);
        this.userManager.addMany(existingUsers);
    }

    handleUserConnected(user: UserData) {
        this.userManager.addExternalUser(user);
    }

    handleUserDisconnected(userId: UserId) {
        this.userManager.removeUser(userId);
    }

    handleUserMessage(userId: UserId, message: string) {
        this.userChat.receiveMessage(userId, message);
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

    sendUserMessage(userId: UserId, message: string) {
        const socketMessage: SocketMessage = {
            type: SocketMessageKind.USER_MESSAGE,
            message,
            userId,
        }
        this.webSocket.send(JSON.stringify(socketMessage));
    }
}
