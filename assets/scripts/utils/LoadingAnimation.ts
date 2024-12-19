import { _decorator, Component, Node, Graphics, tween, Vec3, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadingAnimation')
export class LoadingAnimation extends Component {
    @property(Number)
    circleCount: number = 5;

    @property(Number)
    circleRadius: number = 10;

    @property(Number)
    rotationDuration: number = 2;

    @property(Color)
    circleColor: Color = new Color(255, 255, 255, 255);

    private containerNode: Node = null;

    onLoad() {
        this.createCircleContainer();
        this.createCircles();
        this.animateRotation();
    }

    createCircleContainer() {
        this.containerNode = new Node('CircleContainer');
        this.node.addChild(this.containerNode);
    }

    createCircles() {
        const angleStep = (360 / this.circleCount) * (Math.PI / 180);
        const containerRadius = 50;

        for (let i = 0; i < this.circleCount; i++) {
            const angle = i * angleStep;

            const x = Math.cos(angle) * containerRadius;
            const y = Math.sin(angle) * containerRadius;

            const circleNode = new Node(`Circle_${i}`);
            const graphics = circleNode.addComponent(Graphics);

            graphics.circle(0, 0, this.circleRadius);
            graphics.fillColor = this.circleColor;
            graphics.fill();

            circleNode.setPosition(x, y);
            this.containerNode.addChild(circleNode);
        }
    }

    animateRotation() {
        tween(this.containerNode)
            .repeatForever(
                tween()
                    .by(this.rotationDuration, { eulerAngles: new Vec3(0, 0, 360) }, { easing: 'linear' })
            )
            .start();
    }
}
