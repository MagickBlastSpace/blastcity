import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Billboard')
export class Billboard extends SpecTileBase {

    @property(Node)
    isActive: Node = null;

    @property(Node)
    midLeftBorder: Node = null;
    @property(Node)
    midRightBorder: Node = null;
    @property(Node)
    leftBorder: Node = null;
    @property(Node)
    rightBorder: Node = null;

    private isBorderRendered: boolean = false;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = true;

        this.strength = 1;

        this.refresh();
    }

    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        let fieldComp = field.getComponent("Field");
        this.renderBorders(fieldComp.getTilesArray());
    }

    getDamage(damageType: string) {
        if(this.strength <= 0) {
            return;
        }
        this.strength--;
        this.node.emit("goal", "billboard");

        this.refresh();
    }

    setAsDamaged() {}


    refresh() {
        this.isActive.active = this.strength > 0;
    }


    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }

    isGroupReadyToDestroy(field: Node[][]): boolean {
        let isReady = super.isGroupReadyToDestroy(field);

        if(isReady) {
            let tiles = this.getGroupedTiles(field);
            this.killAll(tiles);
        }

        return isReady;
    }

    killAll(tiles: Node[]) {
        for(let i = 0; i < tiles.length; i++) {
            const tileComp = tiles[i].getComponent("Billboard");
            tileComp.kill();
        }
    }
    
    kill() {
        this.strength = 0;
    }


    renderBorders(field: Node[][]) {
        if(this.isBorderRendered) {
            return;
        }

        let tiles = this.getGroupedTiles(field);

        let rightBorder = this.findRightBorder(tiles);
        let leftBorder = this.findLeftBorder(tiles);

        if(rightBorder !== null) {
            let comp = rightBorder.getComponent("Billboard");
            comp.renderRightBorder();
        }

        if(leftBorder !== null) {
            let comp = leftBorder.getComponent("Billboard");
            comp.renderLeftBorder();
        }

        for(let i = 0; i < tiles.length; i++) {
            if(tiles[i] !== null) {
                let comp = tiles[i].getComponent("Billboard");
                comp.setAsRendered();
            }
        }
    }

    renderRightBorder() {
        this.midRightBorder.active = false;
        this.rightBorder.active = true;
    }

    renderLeftBorder() {
        this.midLeftBorder.active = false;
        this.leftBorder.active = true;
    }



    findRightBorder(tiles: Node[]): Node {
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

    findLeftBorder(tiles: Node[]): Node {
        let tile = tiles[0];
        let colIndex = tile.getComponent("TileBase").getCol();

        for(let i = 0; i < tiles.length; i++) {
            let tileComp = tiles[i].getComponent("TileBase");
            let newIndex = tileComp.getCol();
            if(newIndex < colIndex) {
                colIndex = newIndex;
                tile = tiles[i];
            }
        }

        return tile;
    }

    setAsRendered() {
        this.isBorderRendered = true;
    }
}


