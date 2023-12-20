import { _decorator, Component, Node } from 'cc';
import { Bushes } from './Bushes';
const { ccclass, property } = _decorator;

@ccclass('BlossomBushes')
export class BlossomBushes extends Bushes {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "bushes");
    }
}


