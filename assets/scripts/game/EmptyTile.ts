import { _decorator, Component, Node } from 'cc';
import { TileBase } from './TileBase';
const { ccclass, property } = _decorator;

@ccclass('EmptyTile')
export class EmptyTile extends TileBase {
    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = false;
        this.isEmpty = true;
        this.isShifts = true;
    }


    isBorder(field: Node[][]): boolean {
        if(this.row === 0) {
            return true;
        }
        
        let checkRow = this.row - 1;
        while(checkRow >= 0) {
            const tile = field[checkRow][this.col];
            if(tile === null) {
                return false;
            }
            const tileComponent = tile.getComponent("TileBase");
            const isEmpty = tileComponent.isEmptyTile();
            if(!isEmpty) {
                return false;
            }

            checkRow--;
        }

        return true;
    }

    onTouchStart(event: cc.Event.EventTouch) {}
}


