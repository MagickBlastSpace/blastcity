import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Sticker')
export class Sticker extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }

        this.strength--;

        this.setAsDamaged();
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    startDestroyConsequences() {
        this.node.emit("goal", "balloon");

        this.node.emit("goal", "sticker");

        this.playAnimation("balloon0", false, 1);
    }
}


