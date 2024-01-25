import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Penguin } from '../lvl_751/Penguin';
const { ccclass, property } = _decorator;

@ccclass('Stone')
export class Stone extends Penguin {

    @property(SpriteFrame)
    hp5: SpriteFrame | null = null;

    private isGoalEventCreated: boolean = false;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = true;

        this.strength = 5;
        this.refresh();
    }

    refresh() {
        super.refresh();

        if(this.strength === 5) {
            this.picture.spriteFrame = this.hp5;
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
}


