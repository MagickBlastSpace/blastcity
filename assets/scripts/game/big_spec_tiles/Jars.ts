
import { _decorator, EventTouch, Node, sp, tween, Tween, Vec2, Vec3 } from 'cc';
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

    private readonly jarDestroySpeed: number = 1.6;
    private readonly jarDestroyDuration: number = 0.8667 / this.jarDestroySpeed;

    private readonly stainTweenStartTime: number = 0.55;

    private readonly stainScaleMin: number = 0.4;
    private readonly stainScaleMax: number = 0.8;

    private readonly stainOffsetMin: number = 8;
    private readonly stainOffsetMax: number = 15;

    private readonly stainTweenDuration: number = 0.45;

    private isBoxDestroying: boolean = false;

    private jarBasePositions: Vec3[] = [];
    private jarBaseScales: Vec3[] = [];


    private cacheJarTransforms(): void {
        for(let i = 0; i < this.hps_anim.length; i++) {
            const skeleton = this.hps_anim[i];
            if(!skeleton?.node?.isValid) continue;

            if(!this.jarBasePositions[i]) {
                this.jarBasePositions[i] = skeleton.node.position.clone();
            }

            if(!this.jarBaseScales[i]) {
                this.jarBaseScales[i] = skeleton.node.scale.clone();
            }
        }
    }


    private resetJarTransform(index: number): void {
        const skeleton = this.hps_anim[index];
        if(!skeleton?.node?.isValid) return;

        Tween.stopAllByTarget(skeleton.node);

        const position = this.jarBasePositions[index];
        const scale = this.jarBaseScales[index];

        if(position) skeleton.node.setPosition(position);
        if(scale) skeleton.node.setScale(scale);

        skeleton.timeScale = 1;
    }


    private getRandomStainOffset(): number {
        const distance = this.stainOffsetMin +
            Math.random() * (this.stainOffsetMax - this.stainOffsetMin);

        return Math.random() < 0.5 ? -distance : distance;
    }


    private getRandomStainScale(): number {
        return this.stainScaleMin +
            Math.random() * (this.stainScaleMax - this.stainScaleMin);
    }


    private applyStainTransform(index: number): void {
        if(this.isBoxDestroying) return;

        const skeleton = this.hps_anim[index];
        if(!skeleton?.node?.isValid) return;

        const basePosition = this.jarBasePositions[index];
        const baseScale = this.jarBaseScales[index];

        if(!basePosition || !baseScale) return;

        const offsetX = this.getRandomStainOffset();
        const offsetY = this.getRandomStainOffset();
        const randomScale = this.getRandomStainScale();

        const targetPosition = new Vec3(
            basePosition.x + offsetX,
            basePosition.y + offsetY,
            basePosition.z
        );

        const targetScale = new Vec3(
            baseScale.x * randomScale,
            baseScale.y * randomScale,
            baseScale.z
        );

        Tween.stopAllByTarget(skeleton.node);

        tween(skeleton.node)
            .to(
                this.stainTweenDuration,
                {
                    position: targetPosition,
                    scale: targetScale
                },
                {
                    easing: 'sineOut'
                }
            )
            .start();

        console.log('[JARS STAIN TWEEN]', {
            index,
            scale: randomScale.toFixed(2),
            offsetX: offsetX.toFixed(1),
            offsetY: offsetY.toFixed(1)
        });
    }


    private initializeSpineVisuals(): void {
        if(this.tileType !== 'jars') return;

        this.isBoxDestroying = false;
        this.cacheJarTransforms();

        if(this.boxSpine?.skeletonData) {
            this.boxSpine.node.active = true;
            this.boxSpine.enabled = true;
            this.boxSpine.timeScale = 1;
            this.boxSpine.clearTracks();
            this.boxSpine.setToSetupPose();
            this.boxSpine.setAnimation(0, 'box_idle', true);
        }

        for(let i = 0; i < this.hps_anim.length; i++) {
            const skeleton = this.hps_anim[i];

            if(!skeleton?.skeletonData) {
                console.warn(`[JARS] Missing Spine for jar ${i}`);
                continue;
            }

            this.resetJarTransform(i);

            skeleton.node.active = true;
            skeleton.enabled = true;
            skeleton.clearTracks();
            skeleton.setToSetupPose();
            skeleton.setAnimation(0, 'jar_idle', true);
        }
    }


    private onJarsTouched(event: EventTouch): void {
        if(Vec2.distance(event.getUIStartLocation(), event.getUILocation()) > 12) return;

        this.playJarsTouch();
    }


    private playJarsTouch(): void {
        if(this.tileType !== 'jars' || this.isBoxDestroying || this.strength <= 0) return;
        if(!this.boxSpine?.skeletonData) return;

        const currentBoxAnimation = this.boxSpine.getCurrent(0)?.animation?.name;

        if(currentBoxAnimation && currentBoxAnimation !== 'box_idle') return;
        if(!this.boxSpine.findAnimation('box_touch')) return;

        this.boxSpine.node.active = true;
        this.boxSpine.timeScale = 1;
        this.boxSpine.setAnimation(0, 'box_touch', false);
        this.boxSpine.addAnimation(0, 'box_idle', true, 0);

        for(let i = 0; i < this.strength; i++) {
            const skeleton = this.hps_anim[i];

            if(!skeleton?.skeletonData || !skeleton.findAnimation('jar_touch')) continue;

            const currentAnimation = skeleton.getCurrent(0)?.animation?.name;

            if(currentAnimation && currentAnimation !== 'jar_idle') continue;

            skeleton.node.active = true;
            skeleton.timeScale = 1;
            skeleton.setAnimation(0, 'jar_touch', false);
            skeleton.addAnimation(0, 'jar_idle', true, 0);
        }

        console.log('[JARS TOUCH]', {
            row: this.row,
            col: this.col,
            remaining: this.strength
        });
    }


    private playBoxHit(): void {
        if(!this.boxSpine?.skeletonData || this.isBoxDestroying) return;

        this.boxSpine.node.active = true;
        this.boxSpine.timeScale = 1;
        this.boxSpine.setAnimation(0, 'box_hit', false);
        this.boxSpine.addAnimation(0, 'box_idle', true, 0);
    }


    private destroyJar(index: number, onComplete?: () => void): void {
        const skeleton = this.hps_anim[index];

        if(!skeleton?.skeletonData) {
            console.warn(`[JARS] Missing Spine for jar ${index}`);
            onComplete?.();
            return;
        }

        this.resetJarTransform(index);

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.timeScale = this.jarDestroySpeed;

        skeleton.clearTracks();
        skeleton.setToSetupPose();

        const track = skeleton.setAnimation(0, 'jar_destroy', false);

        if(!track) {
            console.warn('[JARS] jar_destroy animation missing:', index);
            onComplete?.();
            return;
        }

        if(!onComplete) {
            this.scheduleOnce(() => {
                if(!this.node.isValid || this.isBoxDestroying) return;
                if(!skeleton.node.isValid) return;

                this.applyStainTransform(index);
            }, this.stainTweenStartTime / this.jarDestroySpeed);
        }

        skeleton.setTrackCompleteListener(track, () => {
            if(!this.node.isValid || !skeleton.isValid) return;
            onComplete?.();
        });

        console.log('[JARS DESTROY]', {
            index,
            remaining: this.strength
        });
    }


    private hideAllJarStains(): void {
        for(const skeleton of this.hps_anim) {
            if(!skeleton?.node?.isValid) continue;

            Tween.stopAllByTarget(skeleton.node);
            skeleton.clearTracks();
            skeleton.node.active = false;
        }

        console.log('[JARS] All stains hidden');
    }


    private startBoxDestroy(): void {
        if(!this.node.isValid) return;

        this.hideAllJarStains();

        if(!this.boxSpine?.skeletonData) return;

        this.boxSpine.node.active = true;
        this.boxSpine.enabled = true;
        this.boxSpine.timeScale = 1;
        this.boxSpine.clearTracks();
        this.boxSpine.setToSetupPose();
        this.boxSpine.setAnimation(0, 'box_destroy', false);

        console.log('[JARS] FINAL DESTROY START', {
            row: this.row,
            col: this.col
        });
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strength = 9;
        this.isBoxDestroying = false;

        this.refresh();

        if(this.tileType === 'jars') {
            const uiTile = this.node.getComponent(UITile);

            if(uiTile) {
                uiTile.keepSpineVisible = true;
                uiTile.useSpineDestroyOnly = true;
            }

            this.node.off(Node.EventType.TOUCH_END, this.onJarsTouched, this);
            this.node.on(Node.EventType.TOUCH_END, this.onJarsTouched, this);

            this.node.off('touch_feedback', this.playJarsTouch, this);
            this.node.on('touch_feedback', this.playJarsTouch, this);
        }
    }


    start() {
        if(this.tileType !== 'jars') return;

        this.initializeSpineVisuals();
    }


    getDamage(damageType: string) {
        if(this.tileType !== 'jars' || this.strength <= 0) return;

        this.strength--;
        this.node.emit('goal', 'jars');

        const destroyedJarIndex = this.strength;

        if(this.strength > 0) {
            this.destroyJar(destroyedJarIndex);
            this.playBoxHit();
            this.playDamageSound();
        } else {
            this.isBoxDestroying = true;

            this.destroyJar(destroyedJarIndex, () => {
                this.startBoxDestroy();
            });
        }

        this.refresh();
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    refresh() {
        if(this.tileType !== 'jars') return;

        for(const oldJar of this.hps) {
            if(oldJar) oldJar.active = false;
        }
    }


    startDestroyConsequences() {
        if(this.tileType !== 'jars') {
            this.playAnimation('destroy', false, 1);
            return;
        }

        console.log('[JARS] DESTROY CONSEQUENCES', {
            row: this.row,
            col: this.col,
            strength: this.strength
        });
    }


    destroyTile(delay: number) {
        this.node.off(Node.EventType.TOUCH_END, this.onJarsTouched, this);
        this.node.off('touch_feedback', this.playJarsTouch, this);

        const destroyDelay = this.tileType === 'jars'
            ? Math.max(delay, this.jarDestroyDuration + 0.65)
            : delay;

        super.destroyTile(destroyDelay);
    }


    destroyClear() {
        this.node.off(Node.EventType.TOUCH_END, this.onJarsTouched, this);
        this.node.off('touch_feedback', this.playJarsTouch, this);

        for(const skeleton of this.hps_anim) {
            if(skeleton?.node?.isValid) Tween.stopAllByTarget(skeleton.node);
        }

        super.destroyClear();
    }


    playDamageSound() {
        const soundIndex = this.strength % 2;
        this.playSound(soundIndex);
    }
}
