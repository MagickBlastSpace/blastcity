import { _decorator, Component, Node } from 'cc';
import { StickerYellow } from '../lvl_41/StickerYellow';
const { ccclass, property } = _decorator;

@ccclass('VaseYellow')
export class VaseYellow extends StickerYellow {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


