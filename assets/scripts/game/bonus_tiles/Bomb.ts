import { _decorator, Component, Node, tween, Vec3, Vec2, Sprite } from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Bomb')
export class Bomb extends BonusTileBase {

    @property(Sprite)
    icon: Sprite = null;

    private bombCombo_Delay: number = 0.3;
    private rocketCombo_Delay: number = 0.3;

    private isBonusPoolState: boolean = false;


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

        this.playAnimation("bomb", false, 1);

        const totalTime = this.respawnDelay / 2;
        const timeStep = totalTime / 9;

        let counter = 0;
        
        for(let i = this.row - 1; i <= this.row + 1; i++) {
            for(let j = this.col - 1; j <= this.col + 1; j++) {
                let isBonusChain = i !== this.row || j !== this.col
                isBonusChain = isBonusChain && !this.isBonusPoolState; 
                
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

        this.playAnimation("rocket_bomb", false, 1);
        this.playComboSound();
        this.playHideAnimation(this.icon.node);
        this.hideCombinationNode(field);

        this.scheduleOnce(() => {
            this.rowExtraHit(field, this.row, this.col);
            this.rowExtraHit(field, this.row + 1, this.col);
            this.rowExtraHit(field, this.row - 1, this.col);

            this.colExtraHit(field, this.row, this.col);
            this.colExtraHit(field, this.row, this.col + 1);
            this.colExtraHit(field, this.row, this.col - 1);

            this.setRespawnEvent(this.respawnDelay);
        }, this.rocketCombo_Delay);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.playAnimation("bomb_bomb", false, 1);
        this.playComboSound();
        this.playHideAnimation(this.icon.node);
        this.hideCombinationNode(field);

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const totalTime = this.respawnDelay / 2;
        const timeStep = totalTime / 49;

        let counter = 0;

        this.scheduleOnce(() => {
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

            this.setRespawnEvent(timeStep * counter);
        }, this.bombCombo_Delay);

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
        
        let totalTime = this.timeBetweenTiles * tiles.length;
        totalTime = totalTime < this.disco_combo_time ? this.disco_combo_time : totalTime;

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    let comboComp = field[this.comboPosition.x][this.comboPosition.y].getComponent("TileBase");
                    if(comboComp) {
                        this.renderLine(new Vec2(comboComp.getRow(), comboComp.getCol()), new Vec2(tiles[i].getRow(), tiles[i].getCol()));
                    }
                }
                catch (error) {
                    console.log("Render Line Error: " + error);
                }

                this.changeTile(tiles[i]);
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("clear_lines");

            this.node.emit("extra_hit", this.row, this.col, false, 0);
            this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false, 0);

            this.node.emit("activate_bonus_pool");
        }, totalTime);

        this.setDicoballComboAnimation(field[this.comboPosition.x][this.comboPosition.y], this.disco_combo_time / totalTime);

        this.playComboSound();

        return matches;
    }

    changeTile(tile: TileBase) {
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), "bomb", true);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    setDicoballComboAnimation(disco: Node, timeScale: number) {
        this.playAnimation("bomb_discoball", true, 1);

        let discoComp = disco.getComponent("Discoball");
        if(discoComp) {
            discoComp.activateIsolatedDiscoballAnimation(timeScale);
        }
    }

    setBonusPoolAnimation() {
        this.isBonusPoolState = true;

        this.scheduleOnce(() => {
            this.playAnimation("bomb_discoball", true, 1);
        }, 0.2);
    }


    hideCombinationNode(field: Node[][]) {
        let tile = field[this.comboPosition.x][this.comboPosition.y];
        this.playHideAnimation(tile);
    }

    playHideAnimation(nodeToHide: Node) {
        tween(nodeToHide)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();
    }
}


