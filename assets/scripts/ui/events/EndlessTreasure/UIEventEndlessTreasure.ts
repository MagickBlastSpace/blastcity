import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventEndlessTreasureItem } from './UIEventEndlessTreasureItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventEndlessTreasure')
export class UIEventEndlessTreasure extends UIEventPopupFrameBase {

    @property([UIEventEndlessTreasureItem])
    items: UIEventEndlessTreasureItem[] = [];

    @property(Button)
    closeBtn: Button = null;

    @property(Label)
    timeLabel: Label = null;

    private isBuyStarted: boolean = false;


    start() {
        for(let i = 0; i < this.items.length; i++) {
            this.items[i].init(i);

            this.items[i].node.on("buy", () => this.buy());
        }

        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }


    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }
        
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    async buy() {
        if(this.isBuyStarted) {
            return;
        }

        this.isBuyStarted = true;

        await this.eventController.takeCurrentReward();

        this.isBuyStarted = false;
    }


    show() {
        super.show();

        this.refresh();
    }


    refresh() {
        let data = this.eventController.getCurrentPoolRewards();
        let step = this.eventController.getCurrentStepInStage();

        for(let i = 0; i < this.items.length && i < data.length; i++) {
            let isPayable = this.eventController.isPayableStep(i);
            this.items[i].refresh(data[i], step, isPayable);
        }
    }


    onCloseBtnClick() {
        this.hide();
    }
}


