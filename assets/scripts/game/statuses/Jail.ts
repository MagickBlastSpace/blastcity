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
        this.isBlockMatchHit = true;
    }

    getDamage() {
        this.setAsDamaged();
    }

    isReadyToDestroy(): boolean {
        return this.isDamaged;
    }
}


