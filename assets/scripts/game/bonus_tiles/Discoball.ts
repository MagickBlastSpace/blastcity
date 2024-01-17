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
    @property(SpriteFrame)
    purple: SpriteFrame | null = null;
    @property(SpriteFrame)
    orange: SpriteFrame | null = null;

    
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
            case 'purple':
                this.icon.spriteFrame = this.purple;
                break;
            case 'orange':
                this.icon.spriteFrame = this.orange;
                break;
        }
    }


    getMatches(field: Node[][]): Node[] {
        this.combo = this.getCombo(field);
        let tilesToDestroy = this.getMatchesByType(field);

        return tilesToDestroy;
    }


    getMatchesByType(field: Node[][]): Node[] {
        let matches = [];

        if(this.isCombo()) {
            matches = this.getMatchesByCombo(field);
            return matches;
        }

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


    getMatchesByCombo(field: Node[][]): Node[] {
        let matches = [];

        switch(this.combo) {
            case "rocket_vertical":
            case "rocket_horizontal":
                matches = this.getRocketComboMatches(field);
                break;
            case "bomb":
                matches = this.getBombComboMatches(field);
                break;
            case "blue":
            case "red":
            case "green":
            case "yellow":
            case "purple":
            case "orange":
                matches = this.getDiscoballComboMatches(field);
                break;
        }

        return matches;
    }

    getRocketComboMatches(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const timeBetweenTiles = 0.05;

        let tiles = [];
        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                const tile = field[i][j];
                if(tile !== null && tile !== this.node) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.getTileType() === this.tileType) {
                        tiles.push(tileComp);
                    }
                }
            }
        }
        tiles.push(this);

        const totalTime = timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                const rocketType = Math.floor(Math.random() * 2);
                if(rocketType === 0) {
                    this.changeTile(tiles[i], totalTime - timeBetweenTiles * i, "rocket_vertical");
                }
                else {
                    this.changeTile(tiles[i], totalTime - timeBetweenTiles * i, "rocket_horizontal");
                }
            }, timeBetweenTiles * i);
        }

        this.setRespawnEvent(totalTime + 1);

        return matches;
    }

    getBombComboMatches(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const timeBetweenTiles = 0.05;

        let tiles = [];
        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                const tile = field[i][j];
                if(tile !== null && tile !== this.node) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.getTileType() === this.tileType) {
                        tiles.push(tileComp);
                    }
                }
            }
        }
        tiles.push(this);

        const totalTime = timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                this.changeTile(tiles[i], totalTime - timeBetweenTiles * i, "bomb");
            }, timeBetweenTiles * i);
        }

        this.setRespawnEvent(totalTime + 1);

        return matches;
    }

    getDiscoballComboMatches(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                this.node.emit("extra_hit", i, j);
            }
        }

        this.setRespawnEvent(0.2);

        return matches;
    }

    changeTile(tile: TileBase, timeToDestroy: number, tileType: string) {
        if(tile === null) {
            return;
        }
        try {
            this.node.emit("change_bonus", tile.getRow(), tile.getCol(), tileType, timeToDestroy);
        }
        catch (error) {
            //console.error("Произошла ошибка при обработке tile:", error);
            return;
        }
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }
}


