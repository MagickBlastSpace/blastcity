import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Pump')
export class Pump extends SpecTileBase {

    @property(Node)
    inactiveState: Node = null;

    private fieldNode: Node = null;
    private goalCompleteCallback: Function = null;

    private isInactive: boolean = false;

    private isGenerate: boolean = false;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = false;
    }

    getDamage(damageType: string) {
        if(this.isDamaged || this.isInactive) {
            return;
        }
        this.setAsDamaged();
    }

    startInActionEffect(field: Node[][]): boolean {
        if(this.isDamaged) {
            this.node.emit("special", "sticker");
        }

        return true;
    }


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;

        this.goalCompleteCallback = (tileType) => {
            if(tileType === "sticker") {
                this.setInactiveState();
            }
        };

        field.on("goal_complete", this.goalCompleteCallback);
    }


    setInactiveState() {
        this.isInactive = true;
        this.inactiveState.active = true;
    }

    destroyTile() {
        this.fieldNode.off("goal_complete", this.goalCompleteCallback);

        super.destroyTile();
    }

    destroyClear() {
        this.fieldNode.off("goal_complete", this.goalCompleteCallback);

        super.destroyClear();
    }
}


