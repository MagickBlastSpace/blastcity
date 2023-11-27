import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Sticker')
export class Sticker extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = false;
        this.isEmpty = false;
        this.isShifts = true;
        this.isSpecial = true;

        this.strength = 1;
        this.strengthType = "any";
    }
}


