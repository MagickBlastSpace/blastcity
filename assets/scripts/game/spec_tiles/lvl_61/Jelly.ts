import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Jelly')
export class Jelly extends SpecTileBase {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.strength = 1;

        this.setAsDamaged();
    }

    getDamage(damageType: string) {
        this.strength--;
        this.node.emit("damage_all", this.tileType);
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }

        return false;
    }


    startInActionEffect(field: Node[][], statuses: Node[][], isBlockingAction: boolean): boolean {
        if(this.isDamaged || isBlockingAction) {
            return false;
        }

        let jellies = this.findAllTilesThisType(field);

        let matches = [];

        jellies.forEach(jelly => {
            let tileComponent = jelly.getComponent("TileBase");
            let status = statuses[tileComponent.getRow()][tileComponent.getCol()];

            let isStatusBlock = false;
            if(status !== null) {
                let statusComp = status.getComponent("StatusBase");
                isStatusBlock = statusComp.isBlockingDestroyTile();
            }

            if(!isStatusBlock) {
                matches = matches.concat(tileComponent.getNextJellyCandidates(field));
            }
        })

        if (matches.length === 0) {
            return false;
        }
    
        const randomIndex = Math.floor(Math.random() * matches.length);
        const randomTile = matches[randomIndex];
        const rndTileComp = randomTile.getComponent("TileBase");

        this.node.emit("change", rndTileComp.getRow(), rndTileComp.getCol(), this.tileType);
        this.node.emit("damage_all", this.tileType);

        this.node.emit("goal_inc", "jelly");

        return true;
    }


    getNextJellyCandidates(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(this.row < numRows - 1) {
            const tile = field[this.row + 1][this.col];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }
        if(this.row > 0) {
            const tile = field[this.row - 1][this.col];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }
        if(this.col < numCols - 1) {
            const tile = field[this.row][this.col + 1];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }
        if(this.col > 0) {
            const tile = field[this.row][this.col - 1];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }

        return matches;
    }

    checkTileForMatch(tile: Node): boolean {
        if(tile === null) {
            return false;
        }
        
        const tileComponent = tile.getComponent("TileBase");

        if(tileComponent.isSpecialTile() || tileComponent.isEmptyTile() || tileComponent.isBonusTile()) {
            return false;
        }

        return true;
    }


    startDestroyConsequences() {
        this.node.emit("goal", "jelly");
    }
}


