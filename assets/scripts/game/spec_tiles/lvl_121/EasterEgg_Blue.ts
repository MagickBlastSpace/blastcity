import { _decorator, Component, Node } from 'cc';
import { StickerBlue } from '../lvl_41/StickerBlue';
const { ccclass, property } = _decorator;

@ccclass('EasterEgg_Blue')
export class EasterEgg_Blue extends StickerBlue {
    startDestroyConsequences() {
        this.playAnimation("egg3", false, 1);

        this.node.emit("goal", "easteregg");
    }
}


