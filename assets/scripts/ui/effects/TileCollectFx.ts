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
        onComplete?: () => void
    ) {

        this.playOnce(
            this.collapseAnimation,
            onComplete
        );
    }

    public playTravel() {

        if(!this.skeleton) {
            return;
        }

        this.skeleton.setCompleteListener(null);

        this.skeleton.setAnimation(
            0,
            this.travelAnimation,
            true
        );
    }

    public travelTo(
        targetPosition: Vec3,
        duration: number = 0.25,
        onComplete?: () => void
    ) {
        if(!this.skeleton) {
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

                this.node.setScale(
                    new Vec3(1, 1, 1)
                );

                onComplete?.();
            })
            .start();
    }

    public playAbsorb(
        onComplete?: () => void
    ) {

        this.playOnce(
            this.absorbAnimation,
            onComplete
        );
    }

    public playFullSequence(
        targetPosition: Vec3,
        travelDuration: number = 0.25,
        onComplete?: () => void
    ) {

        this.playCollapse(() => {

            this.travelTo(
                targetPosition,
                travelDuration,
                () => {

                    this.playAbsorb(() => {

                        onComplete?.();

                    });

                }
            );

        });
    }

    private playOnce(
        animationName: string,
        onComplete?: () => void
    ) {

        if(!this.skeleton) {
            return;
        }


        this.skeleton.setCompleteListener(null);


        const entry =
            this.skeleton.setAnimation(
                0,
                animationName,
                false
            );


        if(!entry) {

            console.error(
                `[TileCollectFx] Animation "${animationName}" not found`
            );

            onComplete?.();

            return;
        }


        this.skeleton.setCompleteListener(
            (completedEntry) => {

                const completedAnimation =
                    completedEntry.animation?.name;


                if(
                    completedAnimation !==
                    animationName
                ) {
                    return;
                }


                this.skeleton.setCompleteListener(null);

                onComplete?.();
            }
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
