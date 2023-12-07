import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../spec_tiles/SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('BigTileBase')
export class BigTileBase extends SpecTileBase {
    canFall(field: Node[][], rowIndexToFall: number): boolean {
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(this.row <= 0 || this.col >= numCols - 1) {
            return false;
        }

        for(let i = this.row - 1; i >= rowIndexToFall; i--) {
            if(field[i][this.col] !== null) {
                const tileComp = field[i][this.col].getComponent("TileBase");
                if(!tileComp.isEmptyTile()) {
                    return false;
                }
                else if(tileComp.isEmptyTile() && i === rowIndexToFall) {
                    return false;
                }
            }
            if(field[i][this.col + 1] !== null) {
                const tileComp = field[i][this.col + 1].getComponent("TileBase");
                if(!tileComp.isEmptyTile()) {
                    return false;
                }
                else if(tileComp.isEmptyTile() && i === rowIndexToFall) {
                    return false;
                }
            }
        }
        
        return true;
    }
}


