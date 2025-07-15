import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UICollectionDuplicateExchange')
export class UICollectionDuplicateExchange extends UIPopupFrameBase {

    @property([Button])
    exchangeBtns: Button[] = [];

    @property(Button)
    closeBtn: Button = null;

    @property(Label)
    stars: Label = null;


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        for(let i = 0; i < this.exchangeBtns.length; i++) {
            this.exchangeBtns[i].node.on(Button.EventType.CLICK, () => this.onExchangeBtnClick(i), this);
        }
    }

    init(stars: number) {
        this.stars.string = stars;
    }

    onCloseBtnClick() {
        this.hide();
    }

    onExchangeBtnClick(index: number) {
        this.node.emit("exchange", index);
    }


    show() {
        super.show();
    }

    hide() {
        super.hide();
    }
}


