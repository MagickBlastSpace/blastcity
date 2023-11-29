import { _decorator, Component, Node } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('StickerRed')
export class StickerRed extends Sticker {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.isSpecial = true;

        this.strength = 1;
    }

    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(damageType === '1' && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }
}


