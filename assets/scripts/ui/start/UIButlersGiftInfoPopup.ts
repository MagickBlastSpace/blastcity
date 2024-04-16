import { _decorator, Component, Node, Button } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIButlersGiftInfoPopup')
export class UIButlersGiftInfoPopup extends UIPopupFrameBase {

    @property(Button)
    playBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;


    start() {
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.hide, this);
    }

    onPlayBtnClick() {
        this.hide();

        this.node.emit("play");
    }
}


