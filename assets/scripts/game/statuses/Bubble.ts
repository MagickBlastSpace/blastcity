import { _decorator, Component, Node } from 'cc';
import { StatusBase } from './StatusBase';
const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Bubble extends StatusBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isBlockMovement = false;
        this.isBlockInteraction = false;
        this.isBlockDestroyTile = false;
        this.isMatchHit = false;
    }

    getDamage() {
        this.setAsDamaged();

        this.playDamageSound();
    }

    isReadyToDestroy(): boolean {
        return this.isDamaged;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "bubble");
    }


    playDamageSound() {
        this.playSound(0);
    }
}


