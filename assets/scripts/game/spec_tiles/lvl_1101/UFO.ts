import { _decorator, Component, Node, Vec2 } from 'cc';
import { Bottle } from '../lvl_9/Bottle';
const { ccclass, property } = _decorator;

@ccclass('UFO')
export class UFO extends Bottle {

    private previousRow: number = 0;

    private isSwapped: boolean = false;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.previousRow = -1;
        this.isSwapped = false;
    }


    startInActionEffect(field: Node[][], statuses: Node[][], isBlockingAction: boolean): boolean {
        super.startInActionEffect(field);

        if(!isBlockingAction) {
            if(this.previousRow === this.row) {
                if(!this.isSwapped) {
                    this.moveUpwards(field);
                }
            }
        }

        this.previousRow = this.row;

        return true;
    }


    moveUpwards(field: Node[][]) {
        const numRows: number = field.length;

        if(this.row >= numRows - 1) { 
            return;
        }

        let tile = field[this.row + 1][this.col];
        if(this.isTileAvailableForSwap(tile)) {
            this.node.emit("swap", new Vec2(this.row, this.col), new Vec2(this.row + 1, this.col));
            this.isSwapped = true;
        }
    }


    isTileAvailableForSwap(tile: Node): boolean {
        if(tile === null || tile === undefined) {
            return false;
        }
        
        let tileComp = tile.getComponent("TileBase");
        if(tileComp.isCommonTile()) {
            return true;
        }

        if(tileComp.isSpecialTile()) {
            if(tileComp.isTileShifts() && !tileComp.isDoubleHeight() && !tileComp.isDoubleWidth()) {
                return true;
            }
        }

        if(tileComp.isBonusTile()) {
            return true;
        }

        return false;
    }


    clear() {
        super.clear();

        this.isSwapped = false;
    }


    startDestroyConsequences() {
        this.node.emit("goal", "ufo");
    }
}


