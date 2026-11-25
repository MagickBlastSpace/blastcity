import { _decorator, Component, instantiate, Node, Prefab, sp, tween, UITransform, Vec2, Vec3 } from 'cc';
import { SpecialPrefabData } from '../../data/GameData';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { UILevelGoal } from '../level/UILevelGoal';
import { UIRewardEffect } from './UIRewardEffect';
import { UISpecGoalEffect } from './UISpecGoalEffect';
const { ccclass, property } = _decorator;

@ccclass('UIEffectManager')
export class UIEffectManager extends Component {

    @property(Prefab)
    coinReward: Prefab = null;
    @property(Prefab)
    extraHit: Prefab = null;

    @property(Node)
    effectsLayer: Node = null;

    @property(Node)
    field: Node = null;

    @property([UILevelGoal])
    goalsPositions: UILevelGoal[] = [];
    @property([UILevelGoal])
    goalsPositions_Portrait: UILevelGoal[] = [];

    @property
    tileSpacing: number = 0;
    @property
    xOffset: number = -660;
    @property
    yOffset: number = -660;
    @property
    tileSize: number = 165;

    @property([SpecialPrefabData])
    specialPrefabs: SpecialPrefabData[] = [];

    start(): void {
        this.field.on('coin_reward', this.createEffectCoinReward, this);
        this.field.on('goal_effect', this.createSpecGoalEffect, this);
        this.field.on('goal_effect_positioned', this.createSpecGoalEffectPositioned, this);
        this.field.on('shell_pearl_fly', this.createShellPearlEffect, this);
        this.field.on('magic_hat_carrot_fly', this.createMagicHatCarrotEffect, this);
    }

    protected onDestroy(): void {
        if(this.field?.isValid) {
            this.field.off('shell_pearl_fly', this.createShellPearlEffect, this);
            this.field.off('magic_hat_carrot_fly', this.createMagicHatCarrotEffect, this);
            return
        }

        this.field.off('coin_reward', this.createEffectCoinReward, this);
        this.field.off('goal_effect', this.createSpecGoalEffect, this);
        this.field.off('goal_effect_positioned', this.createSpecGoalEffectPositioned, this);
    }

    private createShellPearlEffect(sourceNode: Node): void {
        let pearlNode: Node | null = null;
        let completed = false;

        const finish = (): void => {
            if(completed) return;
            completed = true;

            if(pearlNode?.isValid) {
                pearlNode.destroy();
            }

            if(this.field?.isValid) {
                this.field.emit('shell_pearl_arrived');
            }
        };

        if(!sourceNode?.isValid || !this.effectsLayer?.isValid) {
            console.warn('[SHELL PEARL] Source or effects layer missing');
            finish();
            return;
        }

        const isPortrait = ResolutionManager.instance.isPortraitOrientation();

        const goals = isPortrait
            ? this.goalsPositions_Portrait
            : this.goalsPositions;

        const targetGoal = goals.find(goal =>
            goal?.node?.isValid && goal.getGoalId() === 'shell'
        );

        const layerTransform = this.effectsLayer.getComponent(UITransform);

        if(!targetGoal || !layerTransform) {
            console.warn('[SHELL PEARL] Target goal or UITransform missing');
            finish();
            return;
        }

        const startWorld = sourceNode.worldPosition.clone();
        const startWorldScale = sourceNode.worldScale.clone();

        const goalWorld = targetGoal.getPosition();
        const targetLocal = layerTransform.convertToNodeSpaceAR(
            new Vec3(goalWorld.x, goalWorld.y, 0)
        );

        try {
            pearlNode = instantiate(sourceNode);

            this.effectsLayer.addChild(pearlNode);
            pearlNode.active = true;

            pearlNode.setWorldPosition(startWorld);
            pearlNode.setWorldScale(startWorldScale);

            const skeleton = pearlNode.getComponent(sp.Skeleton);

            if(!skeleton?.skeletonData || !skeleton.findAnimation('pearl')) {
                console.warn('[SHELL PEARL] Pearl animation missing');
                finish();
                return;
            }

            skeleton.clearTracks();
            skeleton.setSlotsToSetupPose();
            skeleton.setAnimation(0, 'pearl', false);

            const originalScale = pearlNode.scale.clone();
            const startPosition = pearlNode.position.clone();

            const arcHeight = 100;
            const flight = { progress: 0 };

            tween(flight)
                .delay(0.18)
                .to(0.55, { progress: 1 }, {
                    easing: 'quadInOut',
                    onUpdate: (state) => {
                        if(!pearlNode?.isValid) return;

                        const t = (state as { progress: number }).progress;

                        const x = startPosition.x +
                            (targetLocal.x - startPosition.x) * t;

                        const y = startPosition.y +
                            (targetLocal.y - startPosition.y) * t +
                            Math.sin(Math.PI * t) * arcHeight;

                        pearlNode.setPosition(x, y, startPosition.z);
                    }
                })
                .call(() => {
                    if(!pearlNode?.isValid) {
                        finish();
                        return;
                    }

                    tween(pearlNode)
                        .to(0.14, {
                            scale: new Vec3(
                                originalScale.x * 0.01,
                                originalScale.y * 0.01,
                                originalScale.z
                            )
                        }, { easing: 'quadIn' })
                        .call(() => {
                            console.log('[SHELL PEARL] Arrived');
                            finish();
                        })
                        .start();
                })
                .start();

        } catch(error) {
            console.error('[SHELL PEARL] Flight error', error);
            finish();
        }
    }

    createEffectCoinReward(row: number, col: number) {
        const coin = instantiate(this.coinReward);
        this.effectsLayer.addChild(coin);
        const coinComp = coin.getComponent(UIRewardEffect);

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        let portraitGoalPosition = this.findGoalPosition(this.goalsPositions_Portrait, "coin");
        let landscapeGoalPosition = this.findGoalPosition(this.goalsPositions, "coin");

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? portraitGoalPosition : landscapeGoalPosition;

        coinComp.init(
            new Vec2(posX, posY),
            targetPosition,
            () => {
                if(this.field?.isValid) {
                    this.field.emit('win_coin_arrived');
                }
            }
        );
    }

    createSpecGoalEffect(spec: string, row: number, col: number) {
        const prefab = this.specialPrefabs.find(p => p.id === 'goal_fly')?.prefab;

        if(!prefab) {
            console.warn('[GOAL EFFECT] goal_fly prefab not found');
            return;
        }

        const specNode = instantiate(prefab);
        this.effectsLayer.addChild(specNode);
        const specComp = specNode.getComponent(UISpecGoalEffect);

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        posY = spec === "duck" || spec === "big_duck" ? posY - this.tileSize : posY;

        let portraitGoalPosition = this.findGoalPosition(this.goalsPositions_Portrait, spec);
        let landscapeGoalPosition = this.findGoalPosition(this.goalsPositions, spec);

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? portraitGoalPosition : landscapeGoalPosition;

        specComp.init(new Vec2(posX, posY), targetPosition);
    }

    createSpecGoalEffectPositioned(spec: string, x: number, y: number) {
        const prefab = this.specialPrefabs.find(p => p.id === 'goal_fly')?.prefab;

        if(!prefab) {
            console.warn('[GOAL EFFECT] goal_fly prefab not found');
            return;
        }

        const specNode = instantiate(prefab);
        this.effectsLayer.addChild(specNode);
        const specComp = specNode.getComponent(UISpecGoalEffect);

        let posX = x;
        let posY = y;

        posY = spec === "duck" || spec === "big_duck" ? posY - this.tileSize : posY;

        let portraitGoalPosition = this.findGoalPosition(this.goalsPositions_Portrait, spec);
        let landscapeGoalPosition = this.findGoalPosition(this.goalsPositions, spec);

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? portraitGoalPosition : landscapeGoalPosition;

        specComp.init(new Vec2(posX, posY), targetPosition);
    }


    findGoalPosition(goals: UILevelGoal[], goalId: string): Vec2 {
        if (goals.length === 0) {
            return new Vec2();
        }

        let worldPos = goals[0].getPosition();

        for (let i = 0; i < goals.length; i++) {
            if (goalId === goals[i].getGoalId()) {
                worldPos = goals[i].getPosition();

                const uiTransform = this.node.getComponent(UITransform);
                if (uiTransform) {
                    const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
                    return new Vec2(localPos.x, localPos.y);
                } else {
                    console.error("UITransform component missing on this node");
                    return new Vec2();
                }
            }
        }

        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
            return new Vec2(localPos.x, localPos.y);
        } else {
            console.error("UITransform component missing on this node");
            return new Vec2();
        }
    }

    private createMagicHatCarrotEffect(sourceNode: Node): void {
        let carrotNode: Node | null = null;
        let completed = false;

        const finish = (): void => {
            if(completed) return;
            completed = true;

            if(carrotNode?.isValid) carrotNode.destroy();

            if(this.field?.isValid) {
                this.field.emit('magic_hat_carrot_arrived');
            }
        };

        if(!sourceNode?.isValid || !this.effectsLayer?.isValid) {
            console.warn('[MAGIC HAT FLY] Source or effects layer missing');
            finish();
            return;
        }

        const goals = ResolutionManager.instance.isPortraitOrientation()
            ? this.goalsPositions_Portrait
            : this.goalsPositions;

        const targetGoal = goals.find(goal =>
            goal?.node?.isValid && goal.getGoalId() === 'magic_hat'
        );

        const layerTransform = this.effectsLayer.getComponent(UITransform);

        if(!targetGoal || !layerTransform) {
            console.warn('[MAGIC HAT FLY] Goal position unavailable');
            finish();
            return;
        }

        const startWorld = sourceNode.worldPosition.clone();
        const startScale = sourceNode.worldScale.clone();
        const goalWorld = targetGoal.getPosition();

        const targetLocal = layerTransform.convertToNodeSpaceAR(
            new Vec3(goalWorld.x, goalWorld.y, 0)
        );

        try {
            carrotNode = instantiate(sourceNode);
            carrotNode.name = 'MagicHatFlyingCarrot';

            this.effectsLayer.addChild(carrotNode);
            carrotNode.active = true;
            carrotNode.setWorldPosition(startWorld);
            carrotNode.setWorldScale(startScale);
            carrotNode.setWorldRotation(sourceNode.worldRotation);

            const skeleton = carrotNode.getComponent(sp.Skeleton);

            if(!skeleton?.skeletonData || !skeleton.findAnimation('carrot')) {
                console.warn('[MAGIC HAT FLY] Carrot Spine unavailable');
                finish();
                return;
            }

            skeleton.enabled = true;
            skeleton.timeScale = 1;
            skeleton.clearTracks();
            skeleton.setToSetupPose();

            skeleton.setAnimation(0, 'carrot', false);

            const startPosition = carrotNode.position.clone();
            const originalScale = carrotNode.scale.clone();

            const arcHeight = 100;
            const flight = { progress: 0 };

            tween(flight)
                .delay(0.08)
                .to(0.65, { progress: 1 }, {
                    easing: 'quadInOut',
                    onUpdate: (state) => {
                        if(!carrotNode?.isValid) return;

                        const t = (state as { progress: number }).progress;

                        const x = startPosition.x +
                            (targetLocal.x - startPosition.x) * t;

                        const y = startPosition.y +
                            (targetLocal.y - startPosition.y) * t +
                            Math.sin(Math.PI * t) * arcHeight;

                        carrotNode.setPosition(x, y, startPosition.z);
                    }
                })
                .call(() => {
                    if(!carrotNode?.isValid) {
                        finish();
                        return;
                    }

                    tween(carrotNode)
                        .to(0.14, {
                            scale: new Vec3(
                                originalScale.x * 0.01,
                                originalScale.y * 0.01,
                                originalScale.z
                            )
                        }, { easing: 'quadIn' })
                        .call(() => {
                            console.log('[MAGIC HAT FLY] Carrot arrived');
                            finish();
                        })
                        .start();
                })
                .start();

        } catch(error) {
            console.error('[MAGIC HAT FLY] Error:', error);
            finish();
        }
    }
}


