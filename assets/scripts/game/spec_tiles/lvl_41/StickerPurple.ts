import { _decorator, Component, Node } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('StickerPurple')
export class StickerPurple extends Sticker {
    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
        else if(damageType === "purple" && !this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }

    startDestroyConsequences() {
        this.node.emit("goal", "sticker"); //temp for version update

        this.node.emit("goal", "colored_balloon");
    }
}


