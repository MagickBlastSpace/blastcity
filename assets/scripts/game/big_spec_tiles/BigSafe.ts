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
        for(let i = 0; i < this.hps.length; i++) {
            this.hps[i].active = false;
        }

        for(let i = 0; i < this.strength && i < this.hps.length; i++) {
            this.hps[i].active = true;
        }

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


    getCustomParameter(): number {
        if(this.isClosed) {
            return 1;
        }
        return 0;
    }

    setCustomParameter(index: number) {
        this.isClosed = index === 1;

        this.refresh();
    }
}


