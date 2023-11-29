import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('MagicHat')
export class MagicHat extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isSpecial = true;
        this.isGrouped = true;
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }
        this.setAsDamaged();
        console.log("Magic Hat Group Damaged!");
    }
}


