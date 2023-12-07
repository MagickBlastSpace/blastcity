import { _decorator, Component, Node } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;

@ccclass('BigBottle')
export class BigBottle extends BigTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.isDoubleX = true;
        this.isDoubleY = true;
    }


    isReadyToDestroy(): boolean {
        if(this.row === 0) {
            return true;
        }
        return false;
    }
}


