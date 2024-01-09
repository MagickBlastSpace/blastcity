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

    private diamonds: number = 0;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isClosed = false;
        this.strength = 1;
        this.diamonds = 1;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(!this.isClosed) {
            if(this.diamonds > 0) {
                this.diamonds--;
                console.log("goal event");
            }
            this.strength--;
        }
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }

    refresh() {
        this.closed.active = this.isClosed;
        this.open.active = !this.isClosed;
    }

    startInActionEffect(field: Node[][]): boolean {
        this.isClosed = !this.isClosed;

        this.refresh();

        return true;
    }
}


