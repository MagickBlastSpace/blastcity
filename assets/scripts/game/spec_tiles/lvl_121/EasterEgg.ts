import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('EasterEgg')
export class EasterEgg extends SpecTileBase {

    private changeColor: string = "";


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
        this.node.emit("goal", "easter_egg");

        if(this.changeColor === "") {
            return;
        }
        this.node.emit("change", this.row, this.col, "easteregg_" + this.changeColor);
    }
}


