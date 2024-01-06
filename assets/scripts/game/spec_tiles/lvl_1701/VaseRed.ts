import { _decorator, Component, Node } from 'cc';
import { BoxRed } from '../lvl_71/BoxRed';
const { ccclass, property } = _decorator;

@ccclass('VaseRed')
export class VaseRed extends BoxRed {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


