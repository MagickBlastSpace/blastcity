import { _decorator, Component, Node } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;

@ccclass('BigBottle')
export class BigBottle extends BigTileBase {

    private lowestRow: number = 0;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.isDoubleX = true;
        this.isDoubleY = true;
    }


    isReadyToDestroy(): boolean {
        if(this.row === this.lowestRow) {
            return true;
        }
        return false;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "big_bottle"); //temp for version update

        this.node.emit("goal", "big_duck");
    }


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        let fieldComp = field.getComponent("Field");
        
        this.lowestRow = this.findLowestRow(fieldComp.getTilesArray());
    }


    findLowestRow(field: Node[][]): number {
        if(this.row === 0) {
            return 0;
        }

        let lowestRow = this.row;
        for(let i = this.row - 1; i >= 0; i--) {
            const tile = field[i][this.col];
            const tile2 = field[i][this.col + 1];
            if(tile !== null && tile !== undefined && tile2 !== null && tile2 !== undefined) {
                const tileComp = tile.getComponent("TileBase");
                const tileComp2 = tile.getComponent("TileBase");
                if(!tileComp.isEmptyTile() && !tileComp2.isEmptyTile()) {
                    lowestRow = tileComp.getRow();
                }
            }
        }

        return lowestRow;
    }
}


