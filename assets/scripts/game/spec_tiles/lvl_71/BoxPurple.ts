import { _decorator, Component, Node } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxPurple')
export class BoxPurple extends Box {
    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(damageType === "purple" && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }

    startDestroyConsequences() {
        this.node.emit("goal", "colored_box");

        this.playAnimation("purple", false, 1);
    }
}


