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
    }


    getMatches(field: Node[][]): Node[] {
        let tilesToDestroy = this.getBombMatches(field, this.row, this.col);
        let bonusTiles = this.findBonusTiles(this.row, this.col, tilesToDestroy);

        while(bonusTiles.length > 0) {
            let newTilesToDestroy = [];
            bonusTiles.forEach(bonusTile => {
                const newMatches = this.getBombMatches(field, bonusTile.getRow(), bonusTile.getCol());
                newMatches.forEach(newMatch => {
                    if(!tilesToDestroy.includes(newMatch)) {
                        newTilesToDestroy.push(newMatch);
                    }
                })
            })
            bonusTiles = this.findBonusTiles(this.row, this.col, newTilesToDestroy);
            tilesToDestroy = tilesToDestroy.concat(newTilesToDestroy);
        }

        return tilesToDestroy;
    }


    getBombMatches(field: Node[][], row: number, col: number): Node[] {
        let matches = [];
        matches.push(field[row][col]);

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(row < numRows - 1) {
            matches.push(field[row + 1][col]);
        }
        if(row > 0) {
            matches.push(field[row - 1][col]);
        }
        if(col < numCols - 1) {
            matches.push(field[row][col + 1]);
        }
        if(col > 0) {
            matches.push(field[row][col - 1]);
        }
        if(row < numRows - 1 && col < numCols - 1) {
            matches.push(field[row + 1][col + 1]);
        }
        if(row > 0 && col > 0) {
            matches.push(field[row - 1][col - 1]);
        }
        if(row < numRows - 1 && col > 0) {
            matches.push(field[row + 1][col - 1]);
        }
        if(row > 0 && col < numCols - 1) {
            matches.push(field[row - 1][col + 1]);
        }

        return matches;
    }


    findBonusTiles(row: number, col: number, matches: Node[]): Tile[] {
        let bonusTiles = [];
        matches.forEach(matchedTile => {
            let tileComponent = matchedTile.getComponent("TileBase");
            const isBonus = tileComponent.isBonusTile();
            if(isBonus && !tileComponent.isCurrentTile(row, col)) {
                bonusTiles.push(tileComponent);
            }
        })

        return bonusTiles;
    }
}


