import { _decorator, Component, Node } from 'cc';
import { Soda } from './Soda';
const { ccclass, property } = _decorator;

@ccclass('DuckTier')
export class DuckTier extends Soda {

    private isHealAvailable: boolean = false;

    getDamage(damageType: string) {
        if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        
        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(!this.isDamaged && this.strength < 4 && this.isHealAvailable) {
            this.strength++;
            this.refresh();
            this.isHealAvailable = false;
        }

        if(this.strength <= 0) {
            return true;
        }
        return false;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "duck_tier");
    }

    clear() {
        super.clear();

        this.isHealAvailable = true;
    }
}


