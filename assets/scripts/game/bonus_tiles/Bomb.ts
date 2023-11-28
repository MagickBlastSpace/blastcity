import { _decorator, Component, Node } from 'cc';
import { TileBase } from '../TileBase';
const { ccclass, property } = _decorator;

@ccclass('Bomb')
export class Bomb extends TileBase {
    
    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = true;
        this.isEmpty = false;
        this.isShifts = true;
        this.isSpecial = false;
    }


    getMatches(field: Node[][]): Node[] {
        let tilesToDestroy = this.getMatchesByType(field);
        let bonusTiles = this.findBonusTiles(tilesToDestroy);

        while(bonusTiles.length > 0) {
            let newTilesToDestroy = [];
            bonusTiles.forEach(bonusTile => {
                const newMatches = bonusTile.getMatchesByType(field);
                newMatches.forEach(newMatch => {
                    if(!tilesToDestroy.includes(newMatch)) {
                        newTilesToDestroy.push(newMatch);
                    }
                })
            })
            bonusTiles = this.findBonusTiles(newTilesToDestroy);
            tilesToDestroy = tilesToDestroy.concat(newTilesToDestroy);
        }

        return tilesToDestroy;
    }


    getMatchesByType(field: Node[][]): Node[] {
        let matches = [];
        matches.push(field[this.row][this.col]);

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
        if(this.row < numRows - 1 && this.col < numCols - 1) {
            const tile = field[this.row + 1][this.col + 1];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }
        if(this.row > 0 && this.col > 0) {
            const tile = field[this.row - 1][this.col - 1];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }
        if(this.row < numRows - 1 && this.col > 0) {
            const tile = field[this.row + 1][this.col - 1];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }
        if(this.row > 0 && this.col < numCols - 1) {
            const tile = field[this.row - 1][this.col + 1];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }

        return matches;
    }


    findBonusTiles(matches: Node[]): Tile[] {
        let bonusTiles = [];
        matches.forEach(matchedTile => {
            let tileComponent = matchedTile.getComponent("TileBase");
            const isBonus = tileComponent.isBonusTile();
            if(isBonus && !tileComponent.isCurrentTile(this.row, this.col)) {
                bonusTiles.push(tileComponent);
            }
        })

        return bonusTiles;
    }


    checkTileForMatch(tile: Node): boolean {
        if(tile === null) {
            return false;
        }
        
        const tileComponent = tile.getComponent("TileBase");
        if(tileComponent.isSpecialTile()) {
            tileComponent.getDamage("bonus");
            return false;
        }

        if(tileComponent.isEmptyTile()) {
            return false;
        }

        return true;
    }
}


