import { _decorator, Component, Node } from 'cc';
import { Lamp } from '../lvl_51/Lamp';
const { ccclass, property } = _decorator;

@ccclass('Coconut')
export class Coconut extends Lamp {
    getDamage(damageType: string) {
        if(!this.isDamaged) {
            if(this.strength === 1 || (this.strength === 2 && damageType === "bonus")) {
                this.strength--;
                this.setAsDamaged();
            }
        }

        this.refresh();
    }


    startDestroyConsequences() {
        this.node.emit("goal", "coconut");
    }
}


