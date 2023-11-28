import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Box')
export class Box extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = false;
        this.isEmpty = false;
        this.isShifts = false;
        this.isSpecial = true;

        this.strength = 1;
        this.strengthType = "any";
    }


    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if((this.strengthType === "any" || this.strengthType === damageType) && !this.isDamaged) {
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
}


