import { _decorator, Node, sp } from 'cc';
import { UITile } from '../../ui/UITile';
import { BigTileBase } from './BigTileBase';

const { ccclass, property } = _decorator;

@ccclass('Jars')
export class Jars extends BigTileBase {

    @property([Node])
    hps: Node[] = [];

    @property([sp.Skeleton])
    hps_anim: sp.Skeleton[] = [];

    @property(sp.Skeleton)
    boxSpine: sp.Skeleton = null;

    private readonly jarDestroySpeed: number = 0.7;
    private readonly jarDestroyDuration: number = 1.35;
    private isBoxDestroying: boolean = false;


    private initializeSpineVisuals(): void {
        if (this.tileType !== 'jars') return;

        this.isBoxDestroying = false;

        if (this.boxSpine?.skeletonData) {
            this.boxSpine.node.active = true;
            this.boxSpine.setAnimation(0, 'box_idle', true);
        }

        for (let i = 0; i < this.hps_anim.length; i++) {
            const skeleton = this.hps_anim[i];

            if (!skeleton?.skeletonData) {
                console.warn(`[JARS] Missing Spine for jar ${i}`);
                continue;
            }

            skeleton.node.active = true;
            skeleton.setAnimation(0, 'jar_idle', true);
        }
    }


    private playJarAnimation(index: number, animation: string, loop: boolean): void {
        const skeleton = this.hps_anim[index];

        if (!skeleton?.skeletonData) {
            console.warn(`[JARS] Missing Spine for jar ${index}`);
            return;
        }

        skeleton.node.active = true;
        skeleton.setAnimation(0, animation, loop);
    }


    private playBoxHit(): void {
        if (!this.boxSpine?.skeletonData || this.isBoxDestroying) return;

        this.boxSpine.node.active = true;
        this.boxSpine.setAnimation(0, 'box_hit', false);
        this.boxSpine.addAnimation(0, 'box_idle', true, 0);
    }


    private destroyJar(index: number): void {
        const skeleton = this.hps_anim[index];

        if (!skeleton?.skeletonData) return;

        skeleton.node.active = true;

        skeleton.timeScale = this.jarDestroySpeed;

        skeleton.clearTracks();
        skeleton.setAnimation(0, 'jar_destroy', false);

        this.scheduleOnce(() => {
            if (skeleton.isValid && skeleton.node.isValid) {
                skeleton.node.active = false;
            }
        }, this.jarDestroyDuration);
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strength = 9;
        this.refresh();

        if (this.tileType === 'jars') {
            const uiTile = this.node.getComponent(UITile);

            if (uiTile) {
                uiTile.keepSpineVisible = true;
                uiTile.useSpineDestroyOnly = true;
            }
        }
    }


    start() {
        if (this.tileType !== 'jars') return;

        this.initializeSpineVisuals();
    }


    getDamage(damageType: string) {
        if (this.tileType !== 'jars') return;
        if (this.strength <= 0) return;

        this.strength--;

        this.node.emit('goal', 'jars');

        const destroyedJarIndex = this.strength;

        this.destroyJar(destroyedJarIndex);

        if (this.strength > 0) {
            this.playBoxHit();
            this.playDamageSound();
        } else {
            this.isBoxDestroying = true;

            if (this.boxSpine?.skeletonData) {
                this.boxSpine.node.active = true;

                this.boxSpine.clearTracks();
                this.boxSpine.setAnimation(0, 'box_destroy', false);

                console.log('[JARS] FINAL DESTROY START', {
                    row: this.row,
                    col: this.col,
                    animation: this.boxSpine.getCurrent(0)?.animation?.name
                });
            }
        }

        this.refresh();
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    refresh() {
        if (this.tileType !== 'jars') return;

        for (const oldJar of this.hps) {
            if (oldJar) {
                oldJar.active = false;
            }
        }
    }


    startDestroyConsequences() {
        if (this.tileType !== 'jars') {
            this.playAnimation('destroy', false, 1);
            return;
        }

        console.log('[JARS] DESTROY CONSEQUENCES', {
            row: this.row,
            col: this.col,
            strength: this.strength,
            boxAnimation: this.boxSpine?.getCurrent(0)?.animation?.name
        });
    }


    playDamageSound() {
        const soundIndex = this.strength % 2;
        this.playSound(soundIndex);
    }
}
