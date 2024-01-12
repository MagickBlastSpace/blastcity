import { _decorator, Component, Node } from 'cc';
import { StickerGreen } from '../lvl_41/StickerGreen';
const { ccclass, property } = _decorator;

@ccclass('VaseGreen')
export class VaseGreen extends StickerGreen {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


