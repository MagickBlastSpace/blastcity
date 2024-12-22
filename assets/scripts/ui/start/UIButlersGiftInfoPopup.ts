import { _decorator, Component, Node, Button, assetManager, Sprite, SpriteFrame } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIButlersGiftInfoPopup')
export class UIButlersGiftInfoPopup extends UIPopupFrameBase {

    @property(Button)
    playBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    @property(Sprite)
    picture: Sprite = null;


    start() {
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.hide, this);

        this.loadAsstets();
    }

    onPlayBtnClick() {
        this.hide();

        this.node.emit("play");
    }


    loadAsstets() {
        assetManager.loadBundle("start", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: start`, err);
                return;
            }

            console.log(`Successfully loaded bundle: start"`);


            bundle.load("athena_gift_info/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: athena_gift_info`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: athena_gift_info`);

                this.picture.spriteFrame = spriteFrame;
            });
        });
    }
}


