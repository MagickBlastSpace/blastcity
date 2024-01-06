import { _decorator, Component, Node } from 'cc';
import { BoxYellow } from '../lvl_71/BoxYellow';
const { ccclass, property } = _decorator;

@ccclass('VaseYellow')
export class VaseYellow extends BoxYellow {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "money_bag");
    }
}


