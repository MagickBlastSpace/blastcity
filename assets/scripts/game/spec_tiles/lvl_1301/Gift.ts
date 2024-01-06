import { _decorator, Component, Node } from 'cc';
import { HoneyJar } from '../lvl_361/HoneyJar';
const { ccclass, property } = _decorator;

@ccclass('Gift')
export class Gift extends HoneyJar {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
    }

    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(!this.isDamaged) {
            this.changeColor = damageType;
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
        this.node.emit("change", this.row, this.col, "gift_open");
    }
}


