import State from "../actions/state";
import BaseLayer from "../components/Layer";
import ToolManager from "../tools/toolManager";
import { Connection } from "./network";
import User from "./user";

export default class InternalUser extends User {
    baseLayer: BaseLayer;
    toolManager?: ToolManager;

    constructor(userId: string, userName: string, state: State, baseLayer: BaseLayer) {
        super(userId, userName, state, true);
        this.state = state;
        this.baseLayer = baseLayer;
    }

    init(connection: Connection) {
        this.toolManager = new ToolManager(this.baseLayer, connection, this.state);
        this.toolManager.init();
    }
}
