import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Discoball')
export class Discoball extends BonusTileBase {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    blue: SpriteFrame | null = null;
    @property(SpriteFrame)
    red: SpriteFrame | null = null;
    @property(SpriteFrame)
    green: SpriteFrame | null = null;
    @property(SpriteFrame)
    yellow: SpriteFrame | null = null;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        switch(this.tileType) {
            case 'blue':
                this.icon.spriteFrame = this.blue;
                break;
            case 'red':
                this.icon.spriteFrame = this.red;
                break;
            case 'green':
                this.icon.spriteFrame = this.green;
                break;
            case 'yellow':
                this.icon.spriteFrame = this.yellow;
                break;
        }
    }


    getMatches(field: Node[][]): Node[] {
        let tilesToDestroy = this.getMatchesByType(field);

        return tilesToDestroy;
    }


    getMatchesByType(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                const tile = field[i][j];
                if(tile !== null) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.getTileType() === this.getTileType()) {
                        matches.push(tile);
                    }
                }
            }
        }

        return matches;
    }
}


