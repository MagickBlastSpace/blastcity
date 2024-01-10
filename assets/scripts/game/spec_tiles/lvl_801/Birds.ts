import { _decorator, Component, Node } from 'cc';
import { MagicHat } from '../lvl_31/MagicHat';
const { ccclass, property } = _decorator;

@ccclass('Birds')
export class Birds extends MagicHat {
    getDamage(damageType: string) {
        if(this.isDamaged || this.isInactive) {
            return;
        }
        this.setAsDamaged();
        this.node.emit("goal", "birds");
    }


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;

        this.goalCompleteCallback = (tileType) => {
            if(tileType === "birds") {
                this.setInactiveState();
            }
        };

        field.on("goal_complete", this.goalCompleteCallback);
    }
}


