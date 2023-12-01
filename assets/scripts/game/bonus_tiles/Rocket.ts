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

        let direction = this.tileType;

        while(bonusTiles.length > 0) {
            let newTilesToDestroy = [];
            bonusTiles.forEach(bonusTile => {
                const bonusType = bonusTile.getTileType();
                if(direction === bonusType) {
                    direction = bonusTile.changeDirection();
                }
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

        this.combo = this.getCombo(field);

        if(this.combo !== "") {
            matches = this.getMatchesByCombo(field);
            return matches;
        }

        switch(this.tileType) {
            case 'rocket_vertical':
                matches = this.getVerticalMatches(field, this.col);
                break;
            case 'rocket_horizontal':
                matches = this.getHorizontalMatches(field, this.row);
                break;
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
                matches = this.getDiscoballComboMatches(field, this.combo);
                break;
        }

        return matches;
    }

    getRocketComboMatches(field: Node[][]): Node[] {
        return this.getVerticalMatches(field, this.col).concat(this.getHorizontalMatches(field, this.row));
    }

    getBombComboMatches(field: Node[][]): Node[] {
        let matches = [];

        matches = this.getRocketComboMatches(field);
        matches = matches.concat(this.getHorizontalMatches(field, this.row - 1));
        matches = matches.concat(this.getHorizontalMatches(field, this.row + 1));
        matches = matches.concat(this.getVerticalMatches(field, this.col - 1));
        matches = matches.concat(this.getVerticalMatches(field, this.col + 1));

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
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), this.tileType, timeToDestroy);
    }

    setRespawnEvent(timeToRespawn: number) {
        console.log("respawn");
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


