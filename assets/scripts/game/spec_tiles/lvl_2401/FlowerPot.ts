import { _decorator, Component, Node } from 'cc';
import { Soap } from '../lvl_651/Soap';
const { ccclass, property } = _decorator;

@ccclass('FlowerPot')
export class FlowerPot extends Soap {
    startDestroyConsequences() {
        this.node.emit("status_static", this.row, this.col, "bushes");
        this.node.emit("status_static", this.row + 1, this.col, "bushes");
        this.node.emit("status_static", this.row, this.col + 1, "bushes");
        this.node.emit("status_static", this.row - 1, this.col, "bushes");
        this.node.emit("status_static", this.row, this.col - 1, "bushes");
        this.node.emit("status_static", this.row + 1, this.col + 1, "bushes");
        this.node.emit("status_static", this.row + 1, this.col - 1, "bushes");
        this.node.emit("status_static", this.row - 1, this.col + 1, "bushes");
        this.node.emit("status_static", this.row - 1, this.col - 1, "bushes");

        this.node.emit("goal", "flower_pot");
    }
}


