import { _decorator, Component, Node, tween, Vec3, Vec2, ParticleSystem2D, SpriteFrame, sp, UITransform } from 'cc';
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

    @property(Node)
    particlesParent: Node = null;

    @property([ParticleTileData])
    particleIcons: ParticleTileData[] = [];

    @property(Node)
    content: Node = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property
    destroyTime: number = 0.25;

    private fallTime: number = 0.35;

    private isBlocked: boolean = false;

    private currentX: number = -1;
    private currentY: number = -1;

    private destroyLayout: Node = null;
    private animationsLayout: Node = null;

    private isSpineDestroyScheduled: boolean = false;


    start() {
        this.isBlocked = false;

        if (this.spine) {
            this.spine.node.active = false;
        }
    }
    
    init(posX: number, posY: number, layout: Node, isStatus: boolean, tileType: string) {
        if(this.isBlocked) {
            return;
        }

        let fallMultiplier = isStatus ? 1 : 7;
        this.node.setPosition(posX, posY + this.node.height * fallMultiplier);

        this.currentX = posX;
        this.currentY = posY;

        this.destroyLayout = this.node.parent;
        this.animationsLayout = this.destroyLayout.parent;

        if(this.content === null || this.content === undefined) {
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
        if(this.isBlocked) {
            return;
        }

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

        if(this.particlesParent) {
            this.destroyLayout.addChild(this.particlesParent);
            this.particlesParent.setPosition(this.currentX, this.currentY);
        }
        
        this.playAnimation("destroy", false);

        this.scheduleOnce(() => {
            if(this.isSpineDestroyScheduled && this.spine !== null) {
                this.spine.node.destroy();
            }

            tween(this.node).stop();

            if(this.content) {
                tween(this.content).stop();

                tween(this.content)
                    .parallel(
                        tween().to(this.destroyTime, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' }),
                        tween().to(this.destroyTime, { opacity: 0 }, { easing: 'linear' })
                    )
                    .call(() => {
                        this.node.destroy()
                    })
                    .start();
            }
            
        }, delay);
    }

    playAnimation(animation: string, isLooped: boolean, timeScale: number) {
        try {
            if(this.spine) {
                let trackEntry = this.spine.getCurrent(0);
                let isPlaying = trackEntry && !trackEntry.isComplete();
                if (isPlaying) {
                    //console.log("Animation is playing");
                    return;
                }

                const spineNode = this.spine.node;
                spineNode.active = true;

                this.animationsLayout.addChild(spineNode);

                spineNode.setPosition(this.currentX, this.currentY);

                if(isLooped) {
                    this.isSpineDestroyScheduled = isLooped;
                }
                else {
                    this.spine.setCompleteListener(() => {
                        spineNode.destroy();
                    });
                }
                
                trackEntry = this.spine.setAnimation(0, animation, isLooped);
                trackEntry.timeScale = timeScale;
            }
        } catch (error) {
            //console.error('Error setting spine animation:', error);
        }
    }

    playAdditionalAnimation(skeleton: sp.Skeleton, animation: string) {
        try {
            if(skeleton) {
                const spineNode = skeleton.node;
                spineNode.active = true;

                const currentWorldPosition = spineNode.getWorldPosition();
                const newLocalPosition = new Vec3(this.currentX, this.currentY, 0);

                if(this.animationsLayout) {
                    const animationsLayoutTransform = this.animationsLayout.getComponent(UITransform);
                    if (animationsLayoutTransform) {
                        animationsLayoutTransform.convertToNodeSpaceAR(currentWorldPosition, newLocalPosition);

                        this.animationsLayout.addChild(spineNode);

                        spineNode.setPosition(newLocalPosition);
                    } else {
                        console.log('UITransform component is missing from animationsLayout.');
                        //return;
                    }
                }
                else {
                    //console.log('Anim layout is missing.');
                }
                
                skeleton.setCompleteListener(() => {
                    spineNode.active = false;
                });

                skeleton.setAnimation(0, animation, false);
            }
        } catch (error) {
            console.error('Error setting additional spine animation:', error);
        }
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


    changeLayer(node: Node, layer: number) {
        if (!node || !node.parent) {
            console.warn('Node or parent is invalid.');
            return;
        }

        node.layer = layer;
    }
}


