import { _decorator, Component, Node, tween, Vec3, Vec2, ParticleSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UITile')
export class UITile extends Component {

    @property(ParticleSystem2D)
    particles: ParticleSystem2D = null;

    private fallTime: number = 0.35;
    private destroyTime: number = 0.25;

    private isBlocked: boolean = false;

    private currentX: number = -1;
    private currentY: number = -1;


    init(posX: number, posY: number, layout: Node, isStatus: boolean) {
        let fallMultiplier = isStatus ? 1 : 7;
        this.node.setPosition(posX, posY + this.node.height * fallMultiplier);

        this.currentX = posX;
        this.currentY = posY;

        tween(this.node)
            .to(0.05, { scale: new Vec3(0.92, 1.08, 1) }, { easing: 'linear' })
            .to(this.fallTime, { position: new Vec3(posX, posY, 0) })
            .call(() => layout.addChild(this.node))
            .to(0.07, { scale: new Vec3(1.03, 0.97, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(0.97, 1.03, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticInOut' })
            .start();

        this.isBlocked = false;
    }


    moveTo(posX: number, posY: number, layout: Node) {
        if(this.isBlocked) {
            return;
        }

        if(posX === this.currentX && posY === this.currentY) {
            return;
        }

        this.currentX = posX;
        this.currentY = posY;
        
        tween(this.node).stop();

        tween(this.node)
            .to(0.05, { scale: new Vec3(0.92, 1.08, 1) }, { easing: 'linear' })
            .to(this.fallTime, { position: new Vec3(posX, posY, 0) })
            .call(() => layout.addChild(this.node))
            .to(0.07, { scale: new Vec3(1.03, 0.97, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(0.97, 1.03, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticInOut' })
            .start();
    }


    destroyTile(delay: number) {
        this.isBlocked = true;

        if (this.particles) {
            this.particles.resetSystem();
        }

        this.scheduleOnce(() => {
            tween(this.node).stop();

            tween(this.node)
                .to(this.destroyTime, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'linear' })
                .call(() => this.node.destroy())
                .start();
        }, delay);
    }


    changeChildNodeSizesProportionally(scaleFactorX: number, scaleFactorY: number) {
        if (this.node) {
            this.node.children.forEach(childNode => {
                childNode.width *= scaleFactorX;
                childNode.height *= scaleFactorY;
            });
        }
    }
}


