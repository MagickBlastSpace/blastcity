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

    @property(Node)
    fxLayer: Node = null;

    @property
    travelDuration: number = 0.25;

    @property
    targetScaleOutDuration: number = 0.12;

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
        useBombFx: boolean = false
    ): boolean {

        if(!clickedTile || !tileNodes || tileNodes.length === 0 || !this.tileCollectFxPrefab || !this.fxLayer || !isValid(this.fxLayer, true)) {
            return false;
        }

        const targetWorldPosition =clickedTile.worldPosition.clone();
        const sourcePositions: Vec3[] = [];

        for(const tile of tileNodes) {
            if(tile === clickedTile) {
                continue;
            }

            sourcePositions.push( tile.worldPosition.clone() );
        }

        const targetFx = this.createFx(targetWorldPosition, skin);

        if(!targetFx) {
            return false;
        }

        if(sourcePositions.length === 0) {
            targetFx.playCollapse(() => {
                onAllArrived?.();

                targetFx.playAbsorb(() => {
                    onFinalAbsorbComplete?.();
                    this.collapseTargetMassToZero(targetFx, onVisualComplete);
                });
            });

            return true;
        }

        let arrivedCount = 0;
        let targetReady = false;
        let absorbInProgress = false;
        let pendingAbsorbs = 0;
        let allArrivedNotified = false;

        let followNode: Node = null;
        let followCallback: (() => void) | null = null;

        let finishRequested = false;

        let finishStarted = false;

        const startFollowingTarget = (node: Node) => {
            if(!node || !node.isValid || followCallback) {
                return;
            }

            followNode = node;

            followCallback = () => {
                if(!followNode || !followNode.isValid || !targetFx || !targetFx.node || !targetFx.node.isValid) {
                    return;
                }

                targetFx.node.setPosition(this.worldToFxLayer(followNode.worldPosition));
            };

            this.schedule(followCallback, 0);
        };

        const stopFollowingTarget = () => {
            if(followCallback) {
                this.unschedule(followCallback);
                followCallback = null;
            }

            followNode = null;
        };

        const waitUntilTargetSettled = (node: Node, onSettled: () => void) => {
            if(!node || !node.isValid) {
                onSettled();
                return;
            }

            let previousPosition = node.worldPosition.clone();
            let stableFrames = 0;
            let hasMoved = false;
            let totalFrames = 0;

            const checkSettled = () => {
                if(!node || !node.isValid) {
                    this.unschedule(checkSettled);
                    onSettled();
                    return;
                }

                totalFrames++;

                const currentPosition = node.worldPosition.clone();
                const distance = Vec3.distance(previousPosition, currentPosition);

                if(distance >= 0.1) {
                    hasMoved = true;
                    stableFrames = 0;
                }
                else {
                    stableFrames++;
                }

                previousPosition.set(currentPosition);

                const settledAfterMovement = hasMoved && stableFrames >= 3;
                const neverMoved = !hasMoved && totalFrames >= 6;

                if(settledAfterMovement || neverMoved) {
                    this.unschedule(checkSettled);
                    onSettled();
                }
            };

            this.schedule(checkSettled, 0);
        };

        const startFinalVisual = () => {
            if(finishStarted) {
                return;
            }

            if(!finishRequested) {
                return;
            }

            if(!targetReady) {
                return;
            }

            if(absorbInProgress) {
                return;
            }

            finishStarted = true;
            pendingAbsorbs = 0;

            targetFx.playAbsorb(() => {
                onFinalAbsorbComplete?.();

                if(!followNode || !followNode.isValid) {
                    this.collapseTargetMassToZero(targetFx, onVisualComplete);
                    return;
                }

                waitUntilTargetSettled(followNode, () => {
                    this.collapseTargetMassToZero(targetFx, () => {
                        stopFollowingTarget();
                        onVisualComplete?.();
                    });
                });
            });
        };

        const playNextAbsorb = () => {
            if(finishStarted) {
                return;
            }

            if(!targetReady) {
                return;
            }

            if(absorbInProgress) {
                return;
            }

            if(finishRequested) {
                startFinalVisual();
                return;
            }

            if(pendingAbsorbs <= 0) {
                return;
            }

            pendingAbsorbs--;
            absorbInProgress = true;

            targetFx.playAbsorb(() => {
                absorbInProgress = false;

                if(finishRequested) {
                    startFinalVisual();
                    return;
                }

                if(pendingAbsorbs > 0) {
                    targetFx.playTravel();
                }

                playNextAbsorb();
            });
        };

        const registerArrival = () => {
            arrivedCount++;

            const isLastArrival = arrivedCount >= sourcePositions.length;

            if(isLastArrival) {
                if(!allArrivedNotified) {
                    allArrivedNotified = true;

                    const spawnedTarget = onAllArrived?.() ?? null;

                    if(spawnedTarget) {
                        startFollowingTarget(spawnedTarget);
                    }
                }

                finishRequested = true;
                pendingAbsorbs = 0;
                startFinalVisual();
                return;
            }
            pendingAbsorbs++;

            playNextAbsorb();
        };

        targetFx.playCollapse(() => {
            targetReady = true;

            if(finishRequested) {
                startFinalVisual();
                return;
            }

            targetFx.playTravel();
            playNextAbsorb();
        });

        for(const sourceWorldPosition of sourcePositions) {
            const sourceFx = this.createFx(sourceWorldPosition, skin, useBombFx);

            if(!sourceFx) {
                registerArrival();
                continue;
            }

            const targetLocalPosition = this.worldToFxLayer(targetWorldPosition);

            if(useBombFx) {
                this.rotateFxTowardsTarget(sourceFx.node, targetLocalPosition);

                sourceFx.playCollapse(() => {
                    if(sourceFx.node && sourceFx.node.isValid) {
                        sourceFx.node.destroy();
                    }

                    registerArrival();
                });

                continue;
            }

            sourceFx.playCollapse(() => {
                sourceFx.travelTo(
                    targetLocalPosition,
                    this.travelDuration,
                    () => {
                        if(sourceFx.node && sourceFx.node.isValid) {
                            sourceFx.node.destroy();
                        }

                        registerArrival();
                    }
                );
            });
        }

        return true;
    }

    private createFx(
        worldPosition: Vec3,
        skin: TileCollectSkin,
        useBombFx: boolean = false
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

        const fxPrefab = useBombFx && this.bombCollectFxPrefab
            ? this.bombCollectFxPrefab
            : this.tileCollectFxPrefab;

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
