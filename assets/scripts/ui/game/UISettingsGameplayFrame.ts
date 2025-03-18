import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { AudioController } from '../../utils/AudioController';
import { UILevelResultFrame } from '../level/UILevelResultFrame';
const { ccclass, property } = _decorator;

@ccclass('UISettingsGameplayFrame')
export class UISettingsGameplayFrame extends UIPopupFrameBase {

    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    closeBtn_Duplicate: Button = null;

    @property(Button)
    musicBtn: Button = null;
    @property(Button)
    sfxBtn: Button = null;
    @property(Button)
    exitBtn: Button = null;

    @property(Node)
    musicOff: Node = null;
    @property(Node)
    sfxOff: Node = null;

    @property(UILevelResultFrame)
    levelResult: UILevelResultFrame = null;


    start() {
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.closeBtn_Duplicate.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.musicBtn.node.on(Button.EventType.CLICK, this.onMusicBtnClick, this);
        this.sfxBtn.node.on(Button.EventType.CLICK, this.onSfxBtnClick, this);
        this.exitBtn.node.on(Button.EventType.CLICK, this.onExitBtnClick, this);
    }


    onCloseBtnClick() {
        this.hide();
    }

    onMusicBtnClick() {
        AudioController.instance.switchMusic();

        this.refresh();
    }

    onSfxBtnClick() {
        AudioController.instance.switchSfx();

        this.refresh();
    }

    onExitBtnClick() {
        this.levelResult.fail();

        this.hide();
    }

    show() {
        super.show();

        this.refresh();
    }


    refresh() {
        this.musicOff.active = !AudioController.instance.isMusicEnabled();
        this.sfxOff.active = !AudioController.instance.isSfxEnabled();
    }
}


