import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('MagicHat')
export class MagicHat extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = false;
        this.isEmpty = false;
        this.isShifts = false;
        this.isSpecial = true;
        this.isGrouped = true;

        this.strength = 1;
        this.strengthType = "any";
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }
        this.setAsDamaged();
        console.log("Magic Hat Group Damaged!");
    }
}


