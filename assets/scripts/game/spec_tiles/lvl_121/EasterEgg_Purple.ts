import { _decorator, Component, Node } from 'cc';
import { StickerPurple } from '../lvl_41/StickerPurple';
const { ccclass, property } = _decorator;

@ccclass('EasterEgg_Purple')
export class EasterEgg_Purple extends StickerPurple {
    startDestroyConsequences() {
        this.node.emit("goal", "easteregg");
    }
}


