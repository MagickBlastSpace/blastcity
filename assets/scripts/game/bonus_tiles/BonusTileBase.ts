import { _decorator, Component, Node } from 'cc';
import { TileBase } from '../TileBase';
const { ccclass, property } = _decorator;

@ccclass('BonusTileBase')
export class BonusTileBase extends TileBase {

    private combo: string = "";


    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = true;
        this.isEmpty = false;
        this.isShifts = true;
        this.isSpecial = false;

        this.combo = "";
    }


    getCombo(field: Node[][]): string {
        let possibleCombos = [];

        let adjTiles = this.getAdjacentTiles(field);
        for(let i = 0; i < adjTiles.length; i++) {
            const tile = adjTiles[i];
            if(tile !== null) {
                const tileComponent = tile.getComponent("TileBase");
                if(tileComponent.isBonusTile()) {
                    possibleCombos.push(tileComponent.getTileType());
                }
            }
        }

        if(possibleCombos.includes("blue")) {
            return "blue";
        }
        else if(possibleCombos.includes("red")) {
            return "red";
        }
        else if(possibleCombos.includes("green")) {
            return "green";
        }
        else if(possibleCombos.includes("yellow")) {
            return "yellow";
        }
        else if(possibleCombos.includes("bomb")) {
            return "bomb";
        }
        else if(possibleCombos.includes("rocket_vertical") || possibleCombos.includes("rocket_horizontal")) {
            return "rocket";
        }

        return "";
    }


    getVerticalMatches(field: Node[][], col: number): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(col < 0 || col >= numCols) {
            return matches;
        }

        for(let i = 0; i < numRows; i++) {
            const tile = field[i][col];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }

        return matches;
    }

    getHorizontalMatches(field: Node[][], row: number): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(row < 0 || row >= numRows) {
            return matches;
        }

        for(let i = 0; i < numCols; i++) {
            const tile = field[row][i];
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


