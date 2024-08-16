import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Bomb')
export class Bomb extends BonusTileBase {
    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);
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

        let tilesToDestroy = this.getMatchesByType(field, statuses);

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

        this.playAnimation("bomb", false);

        const totalTime = this.respawnDelay / 2;
        const timeStep = totalTime / 9;

        let counter = 0;
        
        for(let i = this.row - 1; i <= this.row + 1; i++) {
            for(let j = this.col - 1; j <= this.col + 1; j++) {
                let isBonusChain = i !== this.row || j !== this.col; 
                
                this.node.emit("extra_hit", i, j, isBonusChain, timeStep * counter);

                counter = counter + 1;
            }
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

        this.playAnimation("rocket_bomb", false);

        this.rowExtraHit(field, this.row, this.col);
        this.rowExtraHit(field, this.row + 1, this.col);
        this.rowExtraHit(field, this.row - 1, this.col);

        this.colExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col + 1);
        this.colExtraHit(field, this.row, this.col - 1);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.playAnimation("bomb_bomb", false);

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const totalTime = this.respawnDelay / 2;
        const timeStep = totalTime / 49;

        let counter = 0;

        for(let i = this.row - 3; i <= this.row + 3; i++) {
            for(let j = this.col - 3; j <= this.col + 3; j++) {
                let isBonusChain = true;
                if(i === this.row && j === this.col) {
                    isBonusChain = false;
                }
                else if(i > this.row - 2 && i < this.row + 2 && j > this.col - 2 && j < this.col + 2) {
                    if(i > 0 && i < numRows && j > 0 && j < numCols) {
                        let tile = field[i][j];
                        if(tile !== null && tile !== undefined) {
                            const tileComp = tile.getComponent("TileBase");
                            if(tileComp.getTileType() === this.tileType) {
                                isBonusChain = false;
                            }
                        }
                    }
                }

                this.node.emit("extra_hit", i, j, isBonusChain, timeStep * counter);

                counter = counter + 1;
            }
        }

        return matches;
    }

    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];
        tiles = this.combo === "super" ? this.getTwoBiggestCommonTilesGroups(field, statuses) : this.getBiggestCommonTilesGroup(field, statuses);
        for(let i = 0; i < tiles.length; i++) {
            this.node.emit("goal", "discoball");
        }
        
        const totalTime = this.timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                this.changeTile(tiles[i]);
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("extra_hit", this.row, this.col, false, 0);
            this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false, 0);

            this.node.emit("activate_bonus_pool");
        }, totalTime);

        this.setDicoballComboAnimation(field[this.comboPosition.x][this.comboPosition.y]);

        return matches;
    }

    changeTile(tile: TileBase) {
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), "bomb", true);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    setDicoballComboAnimation(disco: Node) {
        this.playAnimation("bomb_discoball", true);

        let discoComp = disco.getComponent("Discoball");
        if(discoComp) {
            discoComp.activateIsolatedDiscoballAnimation();
        }
    }
}


