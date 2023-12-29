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


    getMatches(field: Node[][], statuses: Node[][]): Node[] {
        this.combo = this.getCombo(field);

        let tilesToDestroy = this.getMatchesByType(field, statuses);
        let bonusTiles = this.findBonusTiles(tilesToDestroy);

        let direction = this.tileType;

        while(bonusTiles.length > 0) {
            let newTilesToDestroy = [];
            bonusTiles.forEach(bonusTile => {
                const bonusType = bonusTile.getTileType();
                if(direction === bonusType) {
                    direction = bonusTile.changeDirection();
                }
                let newMatches = bonusTile.getMatchesByType(field, statuses);
                
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
            matches = this.getMatchesByCombo(field, statuses);
            return matches;
        }

        switch(this.tileType) {
            case 'rocket_vertical':
                matches = this.getVerticalMatches(field, statuses, this.col);
                break;
            case 'rocket_horizontal':
                matches = this.getHorizontalMatches(field, statuses, this.row);
                break;
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
                matches = this.getDiscoballComboMatches(field, this.combo);
                break;
        }

        return matches;
    }

    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        return this.getVerticalMatches(field, statuses, this.col).concat(this.getHorizontalMatches(field, statuses, this.row));
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        matches = this.getRocketComboMatches(field, statuses);
        matches = matches.concat(this.getHorizontalMatches(field, statuses, this.row - 1));
        matches = matches.concat(this.getHorizontalMatches(field, statuses, this.row + 1));
        matches = matches.concat(this.getVerticalMatches(field, statuses, this.col - 1));
        matches = matches.concat(this.getVerticalMatches(field, statuses, this.col + 1));

        return matches;
    }

    getDiscoballComboMatches(field: Node[][], discoballType: string): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const timeBetweenTiles = 0.2;

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



    changeDirection(): string {
        if(this.tileType === "rocket_horizontal") {
            this.tileType = "rocket_vertical";
        }
        else {
            this.tileType = "rocket_horizontal";
        }
        return this.tileType;
    }
}


