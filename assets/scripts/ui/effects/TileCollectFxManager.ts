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
        let absorbInProgress = false;
        let pendingAbsorbs = 0;
        let isFinished = false;

        const finishCollection = () => {
            if(isFinished) {
                return;
            }

            isFinished = true;
            pendingAbsorbs = 0;

            const targetNode = targetFx.node;

            if(targetNode && isValid(targetNode, true)) {
                Tween.stopAllByTarget(targetNode);

                targetNode.setScale(0, 0, 0);
                targetNode.active = false;
                targetNode.destroy();
            }

            onAllArrived?.();
            onFinalAbsorbComplete?.();

            onVisualComplete?.();

            console.log('[BONUS COLLECT COMPLETE]', {
                arrived: arrivedCount,
                total: sourcePositions.length,
                bonusFxType,
                useBombFx
            });
        };

        const playNextAbsorb = () => {
            if(
                isFinished ||
                !targetReady ||
                absorbInProgress ||
                pendingAbsorbs <= 0
            ) {
                return;
            }

            if(!targetFx.node?.isValid) {
                return;
            }

            pendingAbsorbs--;
            absorbInProgress = true;

            targetFx.playAbsorb(() => {
                absorbInProgress = false;

                if(isFinished || !targetFx.node?.isValid) {
                    return;
                }

                targetFx.playTravel();

                if(pendingAbsorbs > 0) {
                    playNextAbsorb();
                }
            });
        };

        const registerArrival = () => {
            if(isFinished) {
                return;
            }

            arrivedCount++;

            const isLastArrival =
                arrivedCount >= sourcePositions.length;

            if(isLastArrival) {
                finishCollection();
                return;
            }

            pendingAbsorbs++;
            playNextAbsorb();
        };

        targetFx.playCollapse(() => {
            if(isFinished || !targetFx.node?.isValid) {
                return;
            }

            targetReady = true;

            targetFx.playTravel();
            playNextAbsorb();

            if(sourcePositions.length === 0) {
                finishCollection();
            }
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

                sourceFx.playCollapse(() => {
                    if(sourceFx.node?.isValid) {
                        sourceFx.node.destroy();
                    }

                    registerArrival();
                });

                continue;
            }

            sourceFx.playCollapse(() => {
                if(isFinished) {
                    if(sourceFx.node?.isValid) {
                        sourceFx.node.destroy();
                    }

                    return;
                }

                sourceFx.travelTo(
                    targetLocalPosition,
                    this.travelDuration,
                    () => {
                        if(sourceFx.node?.isValid) {
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

        fx.setSkin(
            skin
        );

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
