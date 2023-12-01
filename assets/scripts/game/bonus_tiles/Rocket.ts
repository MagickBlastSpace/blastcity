import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Rocket')
export class Rocket extends BonusTileBase {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    rocketVertical: SpriteFrame | null = null;
    @property(SpriteFrame)
    rocketHorizontal: SpriteFrame | null = null;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        switch(this.tileType) {
            case 'rocket_vertical':
                this.icon.spriteFrame = this.rocketVertical;
                break;
            case 'rocket_horizontal':
                this.icon.spriteFrame = this.rocketHorizontal;
                break;
        }
    }


    getMatches(field: Node[][]): Node[] {
        let tilesToDestroy = this.getMatchesByType(field);
        let bonusTiles = this.findBonusTiles(tilesToDestroy);

        while(bonusTiles.length > 0) {
            let newTilesToDestroy = [];
            bonusTiles.forEach(bonusTile => {
                let newMatches = bonusTile.getMatchesByType(field);
                
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

        switch(this.tileType) {
            case 'rocket_vertical':
                matches = this.getVerticalMatches(field);
                break;
            case 'rocket_horizontal':
                matches = this.getHorizontalMatches(field);
                break;
        }

        return matches;
    }


    getVerticalMatches(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;

        for(let i = 0; i < numRows; i++) {
            const tile = field[i][this.col];
            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }

        return matches;
    }

    getHorizontalMatches(field: Node[][]): Node[] {
        let matches = [];

        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let i = 0; i < numCols; i++) {
            const tile = field[this.row][i];
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
        else if(possibleCombos.includes("rocket_vertical")) {
            return "rocket_vertical";
        }
        else if(possibleCombos.includes("rocket_horizontal")) {
            return "rocket_horizontal";
        }
    }
}


