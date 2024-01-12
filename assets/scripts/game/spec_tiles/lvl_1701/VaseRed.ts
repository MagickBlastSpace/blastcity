import { _decorator, Component, Node } from 'cc';
import { StickerRed } from '../lvl_41/StickerRed';
const { ccclass, property } = _decorator;

@ccclass('VaseRed')
export class VaseRed extends StickerRed {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


