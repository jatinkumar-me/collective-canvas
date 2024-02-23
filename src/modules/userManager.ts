import User, { ExternalUser, UserId } from "./user";

export default class UserManager {
    users: Map<UserId, User>;
    private currentUser: User;
    userListDiv: HTMLDivElement;

    constructor() {
        this.users = new Map<UserId, ExternalUser>();
        this.currentUser = new User("unassigned-user-id", "unassigned-username")
        const userListDiv = document.getElementById('user-list-div');
        if (!userListDiv) {
            throw new Error('user list div not present');
        }
        this.userListDiv = userListDiv as HTMLDivElement;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    setCurrentUser(userId: UserId, userName: string) {
        this.currentUser = new User(userId, userName);
        this.userListDiv.appendChild(this.currentUser.userElement);
    }

    addUser(user: User) {
        this.users.set(user.userId, user);
        this.userListDiv.appendChild(user.userElement);
    }

    addMany(users: User[]) {
        users.forEach(user => this.addUser(user));
    }

    removeUser(userId: string) {
        this.users.delete(userId);
        const user = this.users.get(userId);
        if (!user) {
            console.warn("Attempting to remove non existent user");
            return;
        }
        this.userListDiv.removeChild(user.userElement);
    }

    getUser(userId: string) {
        this.users.get(userId);
    }
}
