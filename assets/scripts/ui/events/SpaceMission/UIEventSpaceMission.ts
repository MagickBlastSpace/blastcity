import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIFrameBase } from '../../UIFrameBase';
import { UIEventSpaceMissionPlayerItem } from './UIEventSpaceMissionPlayerItem';
import { SpaceMissionEvent } from '../../../game/events/competitive/SpaceMissionEvent';
const { ccclass, property } = _decorator;

@ccclass('UIEventSpaceMission')
export class UIEventSpaceMission extends UIFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    @property(SpaceMissionEvent)
    eventController: SpaceMissionEvent = null;

    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    levelRequired: Label = null;
    @property(Label)
    missionLabel: Label = null;

    @property(Node)
    playersLayout: Node = null;

    @property([UIEventSpaceMissionPlayerItem])
    items: UIEventSpaceMissionPlayerItem[] = [];

    private isEventStarted = false;
    private isEventComplete = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }

    update(deltaTime: number) {
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        this.playersLayout.active = this.isEventStarted && !this.isEventComplete;
   
        this.startBtn.node.active = !this.isEventStarted && !this.isEventComplete;

        let data = this.eventController.sortPlayersByProgress();
        let playersCount = this.eventController.getPlayersCount();

        for(let i = 0; i < this.items.length; i++) {
            if(i < playersCount) {
                this.items[i].node.active = true;
                this.items[i].refresh(data[i], this.eventController.getTotalStepsOnCurrentLevel());
            }
            else {
                this.items[i].node.active = false;
            }
        }

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : "Required Level " + this.eventController.getLevelRequired();
        let missionNumber = this.eventController.getCurrentLevel() + 1;
        this.missionLabel.string = "Misson " + missionNumber;
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
}


