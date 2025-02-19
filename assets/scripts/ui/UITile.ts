import { _decorator, Component, Node, tween, Vec3, Vec2, ParticleSystem2D, SpriteFrame, sp, UITransform, AudioClip, AudioSource, instantiate } from 'cc';
import { AudioController } from '../utils/AudioController';
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
    destroyTime: number = 0.05;

    @property(AudioSource)
    source: AudioSource = null!

    @property([AudioClip])
    destroyAudios: AudioClip[] = [];
    @property([AudioClip])
    additionalAudios: AudioClip[] = [];

    @property
    disableSound: boolean = false;

    private fallTime: number = 0.35;
    private fallSpeed: number = 3300;

    private isBlocked: boolean = false;

    private currentX: number = -1;
    private currentY: number = -1;

    private destroyLayout: Node = null;
    private animationsLayout: Node = null;

    private isSpineDestroyScheduled: boolean = false;

    private originalContentPos: Vec2;
    private shakeTween: any = null;


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
        let startPosition = posY + this.node.height * fallMultiplier;
        this.node.setPosition(posX, startPosition);

        this.currentX = posX;
        this.currentY = posY;

        this.destroyLayout = this.node.parent;
        this.animationsLayout = this.destroyLayout.parent;

        if(this.content === null || this.content === undefined) {
            this.content = this.node;
        }

        let fallTime = (startPosition - posY) / this.fallSpeed;

        tween(this.node)
            .to(0.05, { scale: new Vec3(0.92, 1.08, 1) }, { easing: 'linear' })
            .to(fallTime, { position: new Vec3(posX, posY, 0) })
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
        if (this.isBlocked) {
            return;
        }
    
        this.isBlocked = true;
        this.destroyLayout.addChild(this.node);
    
        const particles = [this.particles_1, this.particles_2, this.particles_3, this.particles_4, this.particles_5];
        particles.forEach(particle => particle?.resetSystem());
    
        if (this.particlesParent) {
            this.destroyLayout.addChild(this.particlesParent);
            this.particlesParent.setPosition(this.currentX, this.currentY);
        }
    
        this.playAnimation("destroy", false, 1);
        this.playDestroySound();
    
        this.scheduleOnce(() => {
            if (this.isSpineDestroyScheduled && this.spine !== null) {
                try {
                    this.spine.node.destroy();
                } catch {}
            }
    
            tween(this.node).stop();
    
            if (this.content) {
                tween(this.content).stop();
                tween(this.content)
                    .parallel(
                        tween().to(this.destroyTime, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' }),
                        tween().to(this.destroyTime, { opacity: 0 }, { easing: 'linear' })
                    )
                    .call(() => {
                        this.node.destroy();
                    })
                    .start();
            }
        }, delay);
    }
    
    playAnimation(animation: string, isLooped: boolean, timeScale: number) {
        try {
            if (this.spine) {
                let trackEntry = this.spine.getCurrent(0);
                let isPlaying = trackEntry && !trackEntry.isComplete();
    
                if (isPlaying) {
                    let isLoop = trackEntry.loop;
                    if (!isLoop) {
                        return;
                    }
                }
    
                this.isSpineDestroyScheduled = isLooped;
    
                const spineNode = this.spine.node;
                spineNode.active = true;
                this.animationsLayout.addChild(spineNode);
                spineNode.setPosition(this.currentX, this.currentY);
    
                let goalEmitLayout = this.animationsLayout;
    
                if (!isLooped) {
                    this.spine.setCompleteListener(() => {
                        if (animation === "goal") {
                            goalEmitLayout.emit("goal_effect_positioned", "goal_fly", this.currentX, this.currentY);
                        }
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
    
    playAdditionalAnimation(skeleton: sp.Skeleton, animation: string, disableNode: Node) {
        try {
            const spineNode = skeleton ? skeleton.node : this.spine.node;
            spineNode.active = true;
    
            if (disableNode) {
                disableNode.active = false;
            }
    
            this.animationsLayout.addChild(spineNode);
            spineNode.setPosition(this.currentX, this.currentY);
    
            if (skeleton) {
                skeleton.setCompleteListener(() => {
                    spineNode.destroy();
                    if (disableNode) {
                        disableNode.active = true;
                    }
                });
    
                skeleton.setAnimation(0, animation, false);
            } else if (this.spine) {
                this.spine.setCompleteListener(() => {
                    spineNode.destroy();
                    if (disableNode) {
                        disableNode.active = true;
                    }
                });
    
                this.spine.setAnimation(0, animation, false);
            }
        } catch (error) {
            console.error('Error setting additional spine animation:', error);
        }
    }
    

    /*playAnimationsSequence(animations: string[], isGoal: boolean) {
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

                this.spine.setAnimation(0, animations[0], false);

                for(let i = 1; i < animations.length; i++) {
                    this.spine.addAnimation(0, animations[i], false, 0);
                }

                let goalEmitLayout = this.animationsLayout;

                this.spine.setCompleteListener((trackEntry) => {
                    if (trackEntry.animation.name === animations[animations.length - 1]) {
                        spineNode.destroy();
                    }
                    else if(trackEntry.animation.name === "goal") {
                        if(isGoal) {
                            goalEmitLayout.emit("goal_effect_positioned", "goal_fly", this.currentX, this.currentY);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error setting spine animations sequence:', error);
        }
    }*/


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


    playDestroySound() {
        if(this.disableSound) {
            return;
        }

        if(!AudioController.instance.isSfxEnabled()) {
            return;
        }

        if (!this.source) {
            return;
        }

        if (this.source.playing) {
            return;
        }

        if (this.destroyAudios.length > 0) {
            //const randomIndex = Math.floor(Math.random() * this.destroyAudios.length);
            const randomClip = this.destroyAudios[0];

            this.source.playOneShot(randomClip);
        } else {
            console.error("No audio clips available in destroyAudios array.");
        }
    }

    playAdditionalSound(soundIndex: number) {
        if(this.disableSound) {
            return;
        }

        if(!AudioController.instance.isSfxEnabled()) {
            return;
        }
        
        if (!this.source) {
            return;
        }

        if (this.additionalAudios.length > soundIndex) {
            const clip = this.additionalAudios[soundIndex];

            this.source.playOneShot(clip);
        } else {
            console.error("No audio clips available in additionalAudios array.");
        }
    }


    startShake() {
        const shakeAmount = 5;
        const shakeDuration = 0.1;
    
        if (this.content && !this.shakeTween) {
            this.shakeTween = tween(this.content)
                .repeatForever(
                    tween()
                        .by(shakeDuration, { position: new Vec3(shakeAmount, 0, 0) })
                        .by(shakeDuration, { position: new Vec3(-shakeAmount * 2, 0, 0) })
                        .by(shakeDuration, { position: new Vec3(shakeAmount, 0, 0) })
                        .by(shakeDuration, { position: new Vec3(0, shakeAmount, 0) })
                        .by(shakeDuration, { position: new Vec3(0, -shakeAmount * 2, 0) })
                        .by(shakeDuration, { position: new Vec3(0, shakeAmount, 0) })
                )
                .start();
        }
    }

    stopShake() {
        if (this.content && this.shakeTween) {
            this.shakeTween.stop();
    
            this.shakeTween = null;

            if(this.originalContentPos && !this.originalContentPos === undefined) {
                this.content.setPosition(new Vec3(this.originalContentPos.x, this.originalContentPos.y, 0));
            }
        }
    }
}


