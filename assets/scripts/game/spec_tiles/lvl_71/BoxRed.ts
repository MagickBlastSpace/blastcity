import { _decorator, Component, Node } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxRed')
export class BoxRed extends Box {
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


