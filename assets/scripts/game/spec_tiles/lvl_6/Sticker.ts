
import { _decorator, EventTouch, isValid, Node, sp, Vec2 } from 'cc';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';

const { ccclass, property } = _decorator;

@ccclass('Sticker')
export class Sticker extends SpecTileBase {

    @property(sp.Skeleton)
    crystalBallSpine: sp.Skeleton = null;

    private isTouchAnimating: boolean = false;

    private showStaticCrystalBall(): void {
        const spine = this.crystalBallSpine;

        if (!spine?.skeletonData || !spine.node.isValid || !this.node.isValid) {
            return;
        }

        spine.node.active = true;
        spine.enabled = true;
        spine.timeScale = 1;

        if (!spine.findAnimation('touch')) {
            console.warn('[CRYSTAL BALL] touch animation not found:', this.tileType);
            return;
        }

        spine.clearTracks();
        spine.setToSetupPose();

        const track = spine.setAnimation(0, 'touch', false);

        if (!track) return;

        track.trackTime = 0;
        track.timeScale = 0;

        spine.updateAnimation(0);
    }

    init(row: number, col: number, tileType: string): void {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;
        this.isTouchAnimating = false;

        this.node.off(Node.EventType.TOUCH_END, this.onCrystalBallTouched, this);
        this.node.on(Node.EventType.TOUCH_END, this.onCrystalBallTouched, this);

        this.node.off('touch_feedback', this.onTouchFeedback, this);
        this.node.on('touch_feedback', this.onTouchFeedback, this);

        const spine = this.crystalBallSpine;
        const uiTile = this.node.getComponent(UITile);

        if (spine?.skeletonData) {
            if (uiTile?.spine === spine) {
                uiTile.keepSpineVisible = true;
            }

            this.showStaticCrystalBall();
        }

    }


    private onCrystalBallTouched(event: EventTouch): void {
        const start = event.getUIStartLocation();
        const end = event.getUILocation();

        if (Vec2.distance(start, end) > 12) return;

        this.playCrystalBallTouch();
    }


    private onTouchFeedback(): void {
        this.playCrystalBallTouch();
    }

    private playCrystalBallTouch(): void {
        if (!this.node.isValid || this.isDamaged || this.strength <= 0) return;
        if (this.isTouchAnimating) return;

        const spine = this.crystalBallSpine;

        if (
            !spine?.skeletonData ||
            !isValid(spine.node, true) ||
            !spine.enabled
        ) {
            return;
        }

        if (!spine.findAnimation('touch')) return;

        let track = spine.getCurrent(0);

        if (track?.animation?.name === 'destroy') return;

        try {
            this.isTouchAnimating = true;

            if (
                track?.animation?.name === 'touch' &&
                track.timeScale === 0
            ) {
                track.timeScale = 1;
            }
            else {
                track = spine.setAnimation(0, 'touch', false);

                if (!track) {
                    this.isTouchAnimating = false;
                    return;
                }
            }

            spine.setTrackCompleteListener(track, () => {
                this.isTouchAnimating = false;

                if (
                    !this.node.isValid ||
                    !spine.isValid ||
                    this.isDamaged ||
                    this.strength <= 0
                ) {
                    return;
                }

                this.showStaticCrystalBall();
            });

            spine.setTrackInterruptListener(track, () => {
                this.isTouchAnimating = false;
            });

        } catch (error) {
            this.isTouchAnimating = false;
            console.error('[CRYSTAL BALL TOUCH ERROR]', error);
        }
    }

    playAnimation(
        animation: string,
        isLooped: boolean,
        timeScale: number
    ): void {

        if (
            /^balloon\d+$/i.test(animation) &&
            this.crystalBallSpine &&
            this.crystalBallSpine.skeletonData &&
            isValid(this.crystalBallSpine.node, true)
        ) {
            const uiTile = this.node.getComponent(UITile);

            if (uiTile?.getAnimationsLayout()) {
                this.isTouchAnimating = false;

                uiTile.playAdditionalAnimation(
                    this.crystalBallSpine,
                    'destroy',
                    null
                );

                this.crystalBallSpine.node.active = false;

                return;
            }
        }

        super.playAnimation(animation, isLooped, timeScale);
    }


    getDamage(damageType: string): void {
        if (this.isDamaged) return;

        this.strength--;
        this.setAsDamaged();
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    startDestroyConsequences(): void {
        this.node.emit('goal', 'balloon');
        this.node.emit('goal', 'sticker');

        this.playAnimation('balloon0', false, 1);
    }


    destroyTile(delay: number): void {
        this.node.off(Node.EventType.TOUCH_END, this.onCrystalBallTouched, this);
        this.node.off('touch_feedback', this.onTouchFeedback, this);

        super.destroyTile(delay);
    }


    destroyClear(): void {
        this.node.off(Node.EventType.TOUCH_END, this.onCrystalBallTouched, this);
        this.node.off('touch_feedback', this.onTouchFeedback, this);

        super.destroyClear();
    }
}
