import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIExtraHitEffect')
export class UIExtraHitEffect extends Component {

    private lifeTime: number = 0.3;


    init(startPosition: Vec2) {
        this.node.setPosition(startPosition.x, startPosition.y);

        this.scheduleOnce(() => {
            this.node.destroy();
        }, this.lifeTime);
    }
}


