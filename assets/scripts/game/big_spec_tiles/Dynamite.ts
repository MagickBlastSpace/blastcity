import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { CosmoRocket } from './CosmoRocket';
import { SpriteTileData } from '../Tile';
const { ccclass, property } = _decorator;

@ccclass('Dynamite')
export class Dynamite extends CosmoRocket {

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    colorIcons: SpriteTileData[] = [];

    private fieldNode: Node = null;
    private destroyTileCallback: Function = null;

    private damageType = "blue";

    private brickWallGroup: Node[] = [];


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strength = Math.floor(Math.random() * 15);
        if(this.strength < 5) {
            this.strength = 5;
        }

        this.refresh();
    }


    startDestroyConsequences() {
        for(let i = 0; i < this.brickWallGroup.length; i++) {
            if(this.brickWallGroup[i] !== null) {
                let tileComp = this.brickWallGroup[i].getComponent("TileBase");
                this.node.emit("destroy_tile", tileComp.getRow(), tileComp.getCol());
            }
        }
    }

    

    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;
        let availableColors = field.getComponent("Field").getAvailableColors();
        let colorIndex = Math.floor(Math.random() * availableColors.length);
        this.damageType = availableColors[colorIndex];

        this.icon.spriteFrame = this.colorIcons.find(i => i.id === this.damageType)?.icon;

        this.destroyTileCallback = (tileType) => {
            if(tileType === this.damageType) {
                this.getDamageFromEvent();
            }
        };

        field.on("destroy", this.destroyTileCallback);

        let fieldArray = field.getComponent("Field").getTilesArray();
        let adj = this.getAdjacentTiles(fieldArray);
        for(let i = 0; i < adj.length; i++) {
            if(adj[i] !== null) {
                let tileComp = adj[i].getComponent("TileBase");
                if(tileComp.getTileType() === "brick_wall") {
                    let group = tileComp.getGroupedTiles(fieldArray);
                    group.push(adj[i]);
                    this.brickWallGroup = group;
                    return;
                }
            }
        }
    }

    destroyTile() {
        this.fieldNode.off("destroy", this.destroyTileCallback);

        super.destroyTile();
    }

    destroyClear() {
        this.fieldNode.off("destroy", this.destroyTileCallback);

        super.destroyClear();
    }


    getAdjacentTiles(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(this.row < numRows - 2) {
            matches.push(field[this.row + 2][this.col]);
            matches.push(field[this.row + 2][this.col + 1]);
        }
        if(this.row > 0) {
            matches.push(field[this.row - 1][this.col]);
            matches.push(field[this.row - 1][this.col + 1]);
        }
        if(this.col < numCols - 2) {
            matches.push(field[this.row][this.col + 2]);
            matches.push(field[this.row + 1][this.col + 2]);
        }
        if(this.col > 0) {
            matches.push(field[this.row][this.col - 1]);
            matches.push(field[this.row + 1][this.col - 1]);
        }

        return matches;
    }
}


