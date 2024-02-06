import { _decorator, Component, Node } from 'cc';
import { WashingMachine } from './WashingMachine';
const { ccclass, property } = _decorator;

@ccclass('BigSafe')
export class BigSafe extends WashingMachine {

    @property(Node)
    closed: Node = null;
    @property(Node)
    open: Node = null;

    private isClosed: boolean = true;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isClosed = true;
        this.strength = 6;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(!this.isClosed && !this.isDamaged) {
            this.strength--;
            this.node.emit("goal", "big_safe");
            this.setAsDamaged();
        }
        else {
            if(damageType === "bonus") {
                this.setAsDamaged();
            }
        }
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }

    refresh() {
        super.refresh();

        this.closed.active = this.isClosed;
        this.open.active = !this.isClosed;
    }

    startPreActionEffect(field: Node[][]): boolean {
        if(this.isDamaged && this.isClosed) {
            this.isClosed = false;
        }

        this.refresh();

        return false;
    }

    startDestroyConsequences() {}

    clearExtra() {
        if(!this.isClosed) {
            this.isDamaged = false;
        }
    }
}


