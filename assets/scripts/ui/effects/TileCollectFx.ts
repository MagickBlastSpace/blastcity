import {
    _decorator,
    Component,
    sp,
    tween,
    Tween,
    Vec3
} from 'cc';

const { ccclass, property } = _decorator;


export type TileCollectSkin =
    | 'blue'
    | 'green'
    | 'red'
    | 'violet'
    | 'yellow'
    | 'yellow_bomb';


@ccclass('TileCollectFx')
export class TileCollectFx extends Component {

    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;

    @property
    testOnStart: boolean = false;

    @property
    testSkin: string = 'blue';

    @property
    testTravelDistance: number = 500;

    @property
    testTravelDuration: number = 0.25;


    private readonly collapseAnimation = 'collaps';
    private readonly travelAnimation = 'travel';
    private readonly absorbAnimation = 'absorb';

    private readonly slotName = 'tile';
    private readonly firstAttachment = 'tile_1';


    protected onLoad() {

        if(!this.skeleton) {
            this.skeleton = this.getComponent(sp.Skeleton);
        }

        if(!this.skeleton) {
            console.error(
                '[TileCollectFx] sp.Skeleton component not found'
            );

            return;
        }

        this.skeleton.setAnimationCacheMode(
            sp.Skeleton.AnimationCacheMode.REALTIME
        );
    }


    protected start() {

        if(!this.testOnStart) {
            return;
        }

        const skin = this.normalizeSkin(this.testSkin);

        this.setSkin(skin);

        const startPosition = this.node.position.clone();

        const targetPosition = new Vec3(
            startPosition.x + this.testTravelDistance,
            startPosition.y,
            startPosition.z
        );

        this.playFullSequence(
            targetPosition,
            this.testTravelDuration,
            () => {
                console.log(
                    '[TileCollectFx] Test sequence finished'
                );
            }
        );
    }

    public setSkin(skinName: TileCollectSkin) {

        if(!this.skeleton) {
            return;
        }

        this.skeleton.setSkin(skinName);

        this.skeleton.setToSetupPose();

        this.skeleton.setAttachment(
            this.slotName,
            this.firstAttachment
        );
    }

    public playCollapse(
        onComplete?: (completed: boolean) => void
    ): void {
        this.playOnce(this.collapseAnimation, onComplete);
    }

    public playAbsorb(
        onComplete?: (completed: boolean) => void
    ): void {
        this.playOnce(this.absorbAnimation, onComplete);
    }


    public playTravel(): void {
        if (!this.skeleton || !this.node.isValid) {
            return;
        }

        this.skeleton.setAnimation(
            0,
            this.travelAnimation,
            true
        );
    }

    public travelTo(
        targetPosition: Vec3,
        duration: number = 0.25,
        onComplete?: (completed: boolean) => void
    ) {
        if (!this.skeleton || !this.node.isValid) {
            onComplete?.(false);
            return;
        }

        this.playTravel();

        const currentPosition = this.node.position;

        const dx = targetPosition.x - currentPosition.x;
        const dy = targetPosition.y - currentPosition.y;

        const angle =
            Math.atan2(dy, dx) *
            180 /
            Math.PI;

        this.node.setRotationFromEuler(
            0,
            0,
            angle
        );

        Tween.stopAllByTarget(this.node);

        this.node.setScale(
            new Vec3(1, 1, 1)
        );

        tween(this.node)
            .to(
                0.05,
                {
                    scale: new Vec3(
                        1.7,
                        0.75,
                        1
                    )
                },
                {
                    easing: 'sineOut'
                }
            )
            .to(
                duration,
                {
                    position: targetPosition
                },
                {
                    easing: 'sineInOut'
                }
            )
            .call(() => {
                if (!this.node.isValid) {
                    onComplete?.(false);
                    return;
                }

                this.node.setScale(new Vec3(1, 1, 1));
                onComplete?.(true);
            })
            .start();
    }

    public playFullSequence(
        targetPosition: Vec3,
        travelDuration: number = 0.25,
        onComplete?: (completed: boolean) => void
    ): void {
        this.playCollapse((collapseCompleted) => {
            if (!collapseCompleted) {
                onComplete?.(false);
                return;
            }

            this.travelTo(
                targetPosition,
                travelDuration,
                (travelCompleted) => {
                    if (!travelCompleted) {
                        onComplete?.(false);
                        return;
                    }

                    this.playAbsorb((absorbCompleted) => {
                        onComplete?.(absorbCompleted);
                    });
                }
            );
        });
    }

    private playOnce(
        animationName: string,
        onComplete?: (completed: boolean) => void
    ): void {
        if (!this.skeleton || !this.node.isValid) {
            console.warn(`[TileCollectFx] Skeleton unavailable: ${animationName}`);
            onComplete?.(false);
            return;
        }

        let entry: sp.spine.TrackEntry;

        try {
            entry = this.skeleton.setAnimation(
                0,
                animationName,
                false
            );
        } catch (error) {
            console.error(`[TileCollectFx] Failed to start: ${animationName}`, error);
            onComplete?.(false);
            return;
        }

        if (!entry) {
            console.error(`[TileCollectFx] Animation not found: ${animationName}`);
            onComplete?.(false);
            return;
        }

        let finished = false;

        const finish = (
            completed: boolean,
            reason: string
        ): void => {
            if (finished) return;

            finished = true;

            if (!completed) {
                console.warn(
                    `[TileCollectFx] ${reason}: ${animationName}, ` +
                    `node=${this.node.name}`
                );
            }

            onComplete?.(completed);
        };

        this.skeleton.setTrackCompleteListener(
            entry,
            () => finish(true, 'complete')
        );

        this.skeleton.setTrackInterruptListener(
            entry,
            () => finish(false, 'interrupt')
        );

        this.skeleton.setTrackEndListener(
            entry,
            () => finish(false, 'end')
        );
    }

    private normalizeSkin(
        value: string
    ): TileCollectSkin {

        switch(value) {

            case 'green':
                return 'green';

            case 'red':
                return 'red';

            case 'violet':
                return 'violet';

            case 'yellow':
                return 'yellow';

            case 'yellow_bomb':
                return 'yellow_bomb';

            case 'blue':
            default:
                return 'blue';
        }
    }


    protected onDestroy() {
        Tween.stopAllByTarget(this.node);
    }
}
