import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Bomb')
export class Bomb extends BonusTileBase {
    
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
            matches = matches.concat(this.getMatchesByCombo(field, statuses));
            return matches;
        }

        matches = matches.concat(this.getBombMatches(field, statuses, this.row, this.col));

        return matches;
    }


    getBombMatches(field: Node[][], statuses: Node[][], row: number, col: number): Node[] {
        let matches = [];

        for(let i = this.row - 1; i <= this.row + 1; i++) {
            for(let j = this.col - 1; j <= this.col + 1; j++) {
                let isBonusChain = i !== this.row || j !== this.col; 
                this.node.emit("extra_hit", i, j, isBonusChain);
            }
        }

        this.setRespawnEvent(0.2);

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
            matches = this.getDiscoballComboMatches(field, this.combo);
        }

        return matches;
    }

    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
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

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

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

                this.node.emit("extra_hit", i, j, isBonusChain);
            }
        }

        this.setRespawnEvent(0.2);

        return matches;
    }

    getDiscoballComboMatches(field: Node[][], discoballType: string): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const timeBetweenTiles = 0.05;

        let tiles = [];
        if(this.availableColors.includes(this.tileType)) {
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
        }
        else {
            tiles = this.getBiggestCommonTilesGroup(field);
            const multiTile = field[this.comboPosition.x][this.comboPosition.y];
            if(multiTile !== null && multiTile !== undefined) {
                const multiTileComp = multiTile.getComponent("TileBase");
                tiles.push(multiTileComp);
            }
        }

        const totalTime = timeBetweenTiles * tiles.length;
        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                this.changeTile(tiles[i], totalTime - timeBetweenTiles * i);
            }, timeBetweenTiles * i);
        }

        this.setRespawnEvent(totalTime + 1);

        this.setDicoballComboAnimation();

        return matches;
    }

    changeTile(tile: TileBase, timeToDestroy: number) {
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), "bomb", timeToDestroy);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);

        this.scheduleOnce(() => {
            this.node.emit("extra_hit", this.row, this.col, false);
        }, timeToRespawn);
    }

    setDicoballComboAnimation() {
        tween(this.node)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();
    }
}


