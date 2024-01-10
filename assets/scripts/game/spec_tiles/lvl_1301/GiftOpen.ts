import { _decorator, Component, Node } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('GiftOpen')
export class GiftOpen extends Sticker {
    startDestroyConsequences() {
        this.node.emit("goal", "gift_open");
    }
}


