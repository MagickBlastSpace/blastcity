
import { _decorator, EventTouch, Node, sp, Vec2 } from 'cc';
import { SpecTileBase } from '../SpecTileBase';

const { ccclass, property } = _decorator;

@ccclass('Box')
export class Box extends SpecTileBase {

    @property(sp.Skeleton)
    boxSpine: sp.Skeleton = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.strength = 1;

        this.refresh();

        if(!this.boxSpine?.skeletonData ||
           !this.boxSpine.findAnimation('touch_3')) {
            return;
        }

        this.node.off(Node.EventType.TOUCH_END, this.onBoxTouched, this);
        this.node.on(Node.EventType.TOUCH_END, this.onBoxTouched, this);
    }


    private onBoxTouched(event: EventTouch): void {
        if(Vec2.distance(event.getUIStartLocation(), event.getUILocation()) > 12) return;

        this.playBoxTouch();
    }


    private playBoxTouch(): void {
        if(!this.boxSpine?.skeletonData || this.strength <= 0) return;
        if(this.strength > 3) return;

        const animationIndex = 4 - this.strength;
        const idleAnimation = `idle_${animationIndex}`;
        const touchAnimation = `touch_${animationIndex}`;

        if(!this.boxSpine.findAnimation(touchAnimation)) {
            console.warn(`[BOX] Animation ${touchAnimation} not found`);
            return;
        }

        const currentAnimation = this.boxSpine.getCurrent(0)?.animation?.name;

        if(currentAnimation && currentAnimation !== idleAnimation) return;

        this.boxSpine.node.active = true;
        this.boxSpine.enabled = true;

        this.boxSpine.setAnimation(0, touchAnimation, false);
        this.boxSpine.addAnimation(0, idleAnimation, true, 0);

        console.log('[BOX TOUCH]', {
            row: this.row,
            col: this.col,
            strength: this.strength,
            animation: touchAnimation
        });
    }


    getDamage(damageType: string) {
        if(damageType === 'bonus') {
            this.strength--;
        }
        else if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    refresh() {
        if(!this.boxSpine || this.strength <= 0) return;

        let idleAnimation = '';

        switch(this.strength) {
            case 3:
                idleAnimation = 'idle_1';
                break;

            case 2:
                idleAnimation = 'idle_2';
                break;

            case 1:
                idleAnimation = 'idle_3';
                break;

            default:
                return;
        }

        this.boxSpine.setAnimation(0, idleAnimation, true);
    }


    protected playHitAnimation(
        hitAnimation: string,
        idleAnimation: string
    ) {
        if(!this.boxSpine) return;

        this.boxSpine.setAnimation(0, hitAnimation, false);
        this.boxSpine.addAnimation(0, idleAnimation, true, 0);
    }


    protected playBoxDestroyAnimation() {
        if(!this.boxSpine) {
            this.playAnimation('crate', false, 1);
            return;
        }

        this.playAdditionalAnimation(
            this.boxSpine,
            'destroy',
            this.boxSpine.node
        );
    }


    startDestroyConsequences() {
        this.node.emit('goal', 'box');

        this.playBoxDestroyAnimation();
    }


    destroyTile(delay: number) {
        this.node.off(Node.EventType.TOUCH_END, this.onBoxTouched, this);

        super.destroyTile(delay);
    }


    destroyClear() {
        this.node.off(Node.EventType.TOUCH_END, this.onBoxTouched, this);

        super.destroyClear();
    }
}
