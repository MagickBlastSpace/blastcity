import { _decorator, Component, Node } from 'cc';
import { StickerBlue } from '../lvl_41/StickerBlue';
const { ccclass, property } = _decorator;

@ccclass('VaseBlue')
export class VaseBlue extends StickerBlue {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


