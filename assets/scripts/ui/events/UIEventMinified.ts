import { _decorator, Component, Node, Button } from 'cc';
import { EventBase } from '../../game/events/EventBase';
import { UIEventMinifiedPlayerItem } from './UIEventMinifiedPlayerItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventMinified')
export class UIEventMinified extends Component {

    @property(EventBase)
    eventController: EventBase = null;

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    takeRewardBtn: Button = null;

    @property(Node)
    playersContainer: Node = null;
    @property(Node)
    startContainer: Node = null;
    @property(Node)
    rewardContainer: Node = null;

    @property([UIEventMinifiedPlayerItem])
    items: UIEventMinifiedPlayerItem[] = [];


    start() {
        this.eventController.node.on("refresh", () => this.refresh());

        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);
    }

    update(deltaTime: number) {
        this.node.active = this.eventController.isEventAvailable() && this.eventController.canParticipate();
    }

    
    refresh() {
        let isEventStarted = this.eventController.getIsStarted();
        let isEventComplete = this.eventController.getIsComplete();
        let isRewardAvailable = this.eventController.isRewardAvailable();

        this.playersContainer.active = isEventStarted && !isEventComplete;
        this.startContainer.active = !isEventStarted && !isEventComplete;
        this.rewardContainer.active = isRewardAvailable;

        let data = this.eventController.sortPlayersByProgress();

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].init(i);
            if(i >= data.length) {
                this.items[i].node.active = false;
            }
            else {
                this.items[i].node.active = true;
                this.items[i].refresh(data[i]);
            }
        }
    }


    updateData() {
        this.eventController.updateMultiplayerData();
    }


    onStartBtnClick() {
        this.eventController.activateEvent();

        this.refresh();
    }

    onTakeRewardBtnClick() {
        this.eventController.takeReward();

        this.updateData();
    }
}


