import State from "./actions/state";
import BaseLayer from "./components/Layer";
import { Connection } from "./modules/network";
import UserManager from "./modules/userManager";
import ToolManager from "./tools/toolManager";

export default class App {
    baseLayer: BaseLayer;
    toolManager: ToolManager;
    userManager: UserManager;
    connection: Connection;
    state: State;
    
    constructor(connectionUrl: string) {
        this.baseLayer = new BaseLayer();
        this.state = new State(this.baseLayer);
        this.userManager = new UserManager(this.baseLayer.ctx);
        this.connection = new Connection(connectionUrl, this.userManager);
        this.toolManager = new ToolManager(this.baseLayer, this.connection, this.state);
    }

    init() {
        console.log("app started");
        this.toolManager.init();
    }
}
