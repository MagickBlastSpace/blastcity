
import { _decorator, sp, Sprite, SpriteFrame } from 'cc';
import { UITile } from '../../../ui/UITile';
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

    @property(sp.Skeleton)
    flashlightSpine: sp.Skeleton = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.setIsShifts(true);
        this.setStrength(2);
        this.refresh();

        if (this.flashlightSpine?.skeletonData) {
            this.flashlightSpine.node.active = true;
            this.flashlightSpine.setAnimation(0, 'idle_1', true);
        }

        this.node.off('lamp_touch', this.playLampTouch, this);
        this.node.on('lamp_touch', this.playLampTouch, this);

        this.node.off('touch_feedback', this.playLampTouch, this);
        this.node.on('touch_feedback', this.playLampTouch, this);
    }

    getDamage(damageType: string) {
        if (!this.isTileDamaged()) {
            this.setStrength(this.getStrength() - 1);
            this.setAsDamaged();

            if (this.getStrength() === 1) {
                this.playFirstHit();
                this.playDamageSound();
            }
        }

        this.refresh();
    }


    private playFirstHit(): void {
        const spine = this.flashlightSpine;

        if (!spine?.skeletonData) {
            return;
        }

        spine.setAnimation(0, 'hit_1', false);
        spine.addAnimation(0, 'idle_2', true, 0);
    }


    private playLampTouch(): void {
        const spine = this.flashlightSpine;

        if (
            !this.node.isValid ||
            !spine?.skeletonData ||
            !spine.node.activeInHierarchy
        ) {
            return;
        }

        const strength = this.getStrength();

        if (strength !== 1 && strength !== 2) return;

        const currentAnimation = spine.getCurrent(0)?.animation?.name ?? '';

        if (
            currentAnimation.startsWith('hit_') ||
            currentAnimation.startsWith('touch_')
        ) {
            return;
        }

        const touchAnimation = strength === 2 ? 'touch_1' : 'touch_2';
        const idleAnimation = strength === 2 ? 'idle_1' : 'idle_2';

        if (
            !spine.findAnimation(touchAnimation) ||
            !spine.findAnimation(idleAnimation)
        ) {
            console.warn('[LAMP TOUCH] Animation not found:', touchAnimation);
            return;
        }

        spine.setAnimation(0, touchAnimation, false);

        spine.addAnimation(0, idleAnimation, true, 0);
    }

    isReadyToDestroy(): boolean {
        return this.getStrength() <= 0;
    }


    destroyTile(delay: number) {
        this.node.off('lamp_touch', this.playLampTouch, this);
        this.node.off('touch_feedback', this.playLampTouch, this);

        const lampVFX = this.node.getComponent('LampVFX');
        const hasVFX = lampVFX !== null && lampVFX.enabled;

        if (hasVFX) {
            super.destroyTile(Math.max(delay, 0.75));
            return;
        }

        super.destroyTile(delay);
    }


    destroyClear() {
        this.node.off('lamp_touch', this.playLampTouch, this);
        this.node.off('touch_feedback', this.playLampTouch, this);

        super.destroyClear();
    }


    refresh() {
        if (this.icon) {
            this.icon.spriteFrame =
                this.getStrength() === 1 ? this.hp1 : this.hp2;
        }
    }


    startDestroyConsequences() {
        const spine = this.flashlightSpine;
        const uiTile = this.node.getComponent(UITile);

        if (spine?.skeletonData) {
            if (uiTile?.getAnimationsLayout()) {
                this.playAdditionalAnimation(spine, 'hit_2', null);
                spine.node.active = false;
            } else {
                spine.setAnimation(0, 'hit_2', false);
            }
        } else {
            this.node.emit('lamp_break_vfx');
        }

        this.node.emit('goal', 'lamp');

        this.node.emit(
            'goal_effect',
            'lamp',
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
