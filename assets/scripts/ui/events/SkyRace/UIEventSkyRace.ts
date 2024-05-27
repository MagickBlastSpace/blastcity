import { _decorator, Component, Node, Button, Label } from 'cc';
import { SkyRaceEvent } from '../../../game/events/competitive/SkyRaceEvent';
import { UIEventSkyRacePlayerItem } from './UIEventSkyRacePlayerItem';
import { UIFrameBase } from '../../UIFrameBase';
import { EventBase } from '../../../game/events/EventBase';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventSkyRace')
export class UIEventSkyRace extends UIPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    takeRewardBtn: Button = null;

    @property(EventBase)
    eventController: EventBase = null;

    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    levelRequired: Label = null;

    @property(Node)
    playersLayout: Node = null;
    @property(Node)
    rewardLayout: Node = null;

    @property([UIEventSkyRacePlayerItem])
    items: UIEventSkyRacePlayerItem[] = [];

    private isEventStarted = false;
    private isEventComplete = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);
    }

    update(deltaTime: number) {
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        this.playersLayout.active = this.isEventStarted && !this.isEventComplete;
        this.rewardLayout.active = this.isEventComplete;
   
        this.startBtn.node.active = !this.isEventStarted && !this.isEventComplete;

        let data = this.eventController.sortPlayersByProgress();

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(data[i]);
        }

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : "Required Level " + this.eventController.getLevelRequired();
    }


    show() {
        super.show();

        this.refresh();
    }


    onStartBtnClick() {
        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }

    onTakeRewardBtnClick() {
        this.eventController.takeReward();

        this.refresh();
    }
}


