import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Bottle')
export class Bottle extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
    }


    isReadyToDestroy(): boolean {
        if(this.row === 0) {
            return true;
        }
        return false;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "bottle");
    }
}


