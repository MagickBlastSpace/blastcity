import { _decorator, Component, Node } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('MoneyBag')
export class MoneyBag extends Sticker {
    startDestroyConsequences() {
        //take money goal event
    }
}


