import { _decorator, Component, Node } from 'cc';
import { Sawmill } from './Sawmill';
const { ccclass, property } = _decorator;

@ccclass('Sawmill_Vertical')
export class Sawmill_Vertical extends Sawmill {
    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.icon.spriteFrame = this.log;

        let fieldComp = field.getComponent("Field");
        let tile = fieldComp.getTile(this.row - 1, this.col);

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
            let logToCut = this.findUpperLog(group);
            let tileComp = logToCut.getComponent("TileBase");
            this.node.emit("destroy_tile", tileComp.getRow(), tileComp.getCol());
        }

        return true;
    }

    findUpperLog(tiles: Node[]): Node {
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
}


