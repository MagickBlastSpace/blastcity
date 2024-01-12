import { _decorator, Component, Node } from 'cc';
import { StickerPurple } from '../lvl_41/StickerPurple';
const { ccclass, property } = _decorator;

@ccclass('VasePurple')
export class VasePurple extends StickerPurple {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


