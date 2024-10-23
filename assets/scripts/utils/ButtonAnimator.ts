import { _decorator, Component, Node, Button, tween, Vec3 } from 'cc';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('ButtonAnimator')
export class ButtonAnimator extends Component {

    private startScale: Vec3;

    private isPressTweening: boolean = false;
    private isReleaseTweening: boolean = false;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onButtonPressed, this);
        this.node.on(Node.EventType.TOUCH_END, this.onButtonReleased, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onButtonReleased, this);

        this.startScale = new Vec3(this.node.scale.x, this.node.scale.y, this.node.scale.z);
    }

    onButtonPressed() {
        if (this.isPressTweening || this.isReleaseTweening) return;

        this.isPressTweening = true;
        this.startScale = new Vec3(this.node.scale.x, this.node.scale.y, this.node.scale.z);

        tween(this.node)
            .to(0.1, { scale: new Vec3(this.startScale.x * 1.1, this.startScale.y * 1.1, this.startScale.z) })
            .call(() => {
                this.isPressTweening = false;
            })
            .start();

        AudioController.instance.playClick();
    }

    onButtonReleased() {
        if (this.isReleaseTweening) return;

        this.isReleaseTweening = true;

        tween(this.node)
            .to(0.1, { scale: new Vec3(this.startScale.x * 0.9, this.startScale.y * 0.9, this.startScale.z) })
            .to(0.1, { scale: new Vec3(this.startScale.x, this.startScale.y, this.startScale.z) })
            .call(() => {
                this.isReleaseTweening = false;
            })
            .start();
    }
}


