import { Connection } from "./network";
import { UserId } from "./user";
import UserManager from "./userManager";

export default class UserChat {
    private connection?: Connection;
    private userManager: UserManager;

    private messageListDiv: HTMLDivElement;
    private message: string;

    private chatForm: HTMLFormElement;

    constructor(userManager: UserManager) {
        this.userManager = userManager;
        this.message = "";
        let chatForm = document.getElementById("message-form") as HTMLFormElement;
        if (!chatForm) {
            throw new Error("Chat form not present in document");
        }
        this.chatForm = chatForm;
        let messageListDiv = document.getElementById("message-list") as HTMLDivElement;
        if (!messageListDiv) {
            throw new Error("Message list div not present in document");
        }
        this.chatForm.onsubmit = this.onSubmit.bind(this);
        this.messageListDiv = messageListDiv;
    }

    init(connection: Connection) {
        this.connection = connection;
    }

    /**
    * userId must be provided if isCurrent is false
    */
    private appendMessage(isCurrent: boolean, userId?: UserId): void {
        let userName: string;
        const messageNode = document.createElement("div");
        messageNode.classList.add("message");

        if (isCurrent) {
            userName = "You";
            messageNode.classList.add("user-message");
        } else if (!userId) {
            return;
        } else {
            const user = this.userManager.getUser(userId);
            if (!user) {
                return;
            }
            userName = user.userName;
        }

        const senderSpan = document.createElement("span");
        senderSpan.classList.add("message-sender");
        senderSpan.textContent = userName;

        const textParagraph = document.createElement("p");
        textParagraph.classList.add("message-text");
        textParagraph.textContent = this.message;

        messageNode.appendChild(senderSpan);
        messageNode.appendChild(textParagraph);

        this.messageListDiv.appendChild(messageNode);
    }

    private sendMessage() {
        if (!this.connection) {
            throw new Error('User chat not initialized');
        }
        this.connection.sendUserMessage(
            this.userManager.getCurrentUser().userId,
            this.message,
        );
    }

    public receiveMessage(userId: UserId, message: string) {
        this.message = message;
        this.appendMessage(false, userId);
    }

    private onSubmit(ev: SubmitEvent) {
        ev.preventDefault();
        const formData = new FormData(this.chatForm);
        let message = formData.get('message');
        if (!message) {
            console.warn("Invalid message");
            return;
        }
        this.message = message as string;
        this.sendMessage();
        this.appendMessage(true);
        this.chatForm.reset();
    }
}
