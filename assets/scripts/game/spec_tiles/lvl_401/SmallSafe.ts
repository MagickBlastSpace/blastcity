import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('SmallSafe')
export class SmallSafe extends SpecTileBase {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    closed: SpriteFrame = null;
    @property(SpriteFrame)
    open: SpriteFrame = null;

    private isClosed: boolean = true;

    private diamonds: number = 0;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.isClosed = false;
        this.strength = 1;
        this.diamonds = 1;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(!this.isClosed) {
            if(this.diamonds > 0) {
                this.diamonds--;
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
        this.icon.spriteFrame = this.isClosed ? this.closed : this.open;
    }

    startInActionEffect(field: Node[][]): boolean {
        this.isClosed = !this.isClosed;

        this.refresh();

        return false;
    }


    startDestroyConsequences() {
        this.node.emit("goal", "small_safe");
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


