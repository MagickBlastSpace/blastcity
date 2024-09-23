import { _decorator, Component, Node, Button, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonAnimator')
export class ButtonAnimator extends Component {

    private startScale: Vec3;


    start() {
        const button = this.node.getComponent(Button);

        if (button) {
            this.node.on(Node.EventType.TOUCH_START, this.onButtonPressed, this);
            this.node.on(Node.EventType.TOUCH_END, this.onButtonReleased, this);
            this.node.on(Node.EventType.TOUCH_CANCEL, this.onButtonReleased, this);
        }

        this.startScale = new Vec3(this.node.scale.x, this.node.scale.y, this.node.scale.z);
    }

    onButtonPressed() {
        this.startScale = new Vec3(this.node.scale.x, this.node.scale.y, this.node.scale.z);

        tween(this.node)
            .to(0.2, { scale: new Vec3(this.startScale.x * 1.1, this.startScale.y * 1.1, this.startScale.z) })
            .start();
    }

    onButtonReleased() {
        tween(this.node)
            .to(0.2, { scale: new Vec3(this.startScale.x * 0.9, this.startScale.y * 0.9, this.startScale.z) })
            .to(0.2, { scale: new Vec3(this.startScale.x, this.startScale.y, this.startScale.z) })
            .start();
    }
}


