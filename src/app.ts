import State from "./actions/state";
import BaseLayer from "./components/Layer";
import UserChat from "./modules/chat";
import InternalUser from "./modules/internalUser";
import { Connection } from "./modules/network";
import UserManager from "./modules/userManager";

export default class App {
    baseLayer: BaseLayer;
    userManager: UserManager;
    currentUser: InternalUser;
    connection: Connection;
    state: State;
    userChat: UserChat
    
    constructor(connectionUrl: string) {
        this.baseLayer = new BaseLayer();
        this.state = new State(this.baseLayer);
        this.currentUser = new InternalUser("unassigned-user-id", "unassigned-username", this.state, this.baseLayer);
        this.userManager = new UserManager(this.baseLayer, this.state, this.currentUser);
        this.userChat = new UserChat(this.userManager);
        this.connection = new Connection(connectionUrl, this.userManager, this.userChat);
    }

    init() {
        console.log("app started");
        this.currentUser.init(this.connection);
        this.userChat.init(this.connection);
    }
}
