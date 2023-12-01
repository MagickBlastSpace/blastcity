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
}


