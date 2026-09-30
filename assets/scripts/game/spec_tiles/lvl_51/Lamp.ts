import { _decorator, Sprite, SpriteFrame } from 'cc';
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

        this.setIsShifts(true);
        this.setStrength(2);
        this.refresh();
    }


    getDamage(damageType: string) {
        if (!this.isTileDamaged()) {
            this.setStrength(this.getStrength() - 1);
            this.setAsDamaged();

            if (this.getStrength() > 0) {
                this.playDamageSound();
            }
        }

        this.refresh();
    }


    isReadyToDestroy(): boolean {
        return this.getStrength() <= 0;
    }


    destroyTile(delay: number) {
        const hasVFX = this.node.getComponent('LampVFX') !== null;

        if (hasVFX) {
            super.destroyTile(Math.max(delay, 0.75));
            return;
        }

        super.destroyTile(delay);
    }


    refresh() {
        this.icon.spriteFrame =
            this.getStrength() === 1 ? this.hp1 : this.hp2;
    }


    startDestroyConsequences() {
        this.node.emit("lamp_break_vfx");

        this.node.emit("goal", "lamp");
        this.node.emit(
            "goal_effect",
            "lamp",
            this.getRow(),
            this.getCol()
        );
    }


    clearExtra() {
        this.clear();
    }


    playDamageSound() {
        this.playSound(0);
    }
}
