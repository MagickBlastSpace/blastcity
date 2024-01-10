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
    }


    getDamage(damageType: string) {
        if(!this.isDamaged) {
            this.setAsDamaged();
        }
    }


    startInActionEffect(field: Node[][]): boolean {
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

        if(group.length <= 2) {
            for(let i = 0; i < group.length; i++) {
                let tileComp = group[i].getComponent("TileBase");
                this.node.emit("destroy_tile", tileComp.getRow(), tileComp.getCol());

                this.node.emit("goal", "sawmill");
            }
        }
        else {
            let logToCut = this.findRightLog(group);
            let tileComp = logToCut.getComponent("TileBase");
            this.node.emit("destroy_tile", tileComp.getRow(), tileComp.getCol());
        }
        
        this.node.emit("respawn", 0.15);

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
}


