import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIFrameBase } from '../../UIFrameBase';
import { SpecialEventBase } from '../../../game/events/special/SpecialEventBase';
import { UIEventHiddenTempleItem } from './UIEventHiddenTempleItem';
import { UIEventHiddenTempleTile } from './UIEventHiddenTempleTile';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventLiveopsCardAdaptivity } from '../UIEventLiveopsCardAdaptivity';
const { ccclass, property } = _decorator;


@ccclass('UIHiddenTempleEventData')
export class UIHiddenTempleEventData {
    @property(Node)
    minigameContainer: Node = null;

    @property([UIEventHiddenTempleItem])
    items: UIEventHiddenTempleItem[] = [];

    @property([UIEventHiddenTempleTile])
    tiles: UIEventHiddenTempleTile[] = [];
}


@ccclass('UIEventHiddenTemple')
export class UIEventHiddenTemple extends UIEventPopupFrameBase {
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

    @property([UIHiddenTempleEventData])
    data: UIHiddenTempleEventData[] = [];

    private isEventStarted = false;
    private isEventComplete = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.refresh();

        for(let i = 0; i < this.data.length; i++) {
            for(let j = 0; j < this.data[i].tiles.length; j++) {
                let tileId = (j + 1).toString();
                this.data[i].tiles[j].init(tileId);
                this.data[i].tiles[j].node.on("move", (prediction) => this.makeMove(prediction));
            }
        }
    }

    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }

        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        if(!this.isInited) {
            return;
        }

        this.eventController.refresh();

        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        let stage = this.eventController.getCurrentStage();

        for(let i = 0; i < this.data.length; i++) {
            this.data[i].minigameContainer.active = false;
        }

        if(this.isEventStarted && !this.isEventComplete) {
            let curLvl = stage + 1;
            this.progressLabel.string = "Level " + curLvl + "/" + this.eventController.getTotalLevels();
            this.collectablesCount.string = this.eventController.getCollectable();

            if(stage < this.data.length) {
                this.data[stage].minigameContainer.active = true;
            }
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

        let predictions = this.eventController.getSpecialPredictions();

        if(stage < this.data.length) {
            for(let i = 0; i < this.data[stage].tiles.length; i++) {
                this.data[stage].tiles[i].refresh(predictions);
            }
        
            for(let i = 0; i < this.data[stage].items.length; i++) {
                this.data[stage].items[i].refresh(predictions);
            }
        }

        this.node.getComponent(UIEventLiveopsCardAdaptivity)?.refresh();
    }


    show() {
        super.show();

        this.refresh();
    }


    onStartBtnClick() {
        if(!this.isInited) {
            return;
        }

        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }


    makeMove(prediction: string) {
        if(!this.isInited) {
            return;
        }
        
        this.eventController.makeMove(prediction);
    }
}


