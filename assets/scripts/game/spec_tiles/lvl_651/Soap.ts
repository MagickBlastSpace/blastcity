import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Soap')
export class Soap extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;
    }

    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
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

        this.node.emit("goal", "soap");
    }
}


