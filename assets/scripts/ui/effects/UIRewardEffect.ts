import { _decorator, Component, Node, Vec2, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIRewardEffect')
export class UIRewardEffect extends Component {

    private lifeTime: number = 1.2;


    init(startPosition: Vec2, targetPosition: Vec2) {
        this.node.setPosition(startPosition.x, startPosition.y);

        tween(this.node)
            .to(this.lifeTime, { position: new Vec3(targetPosition.x, targetPosition.y, 0) })
            .call(() => this.node.destroy())
            .start();
    }
}


