import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Billboard')
export class Billboard extends SpecTileBase {

    @property(Node)
    isActive: Node = null;

    private isGoalEventCreated: boolean = false;

    
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = true;

        this.strength = 1;

        this.refresh();
    }

    getDamage(damageType: string) {
        if(this.strength <= 0) {
            return;
        }
        this.strength--;

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
        if(!this.isGoalEventCreated) {
            this.node.emit("goal", "billboard");
            this.isGoalEventCreated = true;
        }

        for(let i = 0; i < tiles.length; i++) {
            const tileComp = tiles[i].getComponent("Billboard");
            tileComp.kill();
        }
    }
    
    kill() {
        this.strength = 0;
        this.isGoalEventCreated = true;
    }
}


