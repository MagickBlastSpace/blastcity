import { _decorator, Component, Node } from 'cc';
import { Soda } from './Soda';
const { ccclass, property } = _decorator;

@ccclass('SodaRed')
export class SodaRed extends Soda {
    getDamage(damageType: string) {
        if( (damageType === "red" || damageType === "bonus") && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        
        this.refresh();
    }

    refresh() {
        if(this.hps_anim.length >= (this.strength + 1) && this.hps.length >= (this.strength + 1)) {
            if(this.hps[this.strength].active) {
                this.playAdditionalAnimation(this.hps_anim[this.strength], "soda_red", null);
            }
        }

        super.refresh();
    }
}


