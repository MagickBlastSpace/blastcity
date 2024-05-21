import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { Field } from '../../game/Field';
import { TestBot } from '../../utils/TestBot';
const { ccclass, property } = _decorator;

@ccclass('UILevelCompletePopup')
export class UILevelCompletePopup extends UIPopupFrameBase {

    @property(Button)
    skipBtn: Button = null;

    @property(Field)
    field: Field = null;

    @property(TestBot)
    testBot: TestBot = null;

    private isSkipped: boolean = false;


    start() {
        this.skipBtn.node.on(Button.EventType.CLICK, this.onSkipBtnClick, this);
    }

    show() {
        super.show();

        this.isSkipped = false;

        if(this.testBot.isActive()) {
            this.field.completeLevel_Skip();

            this.hide();

            return;
        }

        this.scheduleOnce(() => {
            if(!this.isSkipped) {
                this.field.completeLevel();

                this.hide();
            }
        }, 1.5);
    }

    hide() {
        super.hide();

        this.unscheduleAllCallbacks();
    }

    onSkipBtnClick() {
        this.isSkipped = true;

        this.field.completeLevel_Skip();

        this.hide();
    }
}


