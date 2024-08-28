import { _decorator, Component, Node } from 'cc';
import { Box } from '../lvl_21/Box';
const { ccclass, property } = _decorator;

@ccclass('Honey')
export class Honey extends Box {
    startDestroyConsequences() {
        this.node.emit("goal", "honey");

        this.playAnimation("honey", false, 1);
    }
}


