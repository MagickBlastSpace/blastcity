import { _decorator, AudioClip, AudioSource, Component, instantiate, isValid, Node, ParticleSystem2D, sp, SpriteFrame, Tween, tween, UIOpacity, Vec2, Vec3 } from 'cc';
import { UserData } from '../data/UserData';
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

    public keepSpineVisible: boolean = false;
    public useSpineDestroyOnly: boolean = false;

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

    private targetLayout: Node = null;

    private visualMovementTween: Tween<Node> | null = null;
    private isVisualMovementActive: boolean = false;

    private detachedLoopingSpine: Node | null = null;

    private stopVisualTweens(): void {
        this.visualMovementTween?.stop();
        this.visualMovementTween = null;
        this.isVisualMovementActive = false;

        Tween.stopAllByTarget(this.node);

        if (
            this.content &&
            this.content !== this.node &&
            isValid(this.content, true)
        ) {
            Tween.stopAllByTarget(this.content);
        }
    }

    private playDestroyParticles(): void {
        const particles = [
            this.particles_1,
            this.particles_2,
            this.particles_3,
            this.particles_4,
            this.particles_5
        ].filter(
            (particle): particle is ParticleSystem2D =>
                !!particle && isValid(particle.node, true)
        );

        for (const particle of particles) {
            particle.autoRemoveOnFinish = false;
            particle.resetSystem();
        }

        const particlesNode = this.particlesParent;

        if (
            !particlesNode ||
            particlesNode === this.node ||
            !isValid(particlesNode, true) ||
            !this.destroyLayout ||
            !isValid(this.destroyLayout, true)
        ) {
            return;
        }

        this.destroyLayout.addChild(particlesNode);
        particlesNode.setPosition(this.currentX, this.currentY);

        const emissionDuration = Math.max(
            0.15,
            ...particles.map(particle =>
                particle.duration >= 0
                    ? particle.duration
                    : 0.15
            )
        );

        const particleLifetime = Math.max(
            0.25,
            ...particles.map(particle =>
                Math.max(0, particle.life) +
                Math.abs(particle.lifeVar)
            )
        );

        tween(particlesNode)
            .delay(emissionDuration)
            .call(() => {
                for (const particle of particles) {
                    if (isValid(particle.node, true)) {
                        particle.stopSystem();
                    }
                }
            })
            .delay(particleLifetime + 0.25)
            .call(() => {
                if (isValid(particlesNode, true)) {
                    particlesNode.destroy();
                }
            })
            .start();
    }

    public isVisualMoving(): boolean {
        return this.isVisualMovementActive;
    }

    start() {
        console.log('[UITILE SPINE DEBUG]', {
            node: this.node.name,
            keepSpineVisible: this.keepSpineVisible,
            hasSpine: !!this.spine,
            spineActiveBefore: this.spine?.node.active
        });

        if (this.spine && !this.keepSpineVisible) {
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
        this.targetLayout = layout;

        this.destroyLayout = this.node.parent;

        this.animationsLayout = this.destroyLayout.parent;

        if(this.content === null || this.content === undefined) {
            this.content = this.node;
        }

        let fallTime = (startPosition - posY) / this.fallSpeed;


        this.visualMovementTween?.stop();
        this.isVisualMovementActive = true;

        this.visualMovementTween = tween(this.node)
            .to(0.05, { scale: new Vec3(0.92, 1.08, 1) }, { easing: 'linear' })
            .to(fallTime, { position: new Vec3(posX, posY, 0) })
            .call(() => {
                if(layout.isValid && this.node.isValid) {
                    layout.addChild(this.node);
                }
            })
            .to(0.07, { scale: new Vec3(1.03, 0.97, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(0.97, 1.03, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticInOut' })
            .call(() => {
                this.isVisualMovementActive = false;
                this.visualMovementTween = null;
            })
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

        this.visualMovementTween?.stop();
        this.isVisualMovementActive = true;

        this.visualMovementTween = tween(this.node)
            .to(0.05, { scale: new Vec3(0.92, 1.08, 1) }, { easing: 'linear' })
            .to(this.fallTime, { position: new Vec3(posX, posY, 0) })
            .call(() => {
                if(layout.isValid && this.node.isValid) {
                    layout.addChild(this.node);
                }
            })
            .to(0.07, { scale: new Vec3(1.03, 0.97, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(0.97, 1.03, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticInOut' })
            .call(() => {
                this.isVisualMovementActive = false;
                this.visualMovementTween = null;
            })
            .start();
    }


    destroyTile(delay: number) {
         if ((globalThis as any).gamepush?.__artPreview === true) {
            console.log(
                `[AP UITILE] destroyTile START` +
                ` node=${this.node.name}` +
                ` parent=${this.node.parent?.name}` +
                ` delay=${delay}` +
                ` blocked=${this.isBlocked}`
            );
        }

        if (this.isBlocked) {
            return;
        }

        this.isBlocked = true;

        this.stopVisualTweens();

        if ((globalThis as any).gamepush?.__artPreview === true) {
            console.log(
                `[AP UITILE] REPARENT` +
                ` node=${this.node.name}` +
                ` from=${this.node.parent?.name}` +
                ` to=${this.destroyLayout?.name}`
            );
        }
        this.destroyLayout.addChild(this.node);

        this.playDestroyParticles();

        if (this.useSpineDestroyOnly) {
            this.playDestroySound();

            Tween.stopAllByTarget(this.node);

            this.scheduleOnce(() => {
                if (this.node.isValid) {
                    this.node.destroy();
                }
            }, Math.max(0, delay) + 1.35);

            return;
        }

        this.playAnimation("destroy", false, 1);
        this.playDestroySound();

        this.scheduleOnce(() => {
            if ((globalThis as any).gamepush?.__artPreview === true) {
                console.log(
                    `[AP UITILE] DESTROY CALLBACK` +
                    ` node=${this.node.name}` +
                    ` parent=${this.node.parent?.name}`
                );
            }
            if (this.isSpineDestroyScheduled && this.spine !== null) {
                try {
                    this.spine.node.destroy();
                } catch {}
            }

            Tween.stopAllByTarget(this.node);

            if (!isValid(this.node, true)) {
                return;
            }

            const visualNode = this.content && isValid(this.content, true) ? this.content : this.node;

            Tween.stopAllByTarget(visualNode);

            const opacity = visualNode.getComponent(UIOpacity);

            if (opacity) {
                Tween.stopAllByTarget(opacity);

                tween(opacity)
                    .to(
                        this.destroyTime,
                        { opacity: 0 },
                        { easing: 'linear' }
                    )
                    .start();
            }

            tween(visualNode)
                .to(
                    this.destroyTime,
                    { scale: new Vec3(0, 0, 0) },
                    { easing: 'linear' }
                )
                .call(() => {
                    if (isValid(this.node, true)) {
                        this.node.destroy();
                    }
                })
                .start();
        }, delay);
    }

    public getAnimationsLayout(): Node | null {
        return this.animationsLayout?.isValid
            ? this.animationsLayout
            : null;
    }

    playAnimation(
        animation: string,
        isLooped: boolean,
        timeScale: number
    ): void {
        try {
            if (!this.spine || !this.spine.node.isValid) {
                return;
            }

            const layout = this.getAnimationsLayout();

            if (!layout) {
                console.warn(
                    `[UITile] Animations layout missing: ${animation}`
                );
                return;
            }

            const currentEntry = this.spine.getCurrent(0);

            if (
                currentEntry &&
                !currentEntry.isComplete() &&
                !currentEntry.loop
            ) {
                return;
            }

            this.isSpineDestroyScheduled = isLooped;

            const spineNode = this.spine.node;
            const posX = this.currentX;
            const posY = this.currentY;

            spineNode.active = true;
            layout.addChild(spineNode);
            spineNode.setPosition(posX, posY);

            if (isLooped && spineNode !== this.node) {
                this.detachedLoopingSpine = spineNode;
            } else if (this.detachedLoopingSpine === spineNode) {
                this.detachedLoopingSpine = null;
            }

            const entry = this.spine.setAnimation(
                0,
                animation,
                isLooped
            );

            if (!entry) {
                console.error(
                    `[UITile] Spine animation missing: ${animation}`
                );

                if (!isLooped && isValid(spineNode, true)) {
                    spineNode.destroy();
                }

                return;
            }

            entry.timeScale = timeScale;

            if (isLooped) {
                return;
            }

            let cleaned = false;

            const cleanup = (completed: boolean): void => {
                if (cleaned) {
                    return;
                }

                cleaned = true;

                if (
                    completed &&
                    animation === 'goal' &&
                    isValid(layout, true)
                ) {
                    layout.emit(
                        'goal_effect_positioned',
                        'goal_fly',
                        posX,
                        posY
                    );
                }

                if (isValid(spineNode, true)) {
                    spineNode.destroy();
                }
            };

            this.spine.setTrackCompleteListener(
                entry,
                () => cleanup(true)
            );

            this.spine.setTrackInterruptListener(
                entry,
                () => cleanup(false)
            );

            this.spine.setTrackEndListener(
                entry,
                () => cleanup(false)
            );

        } catch (error) {
            console.error(
                `[UITile] Spine animation error: ${animation}`,
                error
            );
        }
    }

    /*playAdditionalAnimation(skeleton: sp.Skeleton, animation: string, disableNode: Node) {
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
    }*/


    playAdditionalAnimation(
        skeleton: sp.Skeleton,
        animation: string,
        disableNode: Node,
        goalType: string | null = null
    ): void {
        const originalSpine = skeleton || this.spine;
        const layout = this.getAnimationsLayout();

        if (!originalSpine?.skeletonData || !layout) {
            console.warn(`[UITile] Cannot play additional animation: ${animation}`);
            return;
        }

        let clonedNode: Node | null = null;

        try {
            clonedNode = instantiate(originalSpine.node);

            const clonedSkeleton = clonedNode.getComponent(sp.Skeleton);

            if (!clonedSkeleton) {
                console.error('[UITile] Cloned skeleton missing sp.Skeleton');
                clonedNode.destroy();
                return;
            }

            const posX = this.currentX;
            const posY = this.currentY;

            layout.addChild(clonedNode);
            clonedNode.setPosition(posX, posY);
            clonedNode.active = true;

            if (disableNode && isValid(disableNode, true)) {
                disableNode.active = false;
            }

            let cleaned = false;

            const cleanup = (completed: boolean): void => {
                if (cleaned) return;
                cleaned = true;

                if (completed && goalType && isValid(layout, true)) {
                    layout.emit(
                        'goal_effect_positioned',
                        goalType,
                        posX,
                        posY
                    );
                }

                if (clonedNode && isValid(clonedNode, true)) {
                    clonedNode.destroy();
                }

                if (disableNode && isValid(disableNode, true)) {
                    disableNode.active = true;
                }
            };

            const entry = clonedSkeleton.setAnimation(
                0,
                animation,
                false
            );

            if (!entry) {
                console.error(`[UITile] Animation not found: ${animation}`);
                cleanup(false);
                return;
            }

            clonedSkeleton.setTrackCompleteListener(
                entry,
                () => cleanup(true)
            );

            clonedSkeleton.setTrackInterruptListener(
                entry,
                () => cleanup(false)
            );

            clonedSkeleton.setTrackEndListener(
                entry,
                () => cleanup(false)
            );

        } catch (error) {
            console.error('[UITile] Additional animation error:', error);

            if (clonedNode && isValid(clonedNode, true)) {
                clonedNode.destroy();
            }

            if (disableNode && isValid(disableNode, true)) {
                disableNode.active = true;
            }
        }
    }

    public prepareBonusSpawnAtCell(): void {
        if(!this.node.isValid) return;

        Tween.stopAllByTarget(this.node);

        if(this.targetLayout && isValid(this.targetLayout, true)) {
            this.targetLayout.addChild(this.node);
        }

        this.node.setPosition(
            this.currentX,
            this.currentY,
            0
        );

        this.node.setScale(1, 1, 1);

        const opacity = this.node.getComponent(UIOpacity);

        if(opacity) {
            opacity.opacity = 255;
        }
    }


    prepareInstantBonusSpawn() {
        Tween.stopAllByTarget(this.node);

        this.visualMovementTween = null;
        this.isVisualMovementActive = false;

        if(this.targetLayout && isValid(this.targetLayout, true)) {
            this.targetLayout.addChild(this.node);
        }

        this.node.setPosition(this.currentX, this.currentY, 0);
        this.node.setScale(0, 0, 1);
    }

    showInstantBonusSpawn(duration: number = 0.16) {
        Tween.stopAllByTarget(this.node);

        tween(this.node)
            .to(duration, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }

    hideForBonusSpawn() {
        let opacity = this.node.getComponent(UIOpacity);

        if(!opacity) {
            opacity = this.node.addComponent(UIOpacity);
        }

        opacity.opacity = 0;
    }

    showAfterBonusSpawn() {
        const opacity = this.node.getComponent(UIOpacity);

        if(opacity) {
            opacity.opacity = 255;
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

        this.source.volume = UserData.instance.getSfxVolume();

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

        this.source.volume = UserData.instance.getSfxVolume();

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

    setAnimationsLayout(layout: Node) {
        this.animationsLayout = layout;
    }

    public setSpineDestroyOnly(enabled: boolean): void {
        this.useSpineDestroyOnly = enabled;
    }

    protected onDestroy(): void {
        this.stopVisualTweens();

        if (
            this.detachedLoopingSpine &&
            isValid(this.detachedLoopingSpine, true)
        ) {
            console.warn(
                '[UITile] Cleaning up detached looping Spine:',
                this.detachedLoopingSpine.name
            );

            this.detachedLoopingSpine.destroy();
        }

        this.detachedLoopingSpine = null;
    }
}


