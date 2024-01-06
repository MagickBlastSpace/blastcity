import { _decorator, Component, Node } from 'cc';
import { BoxGreen } from '../lvl_71/BoxGreen';
const { ccclass, property } = _decorator;

@ccclass('VaseGreen')
export class VaseGreen extends BoxGreen {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


