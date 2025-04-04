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

    @property(Node)
    infoReward: Node = null;

    @property(Button)
    infoRewardBtn: Button = null;
    @property(Button)
    closeInfoRewardBtn: Button = null;


    start() {
        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);

        if(this.infoRewardBtn && this.infoRewardBtn !== undefined) {
            this.infoRewardBtn.node.on(Button.EventType.CLICK, this.onInfoRewardClick, this);
        }

        if(this.closeInfoRewardBtn && this.closeInfoRewardBtn !== undefined) {
            this.closeInfoRewardBtn.node.on(Button.EventType.CLICK, this.onCloseInfoRewardClick, this);
        }
    }

    refresh(data: EventRewardData, isPicked: boolean, progress: number) {
        this.done.active = isPicked;
        this.reward.active = progress >= data.progress && !isPicked;

        if(progress >= data.progress) {
            progress = data.progress;
        }
        
        this.progressLabel.string = progress + "/" + data.progress;
    }


    onTakeRewardBtnClick() {
        this.node.emit("pick", this.index);
    }


    onInfoRewardClick() {
        this.infoReward.active = true;
    }

    onCloseInfoRewardClick() {
        this.infoReward.active = false;
    }
}


