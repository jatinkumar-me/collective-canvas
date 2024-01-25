import BaseLayer from "./components/Layer";
import Pencil from "./tools/pencil";
import Tools from "./tools/tools";

export default class App {
    baseLayer: BaseLayer;
    connection: WebSocket;
    tool: Tools;
    
    constructor(connectionUrl: string) {
        this.connection = new WebSocket(connectionUrl);
        this.baseLayer = new BaseLayer();
        this.tool = new Pencil(this.baseLayer);
    }

    init() {
        console.log("app started");
    }

    onClose() {
        this.connection.onmessage = (ev: MessageEvent<string>) => {
            ev.data
        }
    }
}
