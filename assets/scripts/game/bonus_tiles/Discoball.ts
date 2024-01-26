import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Discoball')
export class Discoball extends BonusTileBase {
    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);
    }


    getMatches(field: Node[][], statuses: Node[][], isBlockingCombo: boolean): Node[] {
        this.combo = "";
        if(!isBlockingCombo) {
            this.getCombo(field);
        }
        
        let tilesToDestroy = this.getMatchesByType(field, statuses);

        return tilesToDestroy;
    }


    getMatchesByType(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        if(this.isCombo()) {
            matches = this.getMatchesByCombo(field, statuses);
            return matches;
        }

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        matches = this.getBiggestCommonTilesGroup(field, statuses);
        matches.push(this);

        return matches;
    }


    getMatchesByCombo(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        if(this.combo === "rocket_vertical" || this.combo === "rocket_horizontal") {
            matches = this.getRocketComboMatches(field, statuses);
        }
        else if(this.combo === "bomb") {
            matches = this.getBombComboMatches(field, statuses);
        }
        else if(this.availableColors.includes(this.combo) || this.combo === "multi") {
            matches = this.getDiscoballComboMatches(field, statuses);
        }

        return matches;
    }

    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];
        tiles = this.getBiggestCommonTilesGroup(field, statuses);
        tiles.push(this);

        const totalTime = this.timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                const rocketType = Math.floor(Math.random() * 2);
                if(rocketType === 0) {
                    this.changeTile(tiles[i], totalTime - this.timeBetweenTiles * i * (i / tiles.length), "rocket_vertical");
                }
                else {
                    this.changeTile(tiles[i], totalTime - this.timeBetweenTiles * i * (i / tiles.length), "rocket_horizontal");
                }
            }, this.timeBetweenTiles * i);
        }

        this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];
        tiles = this.getBiggestCommonTilesGroup(field, statuses);
        tiles.push(this);

        const totalTime = this.timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                this.changeTile(tiles[i], totalTime - this.timeBetweenTiles * i * (i / tiles.length), "bomb");
            }, this.timeBetweenTiles * i);
        }

        this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false);

        return matches;
    }

    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                this.node.emit("extra_hit", i, j, false);
            }
        }

        this.setRespawnEvent(this.respawnDelay);

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
            return;
        }
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }
}


