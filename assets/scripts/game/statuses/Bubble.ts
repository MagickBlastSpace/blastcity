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
        this.isBlockMatchHit = false;
    }

    getDamage(damageType: string) {
        this.setAsDamaged();
    }

    isReadyToDestroy(): boolean {
        return this.isDamaged;
    }
}


