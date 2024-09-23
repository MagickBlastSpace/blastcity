import { _decorator, Component, Node, Button, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonAnimator')
export class ButtonAnimator extends Component {

    start() {
        const button = this.node.getComponent(Button);

        if (button) {
            this.node.on(Node.EventType.TOUCH_START, this.onButtonPressed, this);
            this.node.on(Node.EventType.TOUCH_END, this.onButtonReleased, this);
            this.node.on(Node.EventType.TOUCH_CANCEL, this.onButtonReleased, this);
        }
    }

    onButtonPressed() {
        tween(this.node)
            .to(0.2, { scale: new Vec3(1.1, 1.1, 1) })
            .start();
    }

    onButtonReleased() {
        tween(this.node)
            .to(0.2, { scale: new Vec3(0.9, 0.9, 1) })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();
    }
}


