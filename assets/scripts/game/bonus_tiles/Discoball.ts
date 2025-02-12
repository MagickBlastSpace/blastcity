import { _decorator, Component, Node, Sprite, SpriteFrame, Vec2, tween, Vec3 } from 'cc';
import { BonusTileBase } from './BonusTileBase';
import { SpriteTileData } from '../Tile';
const { ccclass, property } = _decorator;

@ccclass('Discoball')
export class Discoball extends BonusTileBase {

    @property(SpriteFrame)
    multi: SpriteFrame = null;
    @property(SpriteFrame)
    super: SpriteFrame = null;

    @property([SpriteTileData])
    multiIcons: SpriteTileData[] = [];
    @property([SpriteTileData])
    superIcons: SpriteTileData[] = [];

    @property(Sprite)
    icon: Sprite = null;

    private primaryColor: string = "";
    private secondaryColor: string = "";

    private disco_disco_time: number = 0.7;

    
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
        
        let tilesToDestroy = isBlockingCombo ? this.getMatchesClear(field, statuses) : this.getMatchesByType(field, statuses);

        return tilesToDestroy;
    }


    getMatchesClear(field: Node[][], statuses: Node[][]): Node[] {
        if(this.isActivated) {
            return;
        }

        this.activateFastAnimation();

        let matches = [];
        
        let tiles = [];
        tiles = this.tileType === "super" ? this.getTwoBiggestCommonTilesGroups(field, statuses) : this.getBiggestCommonTilesGroup(field, statuses);

        this.isActivated = true;

        for(let i = 0; i < tiles.length; i++) {
            this.node.emit("goal", "discoball");
        }

        tiles.push(this);

        for(let i = 0; i < tiles.length; i++) {
            try {
                this.renderLine(new Vec2(this.row, this.col), new Vec2(tiles[i].getRow(), tiles[i].getCol()));
            }
            catch (error) {
                console.log("Render Line Error: " + error);
            }

            this.node.emit("extra_hit_with_damage", tiles[i].getRow(), tiles[i].getCol());
        }

        this.scheduleOnce(() => {
            this.node.emit("clear_lines");
        }, 0.2);

        this.setRespawnEvent(0.2);

        return matches;
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

        let tiles = [];
        tiles = this.tileType === "super" ? this.getTwoBiggestCommonTilesGroups(field, statuses) : this.getBiggestCommonTilesGroup(field, statuses);

        this.isActivated = true;

        for(let i = 0; i < tiles.length; i++) {
            tiles[i].startShake();

            this.node.emit("goal", "discoball");
        }

        tiles.push(this);

        let totalTime = this.timeBetweenTiles * tiles.length;
        totalTime = totalTime < this.disco_combo_time ? this.disco_combo_time : totalTime;

        this.activateIsolatedDiscoballAnimation(this.disco_combo_time / totalTime);

        this.setRespawnEvent(totalTime + 0.05);

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    this.renderLine(new Vec2(this.row, this.col), new Vec2(tiles[i].getRow(), tiles[i].getCol()));
                }
                catch (error) {
                    console.log("Render Line Error: " + error);
                }
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("clear_lines");

            for(let i = 0; i < tiles.length; i++) {
                this.node.emit("extra_hit_with_damage", tiles[i].getRow(), tiles[i].getCol());
            }
        }, totalTime - 0.05);

        this.playDiscoballSound();

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

        let totalTime = this.timeBetweenTiles * tiles.length;
        totalTime = totalTime < this.disco_combo_time ? this.disco_combo_time : totalTime;

        this.activateDiscoballComboAnimation(field);
        this.activateIsolatedDiscoballAnimation(this.disco_combo_time / totalTime);

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    this.renderLine(new Vec2(this.row, this.col), new Vec2(tiles[i].getRow(), tiles[i].getCol()));
                }
                catch (error) {
                    console.log("Render Line Error: " + error);
                }

                const rocketString = Math.floor(Math.random() * 2) === 0 ? "rocket_vertical" : "rocket_horizontal";
                this.changeTile(tiles[i], rocketString);
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("clear_lines");

            this.node.emit("extra_hit", this.row, this.col, false, 0);
            this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false, 0);

            this.node.emit("activate_bonus_pool");
        }, totalTime);

        this.playComboSound();

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

        let totalTime = this.timeBetweenTiles * tiles.length;
        totalTime = totalTime < this.disco_combo_time ? this.disco_combo_time : totalTime;

        this.activateDiscoballComboAnimation(field);
        this.activateIsolatedDiscoballAnimation(2.0 / totalTime);

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    this.renderLine(new Vec2(this.row, this.col), new Vec2(tiles[i].getRow(), tiles[i].getCol()));
                }
                catch (error) {
                    console.log("Render Line Error: " + error);
                }

                this.changeTile(tiles[i], "bomb");
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("clear_lines");

            this.node.emit("extra_hit", this.row, this.col, false, 0);
            this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false, 0);

            this.node.emit("activate_bonus_pool");
        }, totalTime);

        this.playComboSound();

        return matches;
    }

    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        this.activateDiscoballComboAnimation(field);
        this.playAnimation("discoball_discoball", false, 1);
        this.playDoubleDiscoballSound();
        this.playHideAnimation(this.icon.node);

        this.scheduleOnce(() => {
            for(let i = 0; i < numRows; i++) {
                for(let j = 0; j < numCols; j++) {
                    let isBonusChain = this.isChain(i, j);
                    this.node.emit("extra_hit", i, j, isBonusChain, 0);
        
                    this.node.emit("goal", "discoball");
                }
            }
        }, this.disco_disco_time);

        this.setRespawnEvent(this.disco_disco_time);

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

                this.node.emit("extra_hit", i, j, true, 0);

                this.node.emit("goal", "discoball");
            }
        }

        this.clearTiles();

        this.setRespawnEvent(this.respawnDelay * 2);

        this.scheduleOnce(() => {
            this.getDiscoballComboMatches(field, statuses);
        }, this.respawnDelay);

        this.playDoubleDiscoballSound();

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

    isChain(row: number, col: number) {
        return row !== this.row && col !== this.col && row !== this.row + 1 && row !== this.row - 1 && col !== this.col + 1 && col !== this.col - 1;
    }


    activateDiscoballComboAnimation(field: Node[][]) {
        let tile = field[this.comboPosition.x][this.comboPosition.y];
        let tileComp = tile.getComponent("BonusTileBase");

        if(tileComp) {
            let tileType = tileComp.getTileType();
            let anim = "";
            switch(tileType) {
                case "bomb":
                    anim = "bomb_discoball";
                    break;
                case "rocket_vertical":
                    anim = "rocket_discoball_vert";
                    break;
                case "rocket_horizontal":
                    anim = "rocket_discoball_hor";
                    break;
                case "multi":
                    anim = "destroy";
                    this.playHideAnimation(tile);
                    break;
            }
            tileComp.playAnimation(anim, true, 1);
        }
    }

    playHideAnimation(nodeToHide: Node) {
        tween(nodeToHide)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();
    }

    activateIsolatedDiscoballAnimation(timeScale: number) {
        if(this.tileType === "multi") {
            let colorString = "0";
            switch(this.primaryColor) {
                case "yellow":
                    colorString = "1";
                    break;
                case "red":
                    colorString = "2";
                    break;
                case "blue":
                    colorString = "3";
                    break;
                case "green":
                    colorString = "4";
                    break;
                case "purple":
                    colorString = "5";
                    break;
                case "orange":
                    colorString = "6";
                    break;
            }

            let time = timeScale < 1 ? timeScale : 1;

            this.playAnimation("discoball_color" + colorString, false, time);
        }
    }

    activateFastAnimation() {
        if(this.tileType === "multi") {
            let colorString = "0";
            switch(this.primaryColor) {
                case "yellow":
                    colorString = "1";
                    break;
                case "red":
                    colorString = "2";
                    break;
                case "blue":
                    colorString = "3";
                    break;
                case "green":
                    colorString = "4";
                    break;
                case "purple":
                    colorString = "5";
                    break;
                case "orange":
                    colorString = "6";
                    break;
            }

            this.playAnimation("discoball_color" + colorString, false, 10);
        }
    }


    setColor(primaryColor: string, secondaryColor: string) {
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;

        if(this.tileType === "multi") {
            this.icon.spriteFrame = this.multiIcons.find(i => i.id === primaryColor)?.icon;
        }
        
    }
}


