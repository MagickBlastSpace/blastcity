import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
import { GoalData } from '../../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('MagicHat')
export class MagicHat extends SpecTileBase {

    @property(Node)
    inactiveState: Node = null;
    @property(Node)
    activeState: Node = null;

    private isInactive: boolean = false;

    private goalCount: number = 0;

    private fieldNode: Node = null;
    private destroyTileCallback: Function = null;


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;

        this.destroyTileCallback = (tileType) => {
            if(tileType === "magic_hat") {
                this.goalCount--;

                if(this.goalCount <= 0) {
                    this.setInactiveState();
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

        this.isShifts = false;
        this.isGrouped = false;
    }

    getDamage(damageType: string) {
        if(this.isDamaged || this.isInactive || this.goalCount <= 0) {
            return;
        }
        this.setAsDamaged();
        
        this.node.emit("goal", "magic_hat");
        this.node.emit("goal_effect", "magic_hat", this.row, this.col);

        if(this.goalCount > 0) {
            this.playGoalSound();
        }
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


    setInactiveState() {
        this.isInactive = true;
        this.inactiveState.active = true;
        this.activeState.active = false;

        this.playInactiveSound();
    }

    clearExtra() {
        this.isDamaged = false;
    }


    getCustomParameter(): number {
        return this.goalCount;
    }

    setCustomParameter(index: number) {
        this.goalCount = index;

        if(this.goalCount <= 0) {
            this.setInactiveState();
        }
    }


    playInactiveSound() {
        this.playSound(1);
    }

    playGoalSound() {
        this.playSound(0);
    }
}


