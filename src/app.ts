import BaseLayer from "./components/Layer";
import ToolManager from "./tools/toolManager";

export default class App {
    baseLayer: BaseLayer;
    toolManager: ToolManager;
    connection: WebSocket;
    
    constructor(connectionUrl: string) {
        this.connection = new WebSocket(connectionUrl);
        this.baseLayer = new BaseLayer();
        this.toolManager = new ToolManager(this.baseLayer);
    }

    init() {
        console.log("app started");
        this.toolManager.init();
    }

    onClose() {
        this.connection.onmessage = (ev: MessageEvent<string>) => {
            ev.data
        }
    }
}
