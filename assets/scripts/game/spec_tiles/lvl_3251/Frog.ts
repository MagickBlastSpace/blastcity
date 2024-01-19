import { _decorator, Component, Node } from 'cc';
import { Fish } from '../lvl_321/Fish';
const { ccclass, property } = _decorator;

@ccclass('Frog')
export class Frog extends Fish {
    getDamage(damageType: string) {
        super.getDamage(damageType);

        if(this.goalCount > 1) {
            this.node.emit("status", "bubble");
        }
    }


    isReadyToDestroy(): boolean {
        if(this.goalCount <= 0) {
            return true;
        }

        return false;
    }
}


