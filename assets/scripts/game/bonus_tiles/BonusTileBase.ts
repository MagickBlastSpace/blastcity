import { _decorator, Component, Node } from 'cc';
import { TileBase } from '../TileBase';
const { ccclass, property } = _decorator;

@ccclass('BonusTileBase')
export class BonusTileBase extends TileBase {

    private combo: string = "";

    private availableColors: string[] = [];


    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = true;
        this.isEmpty = false;
        this.isShifts = true;
        this.isSpecial = false;

        this.combo = "";
        this.availableColors = ["blue", "red", "green", "yellow", "purple", "orange"];
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
        else if(possibleCombos.includes("purple")) {
            return "purple";
        }
        else if(possibleCombos.includes("orange")) {
            return "orange";
        }
        else if(possibleCombos.includes("bomb")) {
            return "bomb";
        }
        else if(possibleCombos.includes("rocket_vertical")) {
            return "rocket_vertical";
        }
        else if(possibleCombos.includes("rocket_horizontal")) {
            return "rocket_horizontal";
        }

        return "";
    }


    isCombo(): boolean {
        return this.combo !== "";
    }


    clear() {
        this.combo = "";
    }


    rowExtraHit(field: Node[][], row: number, col: number) {
        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let j = 0; j < numCols; j++) {
            let isBonusChain = j !== col && j !== col + 1 && j !== col - 1;
            this.node.emit("extra_hit", row, j, isBonusChain);
        }

        this.clearTiles();
    }

    colExtraHit(field: Node[][], row: number, col: number) {
        const numRows: number = field.length;

        for(let j = 0; j < numRows; j++) {
            let isBonusChain = j !== row && j !== row + 1 && j !== row - 1;
            this.node.emit("extra_hit", j, col, isBonusChain);
        }

        this.clearTiles();
    }
}


