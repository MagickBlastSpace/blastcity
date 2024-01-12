import { _decorator, Component, Node } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('Firerockets')
export class Firerockets extends Sticker {
    startDestroyConsequences(): boolean {
        for(let i = 1; i <= 3; i++) {
            this.node.emit("random_extra_hit", "firebox", this.tileType);
        }
        
        this.node.emit("respawn", 0.5);

        this.node.emit("goal", "firerockets");

        return true;
    }
}


