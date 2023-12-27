import { _decorator, Component, Node, Label } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('SmallSafe')
export class SmallSafe extends SpecTileBase {
    @property(Label)
    hpLabel: Label = null;

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
        if(this.isClosed) {
            this.hpLabel.string = "Close";
        }
        else {
            this.hpLabel.string = "Open";
        }
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


