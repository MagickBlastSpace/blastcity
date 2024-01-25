import { _decorator, Component, Node, Vec2 } from 'cc';
import { TileBase } from '../TileBase';
const { ccclass, property } = _decorator;

@ccclass('BonusTileBase')
export class BonusTileBase extends TileBase {

    private combo: string = "";
    private comboPosition: Vec2 = null;

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


    getCombo(field: Node[][]) {
        let possibleCombos = [];
        let possibleCombosPositions = [];

        let adjTiles = this.getAdjacentTiles(field);
        for(let i = 0; i < adjTiles.length; i++) {
            const tile = adjTiles[i];
            if(tile !== null) {
                const tileComponent = tile.getComponent("TileBase");
                if(tileComponent.isBonusTile()) {
                    possibleCombos.push(tileComponent.getTileType());
                    possibleCombosPositions.push(new Vec2(tileComponent.getRow(), tileComponent.getCol()));
                }
            }
        }

        if(possibleCombos.includes("multi")) {
            this.combo = "multi";
        }
        else if(possibleCombos.includes("blue")) {
            this.combo = "blue";
        }
        else if(possibleCombos.includes("red")) {
            this.combo = "red";
        }
        else if(possibleCombos.includes("green")) {
            this.combo = "green";
        }
        else if(possibleCombos.includes("yellow")) {
            this.combo = "yellow";
        }
        else if(possibleCombos.includes("purple")) {
            this.combo = "purple";
        }
        else if(possibleCombos.includes("orange")) {
            this.combo = "orange";
        }
        else if(possibleCombos.includes("bomb")) {
            this.combo = "bomb";
        }
        else if(possibleCombos.includes("rocket_vertical")) {
            this.combo = "rocket_vertical";
        }
        else if(possibleCombos.includes("rocket_horizontal")) {
            this.combo = "rocket_horizontal";
        }

        this.comboPosition = possibleCombosPositions[possibleCombos.indexOf(this.combo)];
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


    getBiggestCommonTilesGroup(field: Node[][]): TileBase[] {
        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let biggestGroup = [];
        
        for(let color = 0; color < this.availableColors.length; color++) {
            let tiles = [];

            for(let i = 0; i < numRows; i++) {
                for(let j = 0; j < numCols; j++) {
                    const tile = field[i][j];
                    if(tile !== null && tile !== this.node) {
                        const tileComp = tile.getComponent("TileBase");
                        if(tileComp.getTileType() === this.availableColors[color]) {
                            tiles.push(tileComp);
                        }
                    }
                }
            }

            if(tiles.length > biggestGroup.length) {
                biggestGroup = [];
                for(let i = 0; i < tiles.length; i++) {
                    biggestGroup.push(tiles[i]);
                }
            }
        }
        
        return biggestGroup;
    }
}


