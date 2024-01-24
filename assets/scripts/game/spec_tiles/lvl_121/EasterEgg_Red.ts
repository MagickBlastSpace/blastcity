import { _decorator, Component, Node } from 'cc';
import { StickerRed } from '../lvl_41/StickerRed';
const { ccclass, property } = _decorator;

@ccclass('EasterEgg_Red')
export class EasterEgg_Red extends StickerRed {
    startDestroyConsequences() {
        this.node.emit("goal", "easteregg");
    }
}


