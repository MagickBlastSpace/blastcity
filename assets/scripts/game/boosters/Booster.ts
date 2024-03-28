import { _decorator, Component, Node, Label } from 'cc';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('Booster')
export class Booster extends Component {

    @property(Node)
    activeState: Node = null;

    @property(Label)
    countLabel: Label = null;

    @property
    boosterName: string = "";


    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    start() {
        this.updateCount();

        UserData.instance.node.on("resources_update", (gold) => this.updateCount());
    }

    onClick(event: cc.Event.EventTouch): void {
        this.node.emit("activate");
    }


    setActiveState(isActive: boolean) {
        this.activeState.active = isActive;
    }


    updateCount() {
        this.countLabel.string = UserData.instance.getResource(this.boosterName);
    }
}


