import {
    _decorator,
    Component,
    instantiate,
    isValid,
    Node,
    Prefab,
    tween,
    Tween,
    UITransform,
    Vec3
} from 'cc';

import {
    TileCollectFx,
    TileCollectSkin
} from './TileCollectFx';


const { ccclass, property } = _decorator;


@ccclass('TileCollectFxManager')
export class TileCollectFxManager extends Component {

    @property(Prefab)
    tileCollectFxPrefab: Prefab = null;

    @property(Prefab)
    bombCollectFxPrefab: Prefab = null;

    @property(Prefab)
    rocketHorizontalCollectFxPrefab: Prefab = null;

    @property(Prefab)
    rocketVerticalCollectFxPrefab: Prefab = null;

    @property(Prefab)
    discoballCollectFxPrefab: Prefab = null;

    @property(Node)
    fxLayer: Node = null;

    @property
    travelDuration: number = 0.25;

    @property
    sourceArrivalScale: number = 0.35;

    @property
    sourceShrinkStart: number = 0.35;

    @property
    targetScaleOutDuration: number = 0.12;

    @property
    targetFallScale: number = 0.08;

    @property
    targetFallShrinkDuration: number = 0.4;

    private rotateFxTowardsTarget(fxNode: Node, targetLocalPosition: Vec3) {
        const dx = targetLocalPosition.x - fxNode.position.x;
        const dy = targetLocalPosition.y - fxNode.position.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        fxNode.setRotationFromEuler(0, 0, angle);
    }


    public playSimpleGroupCollapse(
        tileNodes: Node[],
        skin: TileCollectSkin,
        onComplete?: () => void
    ): boolean {

        if(
            !tileNodes ||
            tileNodes.length === 0 ||
            !this.tileCollectFxPrefab ||
            !this.fxLayer
        ) {
            return false;
        }


        const positions =
            tileNodes.map(
                tile =>
                    tile.worldPosition.clone()
            );


        let completedCount = 0;


        for(const worldPosition of positions) {

            const fx =
                this.createFx(
                    worldPosition,
                    skin,
                );


            if(!fx) {

                completedCount++;

                if(
                    completedCount ===
                    positions.length
                ) {
                    onComplete?.();
                }

                continue;
            }


            fx.playCollapse(() => {

                if(fx.node && fx.node.isValid) {
                    fx.node.destroy();
                }

                completedCount++;


                if(
                    completedCount ===
                    positions.length
                ) {
                    onComplete?.();
                }

            });
        }


        return true;
    }


    public playBonusGroupCollect(
        tileNodes: Node[],
        clickedTile: Node,
        skin: TileCollectSkin,
        onAllArrived?: () => Node | null,
        onFinalAbsorbComplete?: () => void,
        onVisualComplete?: () => void,
        useBombFx: boolean = false,
        bonusFxType: 'rocket_horizontal' | 'rocket_vertical' | 'discoball' | null = null,
    ): boolean {

        if(
            !clickedTile?.isValid ||
            !tileNodes ||
            tileNodes.length === 0 ||
            !this.tileCollectFxPrefab ||
            !this.fxLayer ||
            !isValid(this.fxLayer, true)
        ) {
            return false;
        }

        const targetWorldPosition = clickedTile.worldPosition.clone();
        const sourcePositions: Vec3[] = [];

        for(const tile of tileNodes) {
            if(!tile?.isValid || tile === clickedTile) {
                continue;
            }

            sourcePositions.push(tile.worldPosition.clone());
        }

        const targetFx = this.createFx(targetWorldPosition, skin);

        if(!targetFx) {
            return false;
        }

        let arrivedCount = 0;
        let targetReady = false;
        let targetAborted = false;
        let absorbInProgress = false;
        let pendingAbsorbs = 0;
        let isFinished = false;

        const finishCollection = (): void => {
            if (isFinished) return;

            isFinished = true;
            absorbInProgress = false;
            pendingAbsorbs = 0;

            const targetNode = targetFx.node;

            if (targetNode && isValid(targetNode, true)) {
                Tween.stopAllByTarget(targetNode);
                targetNode.active = false;
                targetNode.destroy();
            }

            onAllArrived?.();
            onFinalAbsorbComplete?.();
            onVisualComplete?.();

            console.log('[BONUS COLLECT COMPLETE]', {
                arrived: arrivedCount,
                total: sourcePositions.length,
                targetAborted,
                bonusFxType,
                useBombFx
            });
        };

        const tryFinishCollection = (): void => {
            if (isFinished) return;

            if (!targetReady && !targetAborted) return;

            if (arrivedCount < sourcePositions.length) return;

            if (
                !targetAborted &&
                (pendingAbsorbs > 0 || absorbInProgress)
            ) {
                return;
            }

            finishCollection();
        };

        const abortTargetVisual = (reason: string): void => {
            if (isFinished || targetAborted) return;

            targetAborted = true;
            absorbInProgress = false;
            pendingAbsorbs = 0;

            console.warn(
                `[BONUS COLLECT] Target visual aborted: ${reason}`
            );

            const targetNode = targetFx.node;

            if (targetNode && isValid(targetNode, true)) {
                Tween.stopAllByTarget(targetNode);
                targetNode.active = false;
                targetNode.destroy();
            }

            tryFinishCollection();
        };

        const playNextAbsorb = (): void => {
            if (
                isFinished ||
                targetAborted ||
                !targetReady ||
                absorbInProgress
            ) {
                return;
            }

            if (pendingAbsorbs <= 0) {
                tryFinishCollection();
                return;
            }

            if (!targetFx.node || !isValid(targetFx.node, true)) {
                abortTargetVisual('target node unavailable');
                return;
            }

            pendingAbsorbs--;
            absorbInProgress = true;

            targetFx.playAbsorb((completed) => {
                if (isFinished || targetAborted) return;

                absorbInProgress = false;

                if (!completed) {
                    abortTargetVisual('absorb interrupted');
                    return;
                }

                if (!targetFx.node || !isValid(targetFx.node, true)) {
                    abortTargetVisual('target destroyed after absorb');
                    return;
                }

                targetFx.playTravel();

                playNextAbsorb();
                tryFinishCollection();
            });
        };

        const registerArrival = (): void => {
            if (isFinished) return;

            arrivedCount++;

            if (!targetAborted) {
                pendingAbsorbs++;
            }

            playNextAbsorb();
            tryFinishCollection();
        };

        targetFx.playCollapse((completed) => {
            if (isFinished || targetAborted) return;

            if (
                !completed ||
                !targetFx.node ||
                !isValid(targetFx.node, true)
            ) {
                abortTargetVisual('initial collapse interrupted');
                return;
            }

            targetReady = true;
            targetFx.playTravel();

            playNextAbsorb();
            tryFinishCollection();
        });

        for(const sourceWorldPosition of sourcePositions) {

            const sourceFx = this.createFx(
                sourceWorldPosition,
                skin,
                useBombFx,
                bonusFxType
            );

            if(!sourceFx) {
                registerArrival();
                continue;
            }

            const targetLocalPosition =
                this.worldToFxLayer(targetWorldPosition);

            if(useBombFx || bonusFxType !== null) {

                this.rotateFxTowardsTarget(
                    sourceFx.node,
                    targetLocalPosition
                );

                sourceFx.playCollapse((completed) => {
                    if (!completed) {
                        console.warn('[BONUS COLLECT] Source collapse interrupted');
                    }

                    if (sourceFx.node?.isValid) {
                        sourceFx.node.destroy();
                    }

                    registerArrival();
                });

                continue;
            }

            sourceFx.playCollapse((completed) => {
                if (isFinished || !completed) {
                    if (!completed) {
                        console.warn('[BONUS COLLECT] Source collapse interrupted');
                    }

                    if (sourceFx.node?.isValid) {
                        sourceFx.node.destroy();
                    }

                    if (!isFinished) {
                        registerArrival();
                    }

                    return;
                }

                sourceFx.travelTo(
                    targetLocalPosition,
                    this.travelDuration,
                    (travelCompleted) => {
                        if (!travelCompleted) {
                            console.warn('[BONUS COLLECT] Source travel interrupted');
                        }

                        if (sourceFx.node?.isValid) {
                            sourceFx.node.destroy();
                        }

                        registerArrival();
                    }
                );

                this.shrinkSourceDuringTravel(
                    sourceFx,
                    this.travelDuration
                );
            });
        }

        return true;
    }

    private createFx(
        worldPosition: Vec3,
        skin: TileCollectSkin,
        useBombFx: boolean = false,
        bonusFxType: 'rocket_horizontal' | 'rocket_vertical' | 'discoball' | null = null,
    ): TileCollectFx | null {

        if(!this.tileCollectFxPrefab) {
            console.error(
                '[TileCollectFxManager] TileCollectFx Prefab is not assigned'
            );

            return null;
        }

        if(
            !this.fxLayer ||
            !isValid(this.fxLayer, true)
        ) {
            console.error(
                '[TileCollectFxManager] FX Layer is missing or destroyed'
            );

            return null;
        }

        let fxPrefab = this.tileCollectFxPrefab;

        if(useBombFx && this.bombCollectFxPrefab) {
            fxPrefab = this.bombCollectFxPrefab;
        }
        else if(bonusFxType === 'rocket_horizontal' && this.rocketHorizontalCollectFxPrefab) {
            fxPrefab = this.rocketHorizontalCollectFxPrefab;
        }
        else if(bonusFxType === 'rocket_vertical' && this.rocketVerticalCollectFxPrefab) {
            fxPrefab = this.rocketVerticalCollectFxPrefab;
        }
        else if(bonusFxType === 'discoball' && this.discoballCollectFxPrefab) {
            fxPrefab = this.discoballCollectFxPrefab;
        }

        const fxNode = instantiate(fxPrefab);

        this.fxLayer.addChild(
            fxNode
        );

        const localPosition =
            this.worldToFxLayer(
                worldPosition
            );

        fxNode.setPosition(
            localPosition
        );

        const fx =
            fxNode.getComponent(
                TileCollectFx
            );

        if(!fx) {
            console.error(
                '[TileCollectFxManager] TileCollectFx component not found on prefab'
            );

            fxNode.destroy();

            return null;
        }

        fx.testOnStart = false;
        fx.setSkin(skin);

        return fx;
    }

    private shrinkSourceDuringTravel(
        sourceFx: TileCollectFx,
        duration: number
    ) {
        if(
            !sourceFx ||
            !sourceFx.node ||
            !sourceFx.node.isValid
        ) {
            return;
        }

        const node = sourceFx.node;
        const startScale = node.scale.clone();

        const delayDuration =
            duration * this.sourceShrinkStart;

        const shrinkDuration =
            duration - delayDuration;

        tween(node)
            .delay(delayDuration)
            .to(
                shrinkDuration,
                {
                    scale: new Vec3(
                        startScale.x * this.sourceArrivalScale,
                        startScale.y * this.sourceArrivalScale,
                        startScale.z
                    )
                },
                {
                    easing: 'sineIn'
                }
            )
            .start();
    }

    private worldToFxLayer(
        worldPosition: Vec3
    ): Vec3 {

        const transform =
            this.fxLayer.getComponent(
                UITransform
            );


        if(!transform) {

            console.error(
                '[TileCollectFxManager] ' +
                'FX Layer has no UITransform'
            );


            return new Vec3();
        }


        return transform.convertToNodeSpaceAR(
            worldPosition
        );
    }

    private shrinkTargetMassDuringFall(
        targetFx: TileCollectFx,
        duration: number
    ) {
        if(
            !targetFx ||
            !targetFx.node ||
            !targetFx.node.isValid
        ) {
            return;
        }

        Tween.stopAllByTarget(targetFx.node);

        tween(targetFx.node)
            .to(
                Math.max(duration, 0.05),
                {
                    scale: new Vec3(
                        this.targetFallScale,
                        this.targetFallScale,
                        1
                    )
                },
                {
                    easing: 'sineInOut'
                }
            )
            .start();
    }

    private collapseTargetMassToZero(
        targetFx: TileCollectFx,
        onComplete?: () => void
    ) {
        if(!targetFx || !targetFx.node || !targetFx.node.isValid) {
            onComplete?.();
            return;
        }

        Tween.stopAllByTarget(targetFx.node);

        tween(targetFx.node)
            .to(
                this.targetScaleOutDuration,
                {
                    scale: new Vec3(0, 0, 1)
                },
                {
                    easing: 'sineIn'
                }
            )
            .call(() => {

                if(targetFx.node && targetFx.node.isValid) {
                    targetFx.node.destroy();
                }

                onComplete?.();
            })
            .start();
    }
}
