import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Pump')
export class Pump extends SpecTileBase {

    @property(Node)
    inactiveState: Node = null;

    private isInactive: boolean = false;

    private isGenerate: boolean = false;

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
            if(tileType === "sticker") {
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
    }

    startInActionEffect(field: Node[][]): boolean {
        if(this.isDamaged) {
            this.node.emit("special", "sticker");
        }

        return false;
    }


    subscribeOnGoals(goals: GoalData[]) {
        this.goalCount = 0;

        for(let i = 0; i < goals.length; i++) {
            if(goals[i].id === "sticker") {
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
    }
}


