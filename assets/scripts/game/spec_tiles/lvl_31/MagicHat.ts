import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('MagicHat')
export class MagicHat extends SpecTileBase {

    @property(Node)
    inactiveState: Node = null;
    @property(Node)
    activeState: Node = null;

    private fieldNode: Node = null;
    private goalCompleteCallback: Function = null;

    private isInactive: boolean = false;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = true;
    }

    getDamage(damageType: string) {
        if(this.isDamaged || this.isInactive) {
            return;
        }
        this.setAsDamaged();
        this.node.emit("goal", "magic_hat");
    }


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;

        this.goalCompleteCallback = (tileType) => {
            if(tileType === "magic_hat") {
                this.setInactiveState();
            }
        };

        field.on("goal_complete", this.goalCompleteCallback);
    }


    setInactiveState() {
        this.isInactive = true;
        this.inactiveState.active = true;
        this.activeState.active = false;
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


