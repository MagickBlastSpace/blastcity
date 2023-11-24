import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { TileBase } from '../TileBase';
const { ccclass, property } = _decorator;

@ccclass('Rocket')
export class Rocket extends TileBase {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    rocketVertical: SpriteFrame | null = null;
    @property(SpriteFrame)
    rocketHorizontal: SpriteFrame | null = null;

    
    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = true;
        this.isEmpty = false;

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
            const tileComponent = tile.getComponent("TileBase");
            if(!tileComponent.isEmptyTile()) {
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
            const tileComponent = tile.getComponent("TileBase");
            if(!tileComponent.isEmptyTile()) {
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
}


