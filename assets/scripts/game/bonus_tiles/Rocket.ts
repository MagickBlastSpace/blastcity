import { _decorator, Component, Node, tween, Vec3, SpriteFrame, Sprite } from 'cc';
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

        switch(this.tileType) {
            case 'rocket_vertical':
                this.playAnimation("vertical", false);

                this.colExtraHit(field, this.row, this.col);
                break;
            case 'rocket_horizontal':
                this.playAnimation("horizontal", false);

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

        this.playAnimation("rocket", false);

        this.rowExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.playAnimation("bomb", false);

        this.rowExtraHit(field, this.row, this.col);
        this.rowExtraHit(field, this.row + 1, this.col);
        this.rowExtraHit(field, this.row - 1, this.col);

        this.colExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col + 1);
        this.colExtraHit(field, this.row, this.col - 1);

        return matches;
    }


    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.playAnimation("discoball", true);

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
        const rocketType = Math.floor(Math.random() * 2);
        const rocketString = rocketType === 0 ? "rocket_vertical" : "rocket_horizontal";
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), rocketString, true);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    setDicoballComboAnimation(disco: Node) {
        tween(this.node)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();

        tween(disco)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();
    }
}


