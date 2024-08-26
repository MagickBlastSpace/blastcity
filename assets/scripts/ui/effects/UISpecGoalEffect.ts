import { _decorator, Component, Node, Vec2, Vec3, tween, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UISpecGoalEffect')
export class UISpecGoalEffect extends Component {

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    private lifeTime: number = 0.6;


    init(startPosition: Vec2, targetPosition: Vec2) {
        this.node.setPosition(startPosition.x, startPosition.y);

        tween(this.node)
            .to(this.lifeTime, { position: new Vec3(targetPosition.x, targetPosition.y, 0) })
            .start();

        this.playAnimation();
    }


    playAnimation() {
        //console.log("Playing spec anim");
        try {
            if(this.spine) {
                //console.log("Success");
                this.spine.setAnimation(0, "fly", true);
                
                this.scheduleOnce(() => {
                    this.spine.setAnimation(0, 'end', false);

                    this.spine.setCompleteListener(() => {
                        this.node.destroy();
                    });
                }, this.lifeTime);
            }
        } catch (error) {
            console.error('Error setting spec effect spine animation:', error);
        }
    }
}


