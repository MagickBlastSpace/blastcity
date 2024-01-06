import { _decorator, Component, Node } from 'cc';
import { BoxPurple } from '../lvl_71/BoxPurple';
const { ccclass, property } = _decorator;

@ccclass('VasePurple')
export class VasePurple extends BoxPurple {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


