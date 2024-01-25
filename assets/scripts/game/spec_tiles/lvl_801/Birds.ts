import { _decorator, Component, Node } from 'cc';
import { MagicHat } from '../lvl_31/MagicHat';
const { ccclass, property } = _decorator;

@ccclass('Birds')
export class Birds extends MagicHat {

    private fieldNode: Node = null;
    private destroyTileCallback: Function = null;


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;

        this.destroyTileCallback = (tileType) => {
            if(tileType === "birds") {
                this.goalCount--;

                if(this.goalCount <= 0) {
                    this.node.emit("destroy_tile", this.getRow(), this.getCol());
                    this.node.emit("respawn", 0.2);
                }
            }
        };

        field.on("spawn", this.destroyTileCallback);
    }

    destroyTile() {
        this.fieldNode.off("spawn", this.destroyTileCallback);

        super.destroyTile();
    }

    destroyClear() {
        this.fieldNode.off("spawn", this.destroyTileCallback);

        super.destroyClear();
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isGrouped = false;
    }

    getDamage(damageType: string) {
        if(this.isDamaged || this.isInactive || this.goalCount <= 0) {
            return;
        }
        this.setAsDamaged();

        this.node.emit("goal", "birds");
    }


    subscribeOnGoals(goals: GoalData[]) {
        this.goalCount = 0;

        for(let i = 0; i < goals.length; i++) {
            if(goals[i].id === this.tileType) {
                this.goalCount = goals[i].count;
                return;
            }
        }
    }

    isReadyToDestroy(): boolean {
        return false;
    }
}


