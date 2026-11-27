import { _decorator, Component, sp, tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UISpecGoalEffect')
export class UISpecGoalEffect extends Component {

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    private lifeTime: number = 0.6;
    private onFinished: (() => void) | null = null;
    private isFinished: boolean = false;

    init(
        startPosition: Vec2,
        targetPosition: Vec2,
        onFinished?: () => void
    ): void {
        this.onFinished = onFinished ?? null;
        this.isFinished = false;

        this.node.setPosition(startPosition.x, startPosition.y);

        this.playAnimation();

        tween(this.node)
            .to(this.lifeTime, {
                position: new Vec3(targetPosition.x, targetPosition.y, 0)
            })
            .call(() => {
                this.playEndAnimation();
            })
            .start();
    }

    playAnimation(): void {
        try {
            if(this.spine?.skeletonData && this.spine.findAnimation('fly')) {
                this.spine.setAnimation(0, 'fly', true);
            }
        } catch(error) {
            console.error('[GOAL EFFECT] Fly animation failed:', error);
        }
    }

    private playEndAnimation(): void {
        try {
            if(!this.spine?.skeletonData || !this.spine.findAnimation('end')) {
                this.finish();
                return;
            }

            const entry = this.spine.setAnimation(0, 'end', false);

            if(!entry) {
                this.finish();
                return;
            }

            this.spine.setTrackCompleteListener(entry, () => this.finish());
            this.spine.setTrackInterruptListener(entry, () => this.finish());
            this.spine.setTrackEndListener(entry, () => this.finish());

        } catch(error) {
            console.error('[GOAL EFFECT] End animation failed:', error);
            this.finish();
        }
    }

    private notifyFinished(): void {
        if(this.isFinished) return;

        this.isFinished = true;

        const callback = this.onFinished;
        this.onFinished = null;

        callback?.();
    }

    private finish(): void {
        this.notifyFinished();

        if(this.node?.isValid) {
            this.node.destroy();
        }
    }

    protected onDestroy(): void {
        this.notifyFinished();
    }
}
