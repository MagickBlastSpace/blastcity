import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Lamp')
export class Lamp extends SpecTileBase {

    @property(SpriteFrame)
    hp1: SpriteFrame = null;
    @property(SpriteFrame)
    hp2: SpriteFrame = null;

    @property(Sprite)
    icon: Sprite = null;

    
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

            if(this.strength > 0) {
                this.playDamageSound();
            }
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
        this.icon.spriteFrame = this.strength === 1 ? this.hp1 : this.hp2;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "lamp");
        this.node.emit("goal_effect", "lamp", this.row, this.col);

        this.playAnimation("destroy", false, 1);
    }

    clearExtra() {
        this.isDamaged = false;
    }


    playDamageSound() {
        this.playSound(0);
    }
}


