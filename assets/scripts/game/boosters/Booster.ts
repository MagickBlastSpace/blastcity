import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Booster')
export class Booster extends Component {

    @property(Node)
    activeState: Node = null;


    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    onClick(event: cc.Event.EventTouch): void {
        this.node.emit("activate");
    }


    setActiveState(isActive: boolean) {
        this.activeState.active = isActive;
    }
}


