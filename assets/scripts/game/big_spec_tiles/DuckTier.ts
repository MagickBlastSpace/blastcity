import { _decorator, Component, Node } from 'cc';
import { Soda } from './Soda';
const { ccclass, property } = _decorator;

@ccclass('DuckTier')
export class DuckTier extends Soda {
    getDamage(damageType: string) {
        if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        
        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(!this.isDamaged) {
            this.strength = 4;
            this.refresh();
        }

        if(this.strength <= 0) {
            return true;
        }
        return false;
    }
}


