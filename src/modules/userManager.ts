import User, { UserId } from "./user";

export default class UserManager {
    users: Map<UserId, User>;
    userListDiv: HTMLDivElement;

    constructor() {
        this.users = new Map<UserId, User>();
        const userListDiv = document.getElementById('user-list-div');
        if (!userListDiv) {
            throw new Error('user list div not present');
        }
        this.userListDiv = userListDiv as HTMLDivElement;
    }

    addUser(user: User) {
        this.users.set(user.userId, user);
        this.userListDiv.appendChild(user.userElement);
    }

    removeUser(userId: string) {
        this.users.delete(userId);
        const userDiv = this.users.get(userId);
        this.userListDiv.removeChild(userDiv);
    }

    getUser(userId: string) {
        this.users.get(userId);
    }
}
