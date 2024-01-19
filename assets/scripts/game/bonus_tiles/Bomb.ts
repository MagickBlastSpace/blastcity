import { _decorator, Component, Node } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Bomb')
export class Bomb extends BonusTileBase {
    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);
    }


    getMatches(field: Node[][], statuses: Node[][]): Node[] {
        this.combo = this.getCombo(field);

        let tilesToDestroy = this.getMatchesByType(field, statuses);
        let bonusTiles = this.findBonusTiles(tilesToDestroy);

        while(bonusTiles.length > 0) {
            let newTilesToDestroy = [];
            bonusTiles.forEach(bonusTile => {
                const newMatches = bonusTile.getMatchesByType(field, statuses);
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


    getMatchesByType(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        if(this.isCombo()) {
            matches = matches.concat(this.getMatchesByCombo(field, statuses));
            return matches;
        }

        matches = matches.concat(this.getBombMatches(field, statuses, this.row, this.col));

        return matches;
    }


    getBombMatches(field: Node[][], statuses: Node[][], row: number, col: number): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(row < 0 || row >= numRows || col < 0 || col >= numCols) {
            return matches;
        }

        const tile = field[row][col];
        const status = statuses[row][col];
        if(this.checkTileForMatch(tile, status)) {
            matches.push(tile);
        }

        if(row < numRows - 1) {
            const tile = field[row + 1][col];
            if(this.checkTileForMatch(tile, status)) {
                matches.push(tile);
            }
        }
        if(row > 0) {
            const tile = field[row - 1][col];
            if(this.checkTileForMatch(tile, status)) {
                matches.push(tile);
            }
        }
        if(col < numCols - 1) {
            const tile = field[row][col + 1];
            if(this.checkTileForMatch(tile, status)) {
                matches.push(tile);
            }
        }
        if(col > 0) {
            const tile = field[row][col - 1];
            if(this.checkTileForMatch(tile, status)) {
                matches.push(tile);
            }
        }
        if(row < numRows - 1 && col < numCols - 1) {
            const tile = field[row + 1][col + 1];
            if(this.checkTileForMatch(tile, status)) {
                matches.push(tile);
            }
        }
        if(row > 0 && col > 0) {
            const tile = field[row - 1][col - 1];
            if(this.checkTileForMatch(tile, status)) {
                matches.push(tile);
            }
        }
        if(row < numRows - 1 && col > 0) {
            const tile = field[row + 1][col - 1];
            if(this.checkTileForMatch(tile, status)) {
                matches.push(tile);
            }
        }
        if(row > 0 && col < numCols - 1) {
            const tile = field[row - 1][col + 1];
            if(this.checkTileForMatch(tile, status)) {
                matches.push(tile);
            }
        }

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

        this.rowExtraHit(field, this.row);
        this.rowExtraHit(field, this.row + 1);
        this.rowExtraHit(field, this.row - 1);

        this.colExtraHit(field, this.col);
        this.colExtraHit(field, this.col + 1);
        this.colExtraHit(field, this.col - 1);

        this.setRespawnEvent(0.2);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        matches = matches.concat(this.getBombMatches(field, statuses, this.row, this.col));
        matches = matches.concat(this.getBombMatches(field, statuses, this.row + 2, this.col));
        matches = matches.concat(this.getBombMatches(field, statuses, this.row - 2, this.col));
        matches = matches.concat(this.getBombMatches(field, statuses, this.row + 2, this.col + 2));
        matches = matches.concat(this.getBombMatches(field, statuses, this.row + 2, this.col - 2));
        matches = matches.concat(this.getBombMatches(field, statuses, this.row - 2, this.col + 2));
        matches = matches.concat(this.getBombMatches(field, statuses, this.row - 2, this.col - 2));
        matches = matches.concat(this.getBombMatches(field, statuses, this.row, this.col + 2));
        matches = matches.concat(this.getBombMatches(field, statuses, this.row, this.col - 2));

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
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), "bomb", timeToDestroy);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }
}


