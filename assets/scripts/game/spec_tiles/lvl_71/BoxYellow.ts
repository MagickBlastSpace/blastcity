import { _decorator, Component, Node } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxYellow')
export class BoxYellow extends Box {
    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(damageType === "yellow" && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }

    startDestroyConsequences() {
        this.node.emit("goal", "box"); //temp for version update

        this.node.emit("goal", "colored_box");
    }
}


