import { _decorator, Component, Node, Button, Label, ProgressBar, tween, instantiate, Prefab, Vec3 } from 'cc';
import { UIFrameBase } from '../../UIFrameBase';
import { RocketFeverEvent } from '../../../game/events/RocketFeverEvent';
import { UIEventRocketFeverItem } from './UIEventRocketFeverItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventRocketFever')
export class UIEventRocketFever extends UIFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    @property(RocketFeverEvent)
    eventController: RocketFeverEvent = null;

    @property(Label)
    progressLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    infoLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    @property(Node)
    rewardsContainer: Node = null;
    @property(Node)
    timerContainer: Node = null;
    @property(Node)
    progressContainer: Node = null;
    @property(Node)
    infoContainer: Node = null;

    @property(Vec3)
    positionTimer_Start: Vec3 = null;
    @property(Vec3)
    positionTimer_Active: Vec3 = null;

    @property(Vec3)
    positionProgress_Start: Vec3 = null;
    @property(Vec3)
    positionProgress_Active: Vec3 = null;

    private items: [UIEventRocketFeverItem] = [];

    private isEventStarted = false;
    private isEventComplete = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        let data = this.eventController.getData();

        for(let i = 0; i < data.length; i++) {
            const itemNode = instantiate(this.itemPrefab);
            this.itemsLayout.addChild(itemNode);
            const item = itemNode.getComponent('UIEventRocketFeverItem');

            this.items.push(item);
        }

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(i + 1, data[i], this.eventController.getCurrentStage());
        }
    }

    update(deltaTime: number) {
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.eventController.refresh();

        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        //this.progressBar.node.active = this.isEventStarted && !this.isEventComplete;

        if(this.isEventStarted && !this.isEventComplete) {
            this.infoContainer.active = false;
            this.rewardsContainer.active = true;

            this.progressLabel.string = this.eventController.getCollectable() + "/" + this.eventController.getCurrentStageStep();

            this.infoLabel.string = "";

            tween(this.progressBar)
                .to(0.8, { progress: this.eventController.getCollectable() / this.eventController.getCurrentStageStep() })
                .start();

            tween(this.timerContainer)
                .to(0.2, { position: this.positionTimer_Active })
                .start();

            tween(this.progressContainer)
                .to(0.2, { position: this.positionProgress_Active })
                .start();
        }
        else if(this.isEventComplete) {
            this.infoContainer.active = true;
            this.rewardsContainer.active = false;

            this.progressLabel.string = "0/0";

            this.infoLabel.string = "Event Complete";

            tween(this.progressBar)
                .to(0.8, { progress: 0 })
                .start();

            tween(this.timerContainer)
                .to(0.2, { position: this.positionTimer_Start })
                .start();

            tween(this.progressContainer)
                .to(0.2, { position: this.positionProgress_Start })
                .start();
        }
        else if(!this.eventController.isRequiredLevelReached()) {
            this.infoContainer.active = true;
            this.rewardsContainer.active = false;

            this.progressLabel.string = "0/0";

            this.infoLabel.string = "Required Level " + this.eventController.getLevelRequired();

            tween(this.progressBar)
                .to(0.8, { progress: 0 })
                .start();

            tween(this.timerContainer)
                .to(0.2, { position: this.positionTimer_Start })
                .start();

            tween(this.progressContainer)
                .to(0.2, { position: this.positionProgress_Start })
                .start();
        }
        else {
            this.infoContainer.active = true;
            this.rewardsContainer.active = false;

            this.progressLabel.string = "0/0";

            this.infoLabel.string = "Collect rockets to win rewards";

            tween(this.progressBar)
                .to(0.8, { progress: 0 })
                .start();
            
            tween(this.timerContainer)
                .to(0.2, { position: this.positionTimer_Start })
                .start();

            tween(this.progressContainer)
                .to(0.2, { position: this.positionProgress_Start })
                .start();
        }
        
        this.startBtn.node.active = !this.isEventStarted && !this.isEventComplete;

        let data = this.eventController.getData();

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(i + 1, data[i], this.eventController.getCurrentStage());
        }
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


