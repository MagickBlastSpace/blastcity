import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { LavaAdventureEvent } from '../../game/events/LavaAdventureEvent';
const { ccclass, property } = _decorator;

@ccclass('UIEventLavaAdventure')
export class UIEventLavaAdventure extends UIFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    @property(LavaAdventureEvent)
    eventController: LavaAdventureEvent = null;

    @property(Label)
    progressLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    cooldownTimeLabel: Label = null;

    private isEventStarted = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }

    update(deltaTime: number) {
        this.timeLabel.string = this.eventController.getRemainingTimeString();

        this.cooldownTimeLabel.string = this.eventController.getRemainingCooldownString();
    }


    refresh() {
        this.eventController.refresh();

        this.isEventStarted = this.eventController.getIsStarted();

        if(this.isEventStarted) {
            this.progressLabel.string = "Level " + this.eventController.getCurrentStage() + "/" + this.eventController.getTotalSteps();
        }
        else if(!this.eventController.isRequiredLevelReached()) {
            this.progressLabel.string = "Required Level " + this.eventController.getLevelRequired();
        }
        else {
            this.progressLabel.string = "Not Started";
        }
        
        this.startBtn.node.active = this.eventController.canParticipate() && !this.isEventStarted;
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


