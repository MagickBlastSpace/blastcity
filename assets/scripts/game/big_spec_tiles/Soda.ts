import { _decorator, Component, Node, Label } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;

@ccclass('Soda')
export class Soda extends BigTileBase {

    @property(Label)
    hpLabel: Label = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strength = 4;

        this.refresh();
    }


    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    refresh() {
        this.hpLabel.string = this.strength;
    }
}


