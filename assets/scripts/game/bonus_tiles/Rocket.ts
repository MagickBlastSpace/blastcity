import { _decorator, Component, Node } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Rocket')
export class Rocket extends BonusTileBase {

    @property(Node)
    rocketVertical: Node | null = null;
    @property(Node)
    rocketHorizontal: Node | Node = null;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.rocketVertical.active = this.tileType === 'rocket_vertical';
        this.rocketHorizontal.active = this.tileType === 'rocket_horizontal';
    }


    getMatches(field: Node[][], statuses: Node[][], isBlockingCombo: boolean): Node[] {
        this.combo = "";
        if(!isBlockingCombo) {
            this.combo = this.getCombo(field);
        }

        let matches = this.getMatchesByType(field, statuses);

        return matches;
    }


    getMatchesByType(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        if(this.isCombo()) {
            matches = this.getMatchesByCombo(field, statuses);
            return matches;
        }

        switch(this.tileType) {
            case 'rocket_vertical':
                this.colExtraHit(field, this.row, this.col);
                break;
            case 'rocket_horizontal':
                this.rowExtraHit(field, this.row, this.col);
                break;
        }

        this.setRespawnEvent(0.2);

        return matches;
    }


    getMatchesByCombo(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        switch(this.combo) {
            case "rocket_vertical":
            case "rocket_horizontal":
                matches = this.getRocketComboMatches(field, statuses);
                break;
            case "bomb":
                matches = this.getBombComboMatches(field, statuses);
                break;
            case "blue":
            case "red":
            case "green":
            case "yellow":
            case "purple":
            case "orange":
                matches = this.getDiscoballComboMatches(field, this.combo);
                break;
        }

        return matches;
    }

    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.rowExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col);

        this.setRespawnEvent(0.2);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.rowExtraHit(field, this.row, this.col);
        this.rowExtraHit(field, this.row + 1, this.col);
        this.rowExtraHit(field, this.row - 1, this.col);

        this.colExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col + 1);
        this.colExtraHit(field, this.row, this.col - 1);

        this.setRespawnEvent(0.2);

        return matches;
    }


    getDiscoballComboMatches(field: Node[][], discoballType: string): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const timeBetweenTiles = 0.05;

        let tiles = [];

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                const tile = field[i][j];
                if(tile !== null) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.getTileType() === discoballType) {
                        tiles.push(tileComp);
                    }
                }
            }
        }

        const totalTime = timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                this.changeTile(tiles[i], totalTime - timeBetweenTiles * i);
            }, timeBetweenTiles * i);
        }

        this.setRespawnEvent(totalTime + 1);

        return matches;
    }

    changeTile(tile: TileBase, timeToDestroy: number) {
        const rocketType = Math.floor(Math.random() * 2);
        if(rocketType === 0) {
            this.node.emit("change_bonus", tile.getRow(), tile.getCol(), "rocket_vertical", timeToDestroy);
        }
        else {
            this.node.emit("change_bonus", tile.getRow(), tile.getCol(), "rocket_horizontal", timeToDestroy);
        }
        
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }
}


