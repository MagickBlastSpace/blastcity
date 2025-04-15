import { _decorator, Component, Node } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { Level } from '../../game/Level';
const { ccclass, property } = _decorator;

@ccclass('UILevelFailedPopup')
export class UILevelFailedPopup extends UIPopupFrameBase {

    @property(Level)
    level: Level;


    show() {
        super.show();

        this.scheduleOnce(() => {
            this.level.castFailEvent();

            this.hide();
        }, 1.5);
    }
}


