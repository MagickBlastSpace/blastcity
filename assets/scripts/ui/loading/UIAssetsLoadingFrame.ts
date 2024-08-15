import { _decorator, Component, Node, SpriteFrame, Sprite } from 'cc';
import { AssetsLoader } from '../../utils/AssetsLoader';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIAssetsLoadingFrame')
export class UIAssetsLoadingFrame extends UIFrameBase {

    @property([SpriteFrame])
    screens: SpriteFrame[] = [];

    @property(Sprite)
    screen: Sprite = null;


    start() {}

    show() {
        super.show();

        this.setRandomLoadingScreen();
    }


    setRandomLoadingScreen() {
        if (this.screens.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.screens.length);
    
            this.screen.spriteFrame = this.screens[randomIndex];
        } else {
            console.log("Screens array is empty. Cannot set random loading screen.");
        }
    }
}


