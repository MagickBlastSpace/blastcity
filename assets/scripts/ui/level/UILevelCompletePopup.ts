import { _decorator, Button, sp, Sprite } from 'cc';
import { Field } from '../../game/Field';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { TestBot } from '../../utils/TestBot';
import { UIPopupFrameBase } from '../UIPopupFrameBase';

const { ccclass, property } = _decorator;

@ccclass('UILevelCompletePopup')
export class UILevelCompletePopup extends UIPopupFrameBase {

    @property(Button)
    skipBtn: Button = null;

    @property(Field)
    field: Field = null;

    @property(TestBot)
    testBot: TestBot = null;

    @property(sp.Skeleton)
    animationFireworks: sp.Skeleton = null;

    private isSkipped: boolean = false;
    private isConversionStarted: boolean = false;

    private blockClickSprite: Sprite | null = null;
    private blockClickSpriteWasEnabled: boolean = false;

    start() {
        this.skipBtn.node.on(
            Button.EventType.CLICK,
            this.onSkipBtnClick,
            this
        );
    }

    show() {
        const frame = this.node.getChildByName('Frame');

        if(frame?.isValid) {
            frame.active = true;
        }

        super.show();

        this.blockClickSprite = this.skipBtn.node.getComponent(Sprite);
        this.blockClickSpriteWasEnabled = this.blockClickSprite?.enabled ?? false;

        this.isSkipped = false;
        this.isConversionStarted = false;

        console.log('[WIN FLOW] Popup shown');

        if(this.testBot?.isActive()) {
            this.onSkipBtnClick();
            return;
        }

        const isPortrait =
            ResolutionManager.instance.isPortraitOrientation();

        const fireworksName = isPortrait
            ? 'vertical'
            : 'horizontal';

        if(this.animationFireworks?.skeletonData) {
            this.animationFireworks.setAnimation(
                0,
                fireworksName,
                false
            );
        }

        this.scheduleOnce(() => {
            if(this.isSkipped || !this.node.isValid) return;

            this.isConversionStarted = true;

            if(frame?.isValid) {
                frame.active = false;
            }

            if(this.blockClickSprite?.isValid) {
                this.blockClickSprite.enabled = false;
            }

            console.log('[WIN FLOW] Conversion started');

            this.node.emit('win_conversion_started');

            this.field.completeLevel();

        }, 1.5);

    }

    hide() {
        this.unscheduleAllCallbacks();

        this.isConversionStarted = false;

        if(this.blockClickSprite?.isValid) {
            this.blockClickSprite.enabled = this.blockClickSpriteWasEnabled;
        }

        super.hide();
    }

    onSkipBtnClick() {
        if(this.isSkipped) return;

        this.isSkipped = true;

        console.log('[WIN FLOW] Skip requested', {
            conversionStarted: this.isConversionStarted
        });

        this.unscheduleAllCallbacks();

        this.field.completeLevel_Skip();
    }
}
