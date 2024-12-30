import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AnimatedScale')
export class AnimatedScale extends Component {

    @property({ type: Node })
    tutorialObject: Node | null = null;

    @property({ type: Vec3 })
    scaleUp: Vec3 = new Vec3(1.2, 1.2, 1); // Scale-up target size

    @property({ type: Vec3 })
    scaleDown: Vec3 = new Vec3(1, 1, 1); // Scale-down original size

    @property
    duration: number = 0.5; // Duration for each scale animation

    /*onEnable() {
        if (this.tutorialObject) {
            this.startScaleAnimation();
        }
    }

    onDisable() {
        tween(this.tutorialObject).stop(); // Stop animation when the component is disabled
    }*/

    start() {
        this.startScaleAnimation();
    }

    startScaleAnimation() {
        if (!this.tutorialObject) {
            console.warn("Tutorial object is not assigned!");
            return;
        }

        // Create the endless scale-up and scale-down animation
        tween(this.tutorialObject)
            .to(this.duration, { scale: this.scaleUp })
            .to(this.duration, { scale: this.scaleDown })
            .union() // Combine the tweens
            .repeatForever() // Loop endlessly
            .start();
    }
}


