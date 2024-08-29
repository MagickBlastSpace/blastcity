import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Billboard')
export class Billboard extends SpecTileBase {

    @property(Node)
    isActive: Node = null;

    @property(Node)
    lineUpper_left: Node | null = null;
    @property(Node)
    lineUpper_right: Node | null = null;

    @property(Node)
    lineBottom_left: Node | null = null;
    @property(Node)
    lineBottom_right: Node | null = null;

    @property(Node)
    lineRight_upper: Node | null = null;
    @property(Node)
    lineRight_bottom: Node | null = null;

    @property(Node)
    lineLeft_upper: Node | null = null;
    @property(Node)
    lineLeft_bottom: Node | null = null;

    @property(Node)
    cornerUpperLeft: Node | null = null;
    @property(Node)
    cornerUpperRight: Node | null = null;
    @property(Node)
    cornerBottomLeft: Node | null = null;
    @property(Node)
    cornerBottomRight: Node | null = null;

    @property(Node)
    cornerUpperLeft_Outside: Node | null = null;
    @property(Node)
    cornerUpperRight_Outside: Node | null = null;
    @property(Node)
    cornerBottomLeft_Outside: Node | null = null;
    @property(Node)
    cornerBottomRight_Outside: Node | null = null;

    @property(Node)
    background_upper: Node | null = null;
    @property(Node)
    background_right: Node | null = null;
    @property(Node)
    background_upper_right: Node | null = null;

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

        this.playAdditionalAnimation(null, "bulb");

        this.refresh();
    }

    startDestroyConsequences() {
        this.node.emit("goal", "small_safe");

        this.playAnimation("destroy", false, 1);
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

        let numRows = field.length;
        let numCols = field.length > 0 ? field[0].length : 0;

        let upper = this.row === numRows - 1;
        let bottom = this.row === 0;
        let left = this.col === 0;
        let right = this.col === numCols - 1;

        let upper_right = false;
        let bottom_right = false;
        let upper_left = false;
        let bottom_left = false;

        if(!upper) {
            let tile = field[this.row + 1][this.col];
            if(tile !== null) {
                let comp = tile.getComponent("TileBase");
                upper = comp.getTileType() !== this.tileType;
            }
        }
        if(!bottom) {
            let tile = field[this.row - 1][this.col];
            if(tile !== null) {
                let comp = tile.getComponent("TileBase");
                bottom = comp.getTileType() !== this.tileType;
            }
        }
        if(!right) {
            let tile = field[this.row][this.col + 1];
            if(tile !== null) {
                let comp = tile.getComponent("TileBase");
                right = comp.getTileType() !== this.tileType;
            }
        }
        if(!left) {
            let tile = field[this.row][this.col - 1];
            if(tile !== null) {
                let comp = tile.getComponent("TileBase");
                left = comp.getTileType() !== this.tileType;
            }
        }

        if(upper && this.row < numRows - 1 && this.col < numCols - 1) {
            let tile = field[this.row + 1][this.col + 1];
            if(tile !== null) {
                let comp = tile.getComponent("TileBase");
                upper_right = comp.getTileType() === this.tileType;
            }
        }
        if(bottom && this.row > 0 && this.col < numCols - 1) {
            let tile = field[this.row - 1][this.col + 1];
            if(tile !== null) {
                let comp = tile.getComponent("TileBase");
                bottom_right = comp.getTileType() === this.tileType;
            }
        }
        if(upper && this.row < numRows - 1 && this.col > 0) {
            let tile = field[this.row + 1][this.col - 1];
            if(tile !== null) {
                let comp = tile.getComponent("TileBase");
                upper_left = comp.getTileType() === this.tileType;
            }
        }
        if(bottom && this.row > 0 && this.col > 0) {
            let tile = field[this.row - 1][this.col - 1];
            if(tile !== null) {
                let comp = tile.getComponent("TileBase");
                bottom_left = comp.getTileType() === this.tileType;
            }
        }
                    
        let directions = [];
                    
        directions.push(upper);
        directions.push(right);
        directions.push(bottom);
        directions.push(left);

        directions.push(upper_right);
        directions.push(bottom_right);
        directions.push(upper_left);
        directions.push(bottom_left);

        this.renderBorderline(directions);

        this.isBorderRendered = true;
    }

    renderBorderline(direction: boolean[]) { //0-upper, 1-right, 2-bottom, 3-left, 4-upper_right, 5-bottom_right, 6-upper_left, 7-bottom_left
        this.resetAll();

        this.cornerUpperRight.active = direction[0] && direction[1];
        this.cornerBottomRight.active = direction[1] && direction[2];
        this.cornerBottomLeft.active = direction[2] && direction[3];
        this.cornerUpperLeft.active = direction[3] && direction[0];

        this.lineUpper_left.active = direction[0] && !direction[3];
        this.lineUpper_right.active = direction[0] && !direction[1];

        this.lineBottom_left.active = direction[2] && !direction[3];
        this.lineBottom_right.active = direction[2] && !direction[1];

        this.lineLeft_upper.active = direction[3] && !direction[0];
        this.lineLeft_bottom.active = direction[3] && !direction[2];

        this.lineRight_upper.active = direction[1] && !direction[0];
        this.lineRight_bottom.active = direction[1] && !direction[2];

        this.cornerUpperRight_Outside.active = direction[4];
        this.cornerBottomRight_Outside.active = direction[5];
        this.cornerBottomLeft_Outside.active = direction[7];
        this.cornerUpperLeft_Outside.active = direction[6];

        this.background_upper.active = !direction[0];
        this.background_right.active = !direction[1];
        this.background_upper_right.active = !direction[0] && !direction[1];
    }


    resetAll() {
        this.cornerUpperRight.active = false;
        this.cornerBottomRight.active = false;
        this.cornerBottomLeft.active = false;
        this.cornerUpperLeft.active = false;

        this.lineUpper_left.active = false;
        this.lineUpper_right.active = false;

        this.lineBottom_left.active = false;
        this.lineBottom_right.active = false;

        this.lineLeft_upper.active = false;
        this.lineLeft_bottom.active = false;

        this.lineRight_upper.active = false;
        this.lineRight_bottom.active = false;

        this.cornerUpperRight_Outside.active = false;
        this.cornerBottomRight_Outside.active = false;
        this.cornerBottomLeft_Outside.active = false;
        this.cornerUpperLeft_Outside.active = false;

        this.background_upper.active = false;
        this.background_right.active = false;
        this.background_upper_right.active = false;
    }
}


