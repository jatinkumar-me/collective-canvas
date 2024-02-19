export type UserId = string;

export default class User {
    userId: UserId;
    userName: string;
    userElement: HTMLDivElement;

    constructor(userId: string, userName: string) {
        this.userId = userId;
        this.userName = userName;
        this.userElement = this.createUserDiv();
    }

    private createUserDiv(): HTMLDivElement {
        const userDiv = document.createElement('div');
        userDiv.classList.add('user-div');
        userDiv.innerHTML = `<strong>${this.userName}</strong>`;
        return userDiv;
    }
}
