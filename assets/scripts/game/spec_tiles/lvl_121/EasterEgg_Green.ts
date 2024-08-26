import { _decorator, Component, Node } from 'cc';
import { StickerGreen } from '../lvl_41/StickerGreen';
const { ccclass, property } = _decorator;

@ccclass('EasterEgg_Green')
export class EasterEgg_Green extends StickerGreen {
    startDestroyConsequences() {
        this.playAnimation("egg4", false, 1);

        this.node.emit("goal", "easteregg");
    }
}


