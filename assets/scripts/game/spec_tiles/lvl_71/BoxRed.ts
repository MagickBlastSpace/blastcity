import { _decorator, Component, Node } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxRed')
export class BoxRed extends Box {
    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(damageType === "red" && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }

    startDestroyConsequences() {
        this.node.emit("goal", "colored_box");

        this.playAnimation("red", false, 1);
    }
}


