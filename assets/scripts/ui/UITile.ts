import { _decorator, Component, Node, tween, Vec3, Vec2, ParticleSystem2D, SpriteFrame } from 'cc';
import { SpriteTileData } from '../game/Tile';
const { ccclass, property } = _decorator;


@ccclass('ParticleTileData')
export class ParticleTileData {
    @property
    id = '';

    @property(SpriteFrame)
    icon_1: SpriteFrame | null = null;
    @property(SpriteFrame)
    icon_2: SpriteFrame | null = null;
    @property(SpriteFrame)
    icon_3: SpriteFrame | null = null;
    @property(SpriteFrame)
    icon_4: SpriteFrame | null = null;
    @property(SpriteFrame)
    icon_5: SpriteFrame | null = null;
}

@ccclass('UITile')
export class UITile extends Component {

    @property(ParticleSystem2D)
    particles_1: ParticleSystem2D = null;
    @property(ParticleSystem2D)
    particles_2: ParticleSystem2D = null;
    @property(ParticleSystem2D)
    particles_3: ParticleSystem2D = null;
    @property(ParticleSystem2D)
    particles_4: ParticleSystem2D = null;
    @property(ParticleSystem2D)
    particles_5: ParticleSystem2D = null;

    @property([ParticleTileData])
    particleIcons: ParticleTileData[] = [];

    @property(Node)
    content: Node = null;

    private fallTime: number = 0.35;
    private destroyTime: number = 0.25;

    private isBlocked: boolean = false;

    private currentX: number = -1;
    private currentY: number = -1;

    private destroyLayout: Node = null;


    init(posX: number, posY: number, layout: Node, isStatus: boolean, tileType: string) {
        let fallMultiplier = isStatus ? 1 : 7;
        this.node.setPosition(posX, posY + this.node.height * fallMultiplier);

        this.currentX = posX;
        this.currentY = posY;

        this.destroyLayout = this.node.parent;

        if(this.content === null) {
            this.content = this.node;
        }

        tween(this.node)
            .to(0.05, { scale: new Vec3(0.92, 1.08, 1) }, { easing: 'linear' })
            .to(this.fallTime, { position: new Vec3(posX, posY, 0) })
            .call(() => layout.addChild(this.node))
            .to(0.07, { scale: new Vec3(1.03, 0.97, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(0.97, 1.03, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticInOut' })
            .start();

        this.isBlocked = false;

        this.setParticlesIcons(tileType);
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

        this.destroyLayout.addChild(this.node);

        if (this.particles_1) {
            this.particles_1.resetSystem();
        }
        if (this.particles_2) {
            this.particles_2.resetSystem();
        }
        if (this.particles_3) {
            this.particles_3.resetSystem();
        }
        if (this.particles_4) {
            this.particles_4.resetSystem();
        }
        if (this.particles_5) {
            this.particles_5.resetSystem();
        }

        this.scheduleOnce(() => {
            tween(this.node).stop();

            tween(this.content)
                .to(this.destroyTime, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
                .call(() => this.node.destroy())
                .start();
        }, delay);
    }

    startDestroyEffect() {
        this.destroyLayout.addChild(this.node);

        if (this.particles_1) {
            this.particles_1.resetSystem();
        }
        if (this.particles_2) {
            this.particles_2.resetSystem();
        }
        if (this.particles_3) {
            this.particles_3.resetSystem();
        }
        if (this.particles_4) {
            this.particles_4.resetSystem();
        }
        if (this.particles_5) {
            this.particles_5.resetSystem();
        }
    
        this.scheduleOnce(() => {
            this.node.destroy();
        }, this.destroyTime / 2);
    }


    changeChildNodeSizesProportionally(scaleFactorX: number, scaleFactorY: number) {
        if (this.node) {
            this.node.children.forEach(childNode => {
                childNode.width *= scaleFactorX;
                childNode.height *= scaleFactorY;
            });
        }
    }


    setParticlesIcons(color: string) {
        if (this.particles_1) {
            this.particles_1.spriteFrame = this.particleIcons.find(i => i.id === color)?.icon_1;
        }
        if (this.particles_2) {
            this.particles_2.spriteFrame = this.particleIcons.find(i => i.id === color)?.icon_2;
        }
        if (this.particles_3) {
            this.particles_3.spriteFrame = this.particleIcons.find(i => i.id === color)?.icon_3;
        }
        if (this.particles_4) {
            this.particles_4.spriteFrame = this.particleIcons.find(i => i.id === color)?.icon_4;
        }
        if (this.particles_5) {
            this.particles_5.spriteFrame = this.particleIcons.find(i => i.id === color)?.icon_5;
        }
    }
}


