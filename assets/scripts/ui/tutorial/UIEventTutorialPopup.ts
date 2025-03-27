import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventTutorialPopup')
export class UIEventTutorialPopup extends UIPopupFrameBase {

    @property(Button)
    btnClose: Button = null;

    @property(Button)
    btnPlay: Button = null;


    start() {
        this.btnClose.node.on(Button.EventType.CLICK, this.onBtnCloseClick, this);

        if(this.btnPlay) {
            this.btnPlay.node.on(Button.EventType.CLICK, this.onBtnPlayClick, this);
        }
    }

    onBtnCloseClick() {
        this.hide();
    }

    onBtnPlayClick() {
        this.node.emit("event_play");

        this.onBtnCloseClick();
    }
}


