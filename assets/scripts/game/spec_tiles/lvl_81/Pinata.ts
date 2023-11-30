import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Pinata')
export class Pinata extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.isSpecial = true;

        this.strength = 1;
    }

    getDamage(damageType: string) {
        if(damageType === "bonus") {
            this.strength--;
        }
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }
}


