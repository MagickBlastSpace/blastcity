import { _decorator, Component, Node, Label } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Lamp')
export class Lamp extends SpecTileBase {

    @property(Label)
    hpLabel: Label = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.isSpecial = true;

        this.strength = 2;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }

        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    refresh() {
        this.hpLabel.string = this.strength;
    }
}


