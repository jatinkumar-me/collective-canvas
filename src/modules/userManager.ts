import State from "../actions/state";
import BaseLayer from "../components/Layer";
import ToolAttributes from "../tools/toolAttributes";
import { ExternalUser } from "./externalUser";
import InternalUser from "./internalUser";
import { UserCommand } from "./network";
import { UserData, UserId } from "./user";

export default class UserManager {
    private users: Map<UserId, ExternalUser>;
    private currentUser: InternalUser;
    private userListDiv: HTMLDivElement;
    private baseLayer: BaseLayer;
    private state: State;

    constructor(baseLayer: BaseLayer, state: State, currentUser: InternalUser) {
        this.baseLayer = baseLayer;
        this.state = state;
        this.users = new Map<UserId, ExternalUser>();
        this.currentUser = currentUser;
        const userListDiv = document.getElementById("user-list-div");
        if (!userListDiv) {
            throw new Error("user list div not present");
        }
        this.userListDiv = userListDiv as HTMLDivElement;
    }

    getCurrentUser(): UserData {
        return {
            userId: this.currentUser.userId,
            userName: this.currentUser.userName,
        };
    }

    setCurrentUser(userId: UserId, userName: string) {
        this.currentUser.setUser(userId, userName);
        this.userListDiv.appendChild(this.currentUser.userElement);
    }

    addExternalUser(userData: UserData) {
        const newUser = new ExternalUser(userData.userId, userData.userName, this.state);
        this.users.set(newUser.userId, newUser);
        this.userListDiv.appendChild(newUser.userElement);
    }

    addMany(users: UserData[]) {
        if (!users || users.length === 0) {
            return;
        }
        users.forEach((user) => {
            if (user.userId === this.currentUser.userId) {
                return;
            }
            this.addExternalUser(user);
        });
    }

    removeUser(userId: string) {
        const externalUser = this.users.get(userId);
        if (!externalUser) {
            console.warn("Attempting to remove non existent user");
            return;
        }
        this.users.delete(userId);
        this.userListDiv.removeChild(externalUser.userElement);
        externalUser.destroy();
    }

    getUser(userId: string) {
        this.users.get(userId);
    }

    handleUserCommand<T extends ToolAttributes>(
        userId: UserId,
        command: UserCommand<T>
    ) {
        const externalUser = this.users.get(userId);
        if (!externalUser) {
            console.warn("Commands received from a user that is not present");
            return;
        }
        externalUser.receiveCommand(command, this.baseLayer.ctx);
    }
}
