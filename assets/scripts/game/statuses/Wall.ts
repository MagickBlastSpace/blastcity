import { _decorator, Component, Node } from 'cc';
import { StatusBase } from './StatusBase';
const { ccclass, property } = _decorator;

@ccclass('Wall')
export class Wall extends StatusBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isBlockMovement = true;
        this.isBlockInteraction = true;
        this.isBlockDestroyTile = true;
        this.isMatchHit = false;
    }

    getDamage() {}

    isReadyToDestroy(): boolean {
        return false;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "brick_wall");
    }
}


