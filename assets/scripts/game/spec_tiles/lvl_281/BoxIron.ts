import { _decorator, Component, Node } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('BoxIron')
export class BoxIron extends Box {
    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
    }

    startDestroyConsequences() {
        //this.node.emit("goal", "box"); //temp for version update

        this.node.emit("goal", "iron_box");
    }
}


