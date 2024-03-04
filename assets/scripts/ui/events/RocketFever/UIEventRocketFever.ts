import { _decorator, Component, Node, Button, Label, ProgressBar, tween, instantiate, Prefab } from 'cc';
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

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

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

        this.progressBar.node.active = this.isEventStarted && !this.isEventComplete;

        if(this.isEventStarted && !this.isEventComplete) {
            this.progressLabel.string = this.eventController.getCollectable() + "/" + this.eventController.getCurrentStageStep();

            tween(this.progressBar)
                .to(0.8, { progress: this.eventController.getCollectable() / this.eventController.getCurrentStageStep() })
                .start();
        }
        else if(this.isEventComplete) {
            this.progressLabel.string = "Event Complete";
        }
        else if(!this.eventController.isRequiredLevelReached()) {
            this.progressLabel.string = "Required Level " + this.eventController.getLevelRequired();
        }
        else {
            this.progressLabel.string = "Not Started";
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


