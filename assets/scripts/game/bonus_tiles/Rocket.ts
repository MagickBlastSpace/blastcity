import { _decorator, Component, Node, tween, Vec3, SpriteFrame, Sprite, Vec2} from 'cc';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

@ccclass('Rocket')
export class Rocket extends BonusTileBase {

    @property(SpriteFrame)
    rocketVertical: SpriteFrame = null;
    @property(SpriteFrame)
    rocketHorizontal: SpriteFrame = null;

    @property(Sprite)
    icon: Sprite = null;

    private bombCombo_Delay: number = 0.3;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.icon.spriteFrame = this.tileType === 'rocket_vertical' ? this.rocketVertical : this.rocketHorizontal;
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

        this.playAnimation(this.tileType, false, 1);

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

        this.playAnimation("rocket_rocket", false, 1);
        this.playComboSound();

        this.rowExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
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

            this.setRespawnEvent(0);
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
        const rocketType = Math.floor(Math.random() * 2);
        const rocketString = rocketType === 0 ? "rocket_vertical" : "rocket_horizontal";
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), rocketString, true);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    setDicoballComboAnimation(disco: Node, timeScale: number) {
        let anim = this.tileType === "rocket_vertical" ? "rocket_discoball_vert" : "rocket_discoball_hor";
        this.playAnimation(anim, true, 1);

        let discoComp = disco.getComponent("Discoball");
        if(discoComp) {
            discoComp.activateIsolatedDiscoballAnimation(timeScale);
        }
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


