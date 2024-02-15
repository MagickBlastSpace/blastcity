import { _decorator, Component, Node } from 'cc';
import { Sticker } from './lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('Coin')
export class Coin extends Sticker {
    startDestroyConsequences() {
        this.node.emit("goal_inc", "coin");
    }
}


