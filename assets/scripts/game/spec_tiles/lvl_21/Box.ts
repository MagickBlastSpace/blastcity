import { _decorator, sp } from 'cc';
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
    }


    getDamage(damageType: string) {
        if (damageType === 'bonus') {
            this.strength--;
        }
        else if (!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    refresh() {
        if (!this.boxSpine || this.strength <= 0) {
            return;
        }

        let idleAnimation = '';

        switch (this.strength) {
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
        if (!this.boxSpine) {
            return;
        }

        this.boxSpine.setAnimation(0, hitAnimation, false);
        this.boxSpine.addAnimation(0, idleAnimation, true, 0);
    }


    protected playBoxDestroyAnimation() {
        if (!this.boxSpine) {
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
}
