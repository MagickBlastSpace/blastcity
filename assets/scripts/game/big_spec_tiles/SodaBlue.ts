import { _decorator, Component, Node } from 'cc';
import { Soda } from './Soda';
const { ccclass, property } = _decorator;

@ccclass('SodaBlue')
export class SodaBlue extends Soda {
    getDamage(damageType: string) {
        if(damageType === "blue" && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        
        this.refresh();
    }
}


