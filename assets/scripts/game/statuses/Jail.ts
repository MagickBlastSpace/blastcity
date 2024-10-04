import { _decorator, Component, Node } from 'cc';
import { StatusBase } from './StatusBase';
const { ccclass, property } = _decorator;

@ccclass('Jail')
export class Jail extends StatusBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isBlockMovement = true;
        this.isBlockInteraction = true;
        this.isBlockDestroyTile = true;
        this.isMatchHit = true;
    }

    getDamage() {
        this.setAsDamaged();

        this.playDamageSound();
    }

    isReadyToDestroy(): boolean {
        return this.isDamaged;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "jail");
    }

    playDamageSound() {
        this.playSound(0);
    }
}


