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
    midBottomBorder: Node = null;
    @property(Node)
    midTopBorder: Node = null;

    @property(Node)
    leftBorder: Node = null;
    @property(Node)
    rightBorder: Node = null;

    @property(Node)
    topBorder: Node = null;
    @property(Node)
    bottomBorder: Node = null;

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

        let billboardType = this.getBillboardType(tiles);
        if(billboardType === "horizontal") {
            for(let i = 0; i < tiles.length; i++) {
                tiles[i].getComponent("Billboard").renderHorizontal();
            }

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
        }
        else {
            for(let i = 0; i < tiles.length; i++) {
                tiles[i].getComponent("Billboard").renderVertical();
            }

            let topBorder = this.findTopBorder(tiles);
            let bottomBorder = this.findBottomBorder(tiles);

            if(topBorder !== null) {
                let comp = topBorder.getComponent("Billboard");
                comp.renderTopBorder();
            }

            if(bottomBorder !== null) {
                let comp = bottomBorder.getComponent("Billboard");
                comp.renderBottomBorder();
            }
        }

        for(let i = 0; i < tiles.length; i++) {
            if(tiles[i] !== null) {
                let comp = tiles[i].getComponent("Billboard");
                comp.setAsRendered();
            }
        }
    }


    renderHorizontal() {
        this.midRightBorder.active = true;
        this.midLeftBorder.active = true;

        this.midTopBorder.active = false;
        this.midBottomBorder.active = false;
    }

    renderVertical() {
        this.midRightBorder.active = false;
        this.midLeftBorder.active = false;

        this.midTopBorder.active = true;
        this.midBottomBorder.active = true;
    }


    renderRightBorder() {
        this.midRightBorder.active = false;
        this.rightBorder.active = true;
    }

    renderLeftBorder() {
        this.midLeftBorder.active = false;
        this.leftBorder.active = true;
    }

    renderTopBorder() {
        this.midTopBorder.active = false;
        this.topBorder.active = true;
    }

    renderBottomBorder() {
        this.midBottomBorder.active = false;
        this.bottomBorder.active = true;
    }


    getBillboardType(tiles: Node[]): string {
        let tile = tiles[0].getComponent("TileBase");

        let colIndex = tile.getCol();
        let rowIndex = tile.getRow();

        let isVertical = false;
        let isHorizontal = false;

        for(let i = 0; i < tiles.length; i++) {
            let tileComp = tiles[i].getComponent("TileBase");

            if(!isHorizontal) {
                let newIndex = tileComp.getCol();
                if(newIndex !== colIndex) {
                    isHorizontal = true;
                }
            }
            
            if(!isVertical) {
                let newIndex = tileComp.getRow();
                if(newIndex !== rowIndex) {
                    isVertical = true;
                }
            }
        }

        /*if(isVertical && isHorizontal) {
            return "mixed";
        }
        else */if(isHorizontal) {
            return "horizontal";
        }
        else if(isVertical) {
            return "vertical";
        }

        return "horizontal";
    }



    findTopBorder(tiles: Node[]): Node {
        let tile = tiles[0];
        let rowIndex = tile.getComponent("TileBase").getRow();

        for(let i = 0; i < tiles.length; i++) {
            let tileComp = tiles[i].getComponent("TileBase");
            let newIndex = tileComp.getRow();
            if(newIndex > rowIndex) {
                rowIndex = newIndex;
                tile = tiles[i];
            }
        }

        return tile;
    }

    findBottomBorder(tiles: Node[]): Node {
        let tile = tiles[0];
        let rowIndex = tile.getComponent("TileBase").getRow();

        for(let i = 0; i < tiles.length; i++) {
            let tileComp = tiles[i].getComponent("TileBase");
            let newIndex = tileComp.getRow();
            if(newIndex < rowIndex) {
                rowIndex = newIndex;
                tile = tiles[i];
            }
        }

        return tile;
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


