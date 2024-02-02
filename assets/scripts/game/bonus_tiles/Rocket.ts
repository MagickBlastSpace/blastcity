import { _decorator, Component, Node, tween, Vec3 } from 'cc';
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
        if(this.isActivated) {
            return;
        }

        this.isActivated = true;

        this.combo = "";
        if(!isBlockingCombo) {
            this.getCombo(field);
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
        else if(this.combo === "multi" || this.combo === "super") {
            matches = this.getDiscoballComboMatches(field, statuses);
        }

        return matches;
    }

    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.rowExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const totalTime = this.respawnDelay / 2;
        const timeStep = totalTime / 6;

        this.scheduleOnce(() => {
            this.fastRowExtraHit(field, this.row, this.col);
        }, timeStep * 0);
        this.scheduleOnce(() => {
            this.fastRowExtraHit(field, this.row + 1, this.col);
        }, timeStep * 1);
        this.scheduleOnce(() => {
            this.fastRowExtraHit(field, this.row - 1, this.col);
        }, timeStep * 2);

        this.scheduleOnce(() => {
            this.fastColExtraHit(field, this.row, this.col);
        }, timeStep * 3);
        this.scheduleOnce(() => {
            this.fastColExtraHit(field, this.row, this.col + 1);
        }, timeStep * 4);
        this.scheduleOnce(() => {
            this.fastColExtraHit(field, this.row, this.col - 1);
        }, timeStep * 5);


        /*this.fastRowExtraHit(field, this.row, this.col);
        this.fastRowExtraHit(field, this.row + 1, this.col);
        this.fastRowExtraHit(field, this.row - 1, this.col);

        this.fastColExtraHit(field, this.row, this.col);
        this.fastColExtraHit(field, this.row, this.col + 1);
        this.fastColExtraHit(field, this.row, this.col - 1);*/


        return matches;
    }


    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];
        tiles = this.combo === "super" ? this.getTwoBiggestCommonTilesGroups(field, statuses) : this.getBiggestCommonTilesGroup(field, statuses);
        const multiTile = field[this.comboPosition.x][this.comboPosition.y];
        if(multiTile !== null && multiTile !== undefined) {
            const multiTileComp = multiTile.getComponent("TileBase");
            tiles.push(multiTileComp);
        }

        const totalTime = this.timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                this.changeTile(tiles[i]);
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("activate_bonus_pool");
            this.node.emit("extra_hit", this.row, this.col, false);
        }, totalTime);

        this.setDicoballComboAnimation();

        return matches;
    }

    changeTile(tile: TileBase) {
        const rocketType = Math.floor(Math.random() * 2);
        const rocketString = rocketType === 0 ? "rocket_vertical" : "rocket_horizontal";
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), rocketString, true);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    setDicoballComboAnimation() {
        tween(this.node)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();
    }
}


