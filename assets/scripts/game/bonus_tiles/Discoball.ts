import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Discoball')
export class Discoball extends BonusTileBase {

    @property(SpriteFrame)
    multi: SpriteFrame = null;
    @property(SpriteFrame)
    super: SpriteFrame = null;

    @property(Sprite)
    icon: Sprite = null;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.icon.spriteFrame = this.tileType === 'multi' ? this.multi : this.super;
    }


    getMatches(field: Node[][], statuses: Node[][], isBlockingCombo: boolean): Node[] {
        if(this.isActivated) {
            return;
        }

        this.combo = "";
        if(!isBlockingCombo) {
            this.getCombo(field);
        }
        
        let tilesToDestroy = this.getMatchesByType(field, statuses);

        return tilesToDestroy;
    }


    getMatchesByType(field: Node[][], statuses: Node[][]): Node[] {
        if(this.isActivated) {
            return;
        }

        let matches = [];

        if(this.isCombo()) {
            matches = this.getMatchesByCombo(field, statuses);
            return matches;
        }

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        matches = this.getBiggestCommonTilesGroup(field, statuses);

        if(this.tileType === "super") {
            this.tileType = "multi";

            this.scheduleOnce(() => {
                this.node.emit("get_matches", this.node);
            }, this.respawnDelay);

            for(let i = 0; i < matches.length; i++) {
                this.node.emit("goal", "discoball");
            }

            return matches;
        }

        this.isActivated = true;

        for(let i = 0; i < matches.length; i++) {
            this.node.emit("goal", "discoball");
        }

        matches.push(this);

        return matches;
    }


    getMatchesByCombo(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.isActivated = true;

        if(this.combo === "rocket_vertical" || this.combo === "rocket_horizontal") {
            matches = this.getRocketComboMatches(field, statuses);
        }
        else if(this.combo === "bomb") {
            matches = this.getBombComboMatches(field, statuses);
        }
        else if(this.availableColors.includes(this.combo) || this.combo === "multi") {
            matches = this.getDiscoballComboMatches(field, statuses);
        }
        else if(this.combo === "super") {
            matches = this.getSuperDiscoballComboMatches(field, statuses);
        }

        return matches;
    }

    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];
        tiles = this.tileType === "super" ? this.getTwoBiggestCommonTilesGroups(field, statuses) : this.getBiggestCommonTilesGroup(field, statuses);

        for(let i = 0; i < tiles.length; i++) {
            this.node.emit("goal", "discoball");
        }

        tiles.push(this);

        const totalTime = this.timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                const rocketString = Math.floor(Math.random() * 2) === 0 ? "rocket_vertical" : "rocket_horizontal";
                this.changeTile(tiles[i], rocketString);
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("activate_bonus_pool");
        }, totalTime);

        this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false, 0);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];
        tiles = this.tileType === "super" ? this.getTwoBiggestCommonTilesGroups(field, statuses) : this.getBiggestCommonTilesGroup(field, statuses);

        for(let i = 0; i < tiles.length; i++) {
            this.node.emit("goal", "discoball");
        }

        tiles.push(this);

        const totalTime = this.timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                this.changeTile(tiles[i], "bomb");
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("activate_bonus_pool");
        }, totalTime);

        this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false, 0);

        return matches;
    }

    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                this.node.emit("extra_hit", i, j, false, 0);

                this.node.emit("goal", "discoball");
            }
        }

        this.setRespawnEvent(this.respawnDelay);

        return matches;
    }

    getSuperDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                if(i === this.getRow() && j === this.getCol()) {
                    continue;
                }

                this.node.emit("extra_hit", i, j, false, 0);

                this.node.emit("goal", "discoball");
            }
        }

        this.clearTiles();

        this.setRespawnEvent(this.respawnDelay * 2);

        this.scheduleOnce(() => {
            this.getDiscoballComboMatches(field, statuses);
        }, this.respawnDelay);

        return matches;
    }

    changeTile(tile: TileBase, tileType: string) {
        if(tile === null) {
            return;
        }
        try {
            this.node.emit("change_bonus", tile.getRow(), tile.getCol(), tileType, true);
        }
        catch (error) {
            return;
        }
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }
}


