import { _decorator, Component, Node } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('StickerBlue')
export class StickerBlue extends Sticker {
    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(damageType === "blue" && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }
}


