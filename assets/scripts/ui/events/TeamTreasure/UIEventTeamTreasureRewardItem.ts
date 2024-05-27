import { _decorator, Component, Node, Label, Button } from 'cc';
import { EventRewardData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIEventTeamTreasureRewardItem')
export class UIEventTeamTreasureRewardItem extends Component {

    @property(Button)
    takeRewardBtn: Button = null;

    @property(Label)
    progressLabel: Label = null;

    @property(Node)
    reward: Node = null;
    @property(Node)
    done: Node = null;


    start() {
        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);
    }

    refresh(data: EventRewardData, isPicked: boolean, progress: number) {
        this.done.active = isPicked;
        this.reward.active = progress >= data.progress && !isPicked;

        this.progressLabel.string = progress + "/" + data.progress;
    }


    onTakeRewardBtnClick() {
        this.node.emit("pick", this.index);
    }
}


