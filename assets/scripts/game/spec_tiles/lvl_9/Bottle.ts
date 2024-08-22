import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Bottle')
export class Bottle extends SpecTileBase {

    private lowestRow: number = 0;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
    }


    isReadyToDestroy(): boolean {
        return false;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "bottle"); //temp fpr version update

        this.node.emit("goal", "duck");
        this.node.emit("goal_effect", "duck", this.row, this.col);
    }

    startInActionEffect(): boolean {
        if(this.row === this.lowestRow) {
            this.playAnimation("destroy", false, 1);
            
            this.node.emit("destroy_tile", this.row, this.col);

            this.node.emit("respawn", 0.2);
        }
        
        return true;
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
            if(tile !== null && tile !== undefined) {
                const tileComp = tile.getComponent("TileBase");
                if(!tileComp.isEmptyTile()) {
                    lowestRow = tileComp.getRow();
                }
            }
        }

        return lowestRow;
    }
}


