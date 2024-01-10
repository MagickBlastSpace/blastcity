import { _decorator, Component, Node } from 'cc';
import { StatusBase } from './StatusBase';
const { ccclass, property } = _decorator;

@ccclass('Bushes')
export class Bushes extends StatusBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isBlockMovement = false;
        this.isBlockInteraction = true;
        this.isBlockDestroyTile = true;
        this.isMatchHit = true;
    }

    getDamage() {
        this.setAsDamaged();
    }

    isReadyToDestroy(): boolean {
        return this.isDamaged;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "bushes");
    }
}


