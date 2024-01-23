import BaseLayer from "./components/Layer";
import Pencil from "./tools/pencil";
import Tools from "./tools/tools";

export default class App {
    baseLayer: BaseLayer;
    tool: Tools;
    
    constructor() {
        this.baseLayer = new BaseLayer();
        this.tool = new Pencil(this.baseLayer);
    }

    init() {
        console.log("app started");
    }
}
