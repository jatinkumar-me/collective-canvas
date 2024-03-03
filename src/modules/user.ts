import State from "../actions/state";

export type UserId = string;

export default class User {
    userId: UserId;
    userName: string;
    userElement: HTMLDivElement;
    isInternal: boolean;
    state: State;

    constructor(userId: string, userName: string, state: State, isInternal?: boolean) {
        this.userId = userId;
        this.userName = userName;
        this.state = state;
        this.isInternal = isInternal ?? false;
        this.userElement = this.createUserDiv();
    }

    private createUserDiv(): HTMLDivElement {
        const userDiv = document.createElement("div");
        userDiv.classList.add("user-div");
        userDiv.innerHTML = `<strong>${this.userName}</strong>`;
        if (this.isInternal) {
            userDiv.classList.add("internal");
            userDiv.innerHTML = userDiv.innerHTML + '<span>(You)</span>'
        }
        return userDiv;
    }

    setUser(userId: UserId, userName: string): void {
        this.userId = userId;
        this.userName = userName;
        this.userElement = this.createUserDiv();
    }
}
