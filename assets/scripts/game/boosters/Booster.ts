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

    private count: number = 0;


    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    start() {
        this.updateCount();

        UserData.instance.node.on("resources_update", (gold) => this.updateCount());
    }

    onClick(event: cc.Event.EventTouch): void {
        if(this.count <= 0 && !UserData.instance.isDevMode()) {
            return;
        }

        this.node.emit("activate");
    }


    setActiveState(isActive: boolean) {
        this.activeState.active = isActive;
    }


    updateCount() {
        this.count = UserData.instance.getResource(this.boosterName);
        this.countLabel.string = this.count;
    }
}


