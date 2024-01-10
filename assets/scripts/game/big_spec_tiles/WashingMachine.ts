import { _decorator, Component, Node } from 'cc';
import { Jars } from './Jars';
const { ccclass, property } = _decorator;

@ccclass('WashingMachine')
export class WashingMachine extends Jars {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 5;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }

        this.strength--;

        this.setAsDamaged();

        this.refresh();
    }

    startDestroyConsequences() {
        this.node.emit("status_static", this.row, this.col, "bubble");
        this.node.emit("status_static", this.row + 1, this.col, "bubble");
        this.node.emit("status_static", this.row, this.col + 1, "bubble");
        this.node.emit("status_static", this.row - 1, this.col, "bubble");
        this.node.emit("status_static", this.row, this.col - 1, "bubble");
        this.node.emit("status_static", this.row + 1, this.col + 1, "bubble");
        this.node.emit("status_static", this.row + 1, this.col - 1, "bubble");
        this.node.emit("status_static", this.row - 1, this.col + 1, "bubble");
        this.node.emit("status_static", this.row - 1, this.col - 1, "bubble");

        this.node.emit("status_static", this.row + 2, this.col, "bubble");
        this.node.emit("status_static", this.row + 2, this.col + 1, "bubble");
        this.node.emit("status_static", this.row + 2, this.col - 1, "bubble");
        this.node.emit("status_static", this.row + 2, this.col + 2, "bubble");
        this.node.emit("status_static", this.row, this.col + 2, "bubble");
        this.node.emit("status_static", this.row + 1, this.col + 2, "bubble");
        this.node.emit("status_static", this.row - 1, this.col + 2, "bubble");

        this.node.emit("goal", "washing_machine");
    }
}


