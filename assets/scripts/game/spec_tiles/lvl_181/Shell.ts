import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Shell')
export class Shell extends SpecTileBase {

    @property(Node)
    closed: Node = null;
    @property(Node)
    open: Node = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 2;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }

    refresh() {
        this.closed.active = this.strength === 2;
        this.open.active = this.strength < 2;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "shell");
    }

    startInActionEffect(): boolean {
        if(!this.isDamaged) {
            this.strength = 2;
            this.refresh();
        }
    }
}


