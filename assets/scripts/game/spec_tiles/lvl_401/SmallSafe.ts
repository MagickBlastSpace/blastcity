import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('SmallSafe')
export class SmallSafe extends SpecTileBase {
    @property(Node)
    closed: Node = null;
    @property(Node)
    open: Node = null;

    private isClosed: boolean = true;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isClosed = true;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(!this.isClosed && !this.isDamaged) {
            console.log("diamond plus");
        }
        this.node.emit("damage_all", this.tileType);
    }

    refresh() {
        this.closed.active = this.isClosed;
        this.open.active = !this.isClosed;
    }

    startInActionEffect(field: Node[][]): boolean {
        if(this.isDamaged && this.isClosed) {
            this.isClosed = false;
        }
        else {
            this.isClosed = true;
        }

        this.refresh();

        return true;
    }
}


