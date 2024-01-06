import { _decorator, Component, Node } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('Firebox')
export class Firebox extends Sticker {
    startDestroyConsequences() {
        this.node.emit("change", this.row, this.col, "firerockets");
    }
}


