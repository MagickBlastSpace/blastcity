import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIFrameBase } from '../../UIFrameBase';
import { SpecialEventBase } from '../../../game/events/special/SpecialEventBase';
import { UIEventMagicCauldronItem } from './UIEventMagicCauldronItem';
import { UIEventMagicCauldronPredictionButton } from './UIEventMagicCauldronPredictionButton';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldron')
export class UIEventMagicCauldron extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    @property(Label)
    progressLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    collectablesCount: Label = null;

    @property(Node)
    minigameContainer: Node = null;

    @property([UIEventMagicCauldronItem])
    items: UIEventMagicCauldronItem[] = [];
    @property([UIEventMagicCauldronItem])
    hints: UIEventMagicCauldronItem[] = [];
    @property([UIEventMagicCauldronPredictionButton])
    predictionBtns: UIEventMagicCauldronPredictionButton[] = [];

    private isEventStarted = false;
    private isEventComplete = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.eventController.node.on("refresh", () => this.refresh());

        this.refresh();

        for(let i = 0; i < this.predictionBtns.length; i++) {
            this.predictionBtns[i].node.on("move", (color) => this.makeMove(color));
        }
    }

    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }
        
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.eventController.refresh();

        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        this.minigameContainer.active = this.isEventStarted && !this.isEventComplete;

        if(this.isEventStarted && !this.isEventComplete) {
            let curLvl = this.eventController.getCurrentStage() + 1;
            this.progressLabel.string = "Level " + curLvl + "/" + this.eventController.getTotalLevels();
            this.collectablesCount.string = this.eventController.getCollectable();
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

        let predictions = this.eventController.getPredictions();
        let pool = this.eventController.getCurrentPool();
        let hints = this.eventController.getSpecialHints();

        let poolSize = pool.length;

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = i < poolSize;

            let color = i < predictions.length ? predictions[i] : "none";
            this.items[i].refresh(color);
        }

        for(let i = 0; i < this.hints.length; i++) {
            this.hints[i].node.active = i < poolSize;

            let color = i < hints.length ? hints[i] : "undefined";
            this.hints[i].refresh(color);
        }

        for(let i = 0; i < this.predictionBtns.length; i++) {
            this.predictionBtns[i].node.active = i < poolSize;

            let color = i < pool.length ? pool[i] : "undefined";
            this.predictionBtns[i].refresh(color, predictions);
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


    makeMove(color: string) {
        this.eventController.makeMove(color);
    }
}


