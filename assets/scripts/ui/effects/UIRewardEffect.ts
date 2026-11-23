import { _decorator, Component, isValid, tween, Vec2, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('UIRewardEffect')
export class UIRewardEffect extends Component {

    private lifeTime: number = 1.2;

    init(
        startPosition: Vec2,
        targetPosition: Vec2,
        onArrive?: () => void
    ): void {
        this.node.setPosition(startPosition.x, startPosition.y);

        tween(this.node)
            .to(
                this.lifeTime,
                {
                    position: new Vec3(
                        targetPosition.x,
                        targetPosition.y,
                        0
                    )
                }
            )
            .call(() => {
                if(!isValid(this.node, true)) return;

                try {
                    onArrive?.();
                } finally {
                    if(isValid(this.node, true)) {
                        this.node.destroy();
                    }
                }
            })
            .start();
    }
}
