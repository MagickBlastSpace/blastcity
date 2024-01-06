import { _decorator, Component, Node } from 'cc';
import { BoxBlue } from '../lvl_71/BoxBlue';
const { ccclass, property } = _decorator;

@ccclass('VaseBlue')
export class VaseBlue extends BoxBlue {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


