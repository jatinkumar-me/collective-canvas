import BaseLayer from "./components/Layer";
import { Connection } from "./modules/network";
import ToolManager from "./tools/toolManager";

export default class App {
    baseLayer: BaseLayer;
    toolManager: ToolManager;
    connection: Connection;
    
    constructor(connectionUrl: string) {
        this.connection = new Connection(connectionUrl);
        this.baseLayer = new BaseLayer();
        this.toolManager = new ToolManager(this.baseLayer, this.connection);
    }

    init() {
        console.log("app started");
        this.toolManager.init();
    }
}
