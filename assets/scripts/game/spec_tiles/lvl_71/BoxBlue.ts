import { _decorator, Component, Node } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxBlue')
export class BoxBlue extends Box {
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


