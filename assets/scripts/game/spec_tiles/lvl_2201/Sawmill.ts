import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Sawmill')
export class Sawmill extends SpecTileBase {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    saw: SpriteFrame | null = null;
    @property(SpriteFrame)
    log: SpriteFrame | null = null;

    @property(Node)
    leftBorder: Node = null;
    @property(Node)
    rightBorder: Node = null;

    private isBorderRendered: boolean = false;

    private isGoalEventCreated: boolean = false;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = true;
    }


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.icon.spriteFrame = this.log;

        let fieldComp = field.getComponent("Field");
        let tile = fieldComp.getTile(this.row, this.col - 1);

        if(tile !== null) {
            let tileComp = tile.getComponent("TileBase");
            if(tileComp.getTileType() !== this.getTileType()) {
                this.icon.spriteFrame = this.saw;
            }
        }
        else {
            this.icon.spriteFrame = this.saw;
        }

        this.renderBorders(fieldComp.getTilesArray());
    }


    getDamage(damageType: string) {
        if(!this.isDamaged) {
            this.setAsDamaged();
        }
    }


    startPreActionEffect(field: Node[][]): boolean {
        let group = this.getGroupedTiles(field);

        let isGroupDamaged = this.isDamaged;

        if(!isGroupDamaged) {
            for(let i = 0; i < group.length; i++) {
                let tileComp = group[i].getComponent("Sawmill");
                if(tileComp.isTileDamaged()) {
                    isGroupDamaged = true;
                }
            }
        }

        if(!isGroupDamaged) {
            return false;
        }

        for(let i = 0; i < group.length; i++) {
            let tileComp = group[i].getComponent("Sawmill");
            tileComp.clear();
        }

        if(group.length === 2) {
            for(let i = 0; i < group.length; i++) {
                let tileComp = group[i].getComponent("TileBase");
                this.node.emit("destroy_tile", tileComp.getRow(), tileComp.getCol());

                if(!this.isGoalEventCreated) {
                    this.node.emit("goal", "sawmill");
                    this.isGoalEventCreated = true;
                }
            }
        }
        else {
            let logToCut = this.findRightLog(group);

            let tileComp = logToCut.getComponent("TileBase");
            let logToUpdate = field[this.row][tileComp.getCol() - 1];
            this.node.emit("destroy_tile", tileComp.getRow(), tileComp.getCol());

            let updateComp = logToUpdate.getComponent("Sawmill");
            updateComp.renderRightBorder();
        }

        return true;
    }


    isGroupReadyToDestroy(field: Node[][]): boolean {}

    isTileDamaged(): boolean {
        return this.isDamaged;
    }

    findRightLog(tiles: Node[]): Node {
        let tile = tiles[0];
        let colIndex = tile.getComponent("TileBase").getCol();

        for(let i = 0; i < tiles.length; i++) {
            let tileComp = tiles[i].getComponent("TileBase");
            let newIndex = tileComp.getCol();
            if(newIndex > colIndex) {
                colIndex = newIndex;
                tile = tiles[i];
            }
        }

        return tile;
    }

    findLeftLog(tiles: Node[]): Node {
        let tile = tiles[0];
        let colIndex = tile.getComponent("TileBase").getCol();
        let previousColIndex = colIndex;

        for(let i = 0; i < tiles.length; i++) {
            let tileComp = tiles[i].getComponent("TileBase");
            let newIndex = tileComp.getCol();
            if(newIndex < colIndex) {
                previousColIndex = colIndex;
                colIndex = newIndex;
            }
        }

        tile = tiles[colIndex];

        return tile;
    }


    renderBorders(field: Node[][]) {
        if(this.isBorderRendered) {
            return;
        }

        let tiles = this.getGroupedTiles(field);

        let rightBorder = this.findRightLog(tiles);
        let leftBorder = this.findLeftLog(tiles);

        if(rightBorder !== null) {
            let comp = rightBorder.getComponent("Sawmill");
            comp.renderRightBorder();
        }

        if(leftBorder !== null) {
            let comp = leftBorder.getComponent("Sawmill");
            comp.renderLeftBorder();
        }

        for(let i = 0; i < tiles.length; i++) {
            if(tiles[i] !== null) {
                let comp = tiles[i].getComponent("Sawmill");
                comp.setAsRendered();
            }
        }
    }

    renderRightBorder() {
        this.rightBorder.active = true;
    }

    renderLeftBorder() {
        this.leftBorder.active = true;
    }

    setAsRendered() {
        this.isBorderRendered = true;
    }


    refresh(field: Node[][]) {

    }
}


