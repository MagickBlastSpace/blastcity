import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Shell')
export class Shell extends SpecTileBase {

    @property(SpriteFrame)
    open: SpriteFrame = null;
    @property(SpriteFrame)
    closed: SpriteFrame = null;

    @property(Sprite)
    icon: Sprite = null;

    private extraDamageAvailable: boolean = false;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 2;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(!this.isDamaged || (this.extraDamageAvailable && damageType === "bonus")) {
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
        this.icon.spriteFrame = this.strength === 1 ? this.open : this.closed;
    }

    startDestroyConsequences() {
        this.playAnimation("goal", false, 1);

        this.node.emit("goal", "shell");
    }

    startInActionEffect(field: Node[][], statuses: Node[][], isBlockingAction: boolean): boolean {
        if(isBlockingAction) {
            return;
        }
        
        if(!this.isDamaged) {
            this.strength = 2;
            this.refresh();
        }
    }

    clearExtra() {
        this.extraDamageAvailable = true;
    }
}


