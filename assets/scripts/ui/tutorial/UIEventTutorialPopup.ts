import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventTutorialPopup')
export class UIEventTutorialPopup extends UIPopupFrameBase {

    @property(Button)
    btnClose: Button = null;


    start() {
        this.btnClose.node.on(Button.EventType.CLICK, this.onBtnCloseClick, this);
    }

    onBtnCloseClick() {
        this.hide();
    }
}


