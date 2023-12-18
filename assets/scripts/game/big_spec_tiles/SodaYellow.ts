import { _decorator, Component, Node } from 'cc';
import { Soda } from './Soda';
const { ccclass, property } = _decorator;

@ccclass('SodaYellow')
export class SodaYellow extends Soda {
    getDamage(damageType: string) {
        if(damageType === "yellow" && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        
        this.refresh();
    }
}


