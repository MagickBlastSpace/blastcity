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
        return false;
    }

    startInActionEffect(): boolean {
        if(this.row === this.lowestRow) {
            this.node.emit("destroy_tile", this.row, this.col);

            this.node.emit("respawn", 0.2);
        }
        
        return true;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "big_bottle"); //temp for version update

        this.node.emit("goal", "big_duck");
        this.node.emit("goal_effect", "big_duck", this.row, this.col);
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


