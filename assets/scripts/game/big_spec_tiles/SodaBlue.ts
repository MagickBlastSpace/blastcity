import { _decorator, Component, Node } from 'cc';
import { Soda } from './Soda';
const { ccclass, property } = _decorator;

@ccclass('SodaBlue')
export class SodaBlue extends Soda {
    getDamage(damageType: string) {
        if( (damageType === "blue" || damageType === "bonus") && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        
        this.refresh();
    }

    refresh() {
        const hpNode = this.hps[this.strength];
        const animNode = this.hps_anim[this.strength];
        
        if (hpNode && animNode) {
            if (hpNode.active) {
                this.playAdditionalAnimation(animNode, "soda_blue", null);
            }
        }
    
        super.refresh();
    }
}


