import { _decorator, Component, Node } from 'cc';
import { StickerYellow } from '../lvl_41/StickerYellow';
const { ccclass, property } = _decorator;

@ccclass('EasterEgg_Yellow')
export class EasterEgg_Yellow extends StickerYellow {
    startDestroyConsequences() {
        this.node.emit("goal", "easter_egg");
    }
}


