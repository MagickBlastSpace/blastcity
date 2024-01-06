import { _decorator, Component, Node } from 'cc';
import { Fish } from '../lvl_321/Fish';
const { ccclass, property } = _decorator;

@ccclass('Frog')
export class Frog extends Fish {
    getDamage(damageType: string) {
        super.getDamage(damageType);

        this.node.emit("status", "bubble");
    }
}


