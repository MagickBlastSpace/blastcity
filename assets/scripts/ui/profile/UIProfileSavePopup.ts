import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIProfileSavePopup')
export class UIProfileSavePopup extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;

    @property(Button)
    yesBtn: Button = null;
    @property(Button)
    noBtn: Button = null;


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.yesBtn.node.on(Button.EventType.CLICK, this.onYesBtnClick, this);
        this.noBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }

    
    onCloseBtnClick() {
        this.hide();
    }

    onYesBtnClick() {
        this.node.emit("save");

        this.hide();
    }
}


