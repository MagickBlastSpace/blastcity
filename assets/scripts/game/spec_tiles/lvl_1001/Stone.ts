import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Penguin } from '../lvl_751/Penguin';
const { ccclass, property } = _decorator;

@ccclass('Stone')
export class Stone extends Penguin {

    @property(Node)
    midLeftBorder: Node = null;
    @property(Node)
    midRightBorder: Node = null;
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

        this.strength = 5;
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


    refresh() {
        super.refresh();

        if(this.strength === 5) {
            this.picture.spriteFrame = null;
        }
    }

    setAsDamaged() {}

    isGroupReadyToDestroy(field: Node[][]): boolean {
        let tiles = this.getGroupedTiles(field);

        if(this.isReadyToDestroy()) {
            this.killAll(tiles);
            return true;
        }
        
        for(let i = 0; i < tiles.length; i++) {
            const tileComp = tiles[i].getComponent("SpecTileBase");
            if(tileComp.isReadyToDestroy()) {
                this.killAll(tiles);
                return true;
            }
        }

        return false;
    }

    
    killAll(tiles: Node[]) {
        if(!this.isGoalEventCreated) {
            this.node.emit("goal", "stone");
            this.isGoalEventCreated = true;
        }

        for(let i = 0; i < tiles.length; i++) {
            const tileComp = tiles[i].getComponent("Stone");
            tileComp.kill();
        }
    }
    
    kill() {
        if(!this.isGoalEventCreated) {
            this.node.emit("goal", "stone");
            this.isGoalEventCreated = true;
        }
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
            let comp = rightBorder.getComponent("Stone");
            comp.renderRightBorder();
        }

        if(leftBorder !== null) {
            let comp = leftBorder.getComponent("Stone");
            comp.renderLeftBorder();
        }

        for(let i = 0; i < tiles.length; i++) {
            if(tiles[i] !== null) {
                let comp = tiles[i].getComponent("Stone");
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


