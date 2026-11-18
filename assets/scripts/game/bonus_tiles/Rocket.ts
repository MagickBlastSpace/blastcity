import { _decorator, instantiate, Node, sp, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { UITile } from '../../ui/UITile';
import { TileBase } from '../TileBase';
import { BonusTileBase } from './BonusTileBase';
import { Discoball } from './Discoball';
const { ccclass, property } = _decorator;

@ccclass('Rocket')
export class Rocket extends BonusTileBase {

    @property(SpriteFrame)
    rocketVertical: SpriteFrame = null;
    @property(SpriteFrame)
    rocketHorizontal: SpriteFrame = null;

    @property(sp.Skeleton)
    spawnSpine: sp.Skeleton = null;

    @property(Sprite)
    icon: Sprite = null;

    @property
    explosionScaleMultiplier: number = 1.25;

    private bombCombo_Delay: number = 0.3;

    private spawnVisualInOverlay: Node = null;



    private playNewRocketExplosion( direction: 'rocket_horizontal' |
         'rocket_vertical' = this.tileType as 'rocket_horizontal' |
         'rocket_vertical' ): void {
        const sourceSpine = this.spawnSpine;
        const uiTile = this.node.getComponent(UITile);

        if(!sourceSpine || !sourceSpine.skeletonData) {
            console.warn('[ROCKET EXPLOSION] Source Spine missing');
            return;
        }

        const overlayLayer = uiTile?.getAnimationsLayout();

        if(!overlayLayer || !overlayLayer.isValid) {
            console.warn('[ROCKET EXPLOSION] AnimationsLayer missing');
            return;
        }

        const worldPosition = this.node.worldPosition.clone();

        const visualNode = instantiate(sourceSpine.node);
        const skeleton = visualNode.getComponent(sp.Skeleton);

        if(!skeleton) {
            visualNode.destroy();
            console.warn('[ROCKET EXPLOSION] Cloned Skeleton missing');
            return;
        }

        overlayLayer.addChild(visualNode);
        visualNode.setWorldPosition(worldPosition);
        visualNode.setSiblingIndex(overlayLayer.children.length - 1);

        skeleton.enabled = true;
        visualNode.active = true;

        const baseScale = sourceSpine.node.scale;

        visualNode.setScale(
            baseScale.x * this.explosionScaleMultiplier,
            baseScale.y * this.explosionScaleMultiplier,
            baseScale.z
        );

        visualNode.setRotationFromEuler(
            0,
            0,
            direction === 'rocket_vertical' ? 90 : 0
        );

        try {
            if(!skeleton.findAnimation('activate')) {
                throw new Error('Spine animation "activate" unavailable');
            }

            skeleton.clearTracks();
            skeleton.setToSetupPose();

            const track = skeleton.setAnimation(0, 'activate', false);

            if(!track) {
                throw new Error('Cannot start rocket activate');
            }

            uiTile?.setSpineDestroyOnly(true);

            if(this.icon) {
                this.icon.enabled = false;
            }

            let visualRemoved = false;

            const cleanupExplosionVisual = (): void => {
                if (visualRemoved) {
                    return;
                }

                visualRemoved = true;

                if (visualNode.isValid) {
                    visualNode.destroy();
                }
            };

            skeleton.setTrackCompleteListener(
                track,
                cleanupExplosionVisual
            );

            skeleton.setTrackInterruptListener(
                track,
                cleanupExplosionVisual
            );

            skeleton.setTrackEndListener(
                track,
                cleanupExplosionVisual
            );

            tween(visualNode)
                .delay(5)
                .call(cleanupExplosionVisual)
                .start();


            console.log('[ROCKET EXPLOSION OVERLAY]', {
                type: this.tileType,
                position: worldPosition.toString(),
                rotation:  direction === 'rocket_vertical' ? 90 : 0,
                scale: visualNode.scale.toString(),
                duration: track.animation?.duration,
                parent: visualNode.parent?.name
            });

        } catch(error) {
            console.error('[ROCKET EXPLOSION] Failed:', error);

            if(visualNode.isValid) {
                visualNode.destroy();
            }
        }
    }

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.icon.spriteFrame = this.tileType === 'rocket_vertical' ? this.rocketVertical : this.rocketHorizontal;
    }

    onDestroy() {
        console.log( '[ROCKET DESTROY]', this.node.uuid, this.tileType);

        if(
            this.spawnVisualInOverlay &&
            this.spawnVisualInOverlay.isValid
        ) {
            this.spawnVisualInOverlay.destroy();
        }

        this.spawnVisualInOverlay = null;

        super.onDestroy();
    }

    getMatches(field: Node[][], statuses: Node[][], isBlockingCombo: boolean): Node[] {
        if(this.isActivated) {
            return [];
        }

        this.isActivated = true;

        this.combo = "";
        if(!isBlockingCombo) {
            this.getCombo(field);
        }

        console.log('[ROCKET ACTIVATION PATH]', {
            type: this.tileType,
            isBlockingCombo,
            combo: this.combo,
            row: this.row,
            col: this.col
        });

        let matches = this.getRocketMatchesByType(field, statuses);

        return matches;
    }


    getRocketMatchesByType(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        if(this.isCombo()) {
            matches = this.getMatchesByCombo(field, statuses);
            return matches;
        }

        this.playNewRocketExplosion();

        switch(this.tileType) {
            case 'rocket_vertical':
                this.colExtraHit(field, this.row, this.col);
                break;
            case 'rocket_horizontal':
                this.rowExtraHit(field, this.row, this.col);
                break;
        }

        this.playRocketSound();

        return matches;
    }


    getMatchesByCombo(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        if(this.combo === "rocket_vertical" || this.combo === "rocket_horizontal") {
            matches = this.getRocketComboMatches(field, statuses);
        }
        else if(this.combo === "bomb") {
            matches = this.getBombComboMatches(field, statuses);
        }
        else if(this.combo === "multi" || this.combo === "super") {
            matches = this.getDiscoballComboMatches(field, statuses);
        }

        return matches;
    }


    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        const matches = [];

        this.playNewRocketExplosion('rocket_horizontal');
        this.playNewRocketExplosion('rocket_vertical');

        this.playComboSound();

        this.rowExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col);

        return matches;
    }


    getBombComboMatches(
        field: Node[][],
        statuses: Node[][]
    ): Node[] {
        const matches: Node[] = [];

        const comboPartner = this.comboPosition
            ? field[this.comboPosition.x]?.[this.comboPosition.y] ?? null
            : null;

        this.playAnimation("rocket_bomb", false, 1);
        this.playComboSound();

        if (this.icon?.node?.isValid) {
            this.playHideAnimation(this.icon.node);
        }

        this.hideCombinationNode(field);

        this.scheduleOnce(() => {
            this.crossExtraHit(field, this.row, this.col);

            if (comboPartner?.isValid) {
                const partnerComp = comboPartner.getComponent(TileBase);

                if (partnerComp?.isValid) {
                    const partnerRow = partnerComp.getRow();
                    const partnerCol = partnerComp.getCol();

                    if (
                        field[partnerRow]?.[partnerCol] === comboPartner
                    ) {
                        console.log('[COMBO PARTNER CONSUME]', {
                            sourceUuid: this.node.uuid,
                            targetUuid: comboPartner.uuid,
                            row: partnerRow,
                            col: partnerCol,
                            type: partnerComp.getTileType()
                        });

                        this.node.emit(
                            'extra_hit',
                            partnerRow,
                            partnerCol,
                            false,
                            0
                        );
                    }
                }
            }

            this.setRespawnEvent(this.respawnDelay);

        }, this.bombCombo_Delay);

        return matches;
    }


    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];
        tiles = this.combo === "super" ? this.getTwoBiggestCommonTilesGroups(field, statuses) : this.getBiggestCommonTilesGroup(field, statuses);
        for(let i = 0; i < tiles.length; i++) {
            this.node.emit("goal", "discoball");
        }

        let totalTime = this.timeBetweenTiles * tiles.length;
        totalTime = totalTime < this.disco_combo_time ? this.disco_combo_time : totalTime;

        const discoComp = field[this.comboPosition.x]?.[this.comboPosition.y] ?.getComponent(Discoball);

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    let comboComp = field[this.comboPosition.x][this.comboPosition.y].getComponent(TileBase);
                    if(comboComp) {
                       this.renderLine(
                            new Vec2(comboComp.getRow(), comboComp.getCol()),
                            new Vec2(tiles[i].getRow(), tiles[i].getCol()),
                            discoComp?.getLineSkinName() ?? 'blue',
                            discoComp?.getLineAnimationForTarget(tiles[i].getTileType()) ?? 'line_color_1'
                        );
                    }
                }
                catch (error) {
                    console.log("Render Line Error: " + error);
                }

                this.changeTile(tiles[i]);
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("clear_lines");

            this.node.emit("extra_hit", this.row, this.col, false, 0);
            this.node.emit("extra_hit", this.comboPosition.x, this.comboPosition.y, false, 0);

            this.node.emit("activate_bonus_pool");
        }, totalTime);

        this.setDicoballComboAnimation(field[this.comboPosition.x][this.comboPosition.y], this.disco_combo_time / totalTime);

        this.playComboSound();

        return matches;
    }

    changeTile(tile: TileBase) {
        const rocketType = Math.floor(Math.random() * 2);
        const rocketString = rocketType === 0 ? "rocket_vertical" : "rocket_horizontal";
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), rocketString, true);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    setDicoballComboAnimation(disco: Node, timeScale: number) {
        const discoComp = disco.getComponent(Discoball);

        if (discoComp) {
            discoComp.activateIsolatedDiscoballAnimation(timeScale);
        }
    }

    setBonusPoolAnimation() {
        //this.isBonusPoolState = true;

        if(!this.spawnSpine?.skeletonData) {
            console.warn('[ROCKET BONUS POOL] New Spine is missing');
        }
    }

    hideCombinationNode(field: Node[][]): void {
        if (!this.comboPosition) return;

        const row = this.comboPosition.x;
        const col = this.comboPosition.y;

        const targetNode = field[row]?.[col];

        if (!targetNode?.isValid) {
            console.warn('[COMBO HIDE] Target missing', {
                source: this.tileType,
                row,
                col
            });
            return;
        }

        const target = targetNode.getComponent(TileBase);
        const bonus = targetNode.getComponent('BonusTileBase') as any;

        console.warn('[COMBO HIDE ROOT]', {
            sourceType: this.tileType,
            sourceUuid: this.node.uuid,
            targetType: target?.getTileType(),
            targetUuid: targetNode.uuid,
            row,
            col,
            activated: bonus?.isTileActivated?.() ?? 'unknown',
            scaleBefore: targetNode.scale.toString()
        });

        this.playHideAnimation(targetNode);
    }

    playHideAnimation(nodeToHide: Node) {
        tween(nodeToHide)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();
    }

    private restoreRocketIcon(): void {
        if (!this.node.isValid || this.isActivated) {
            return;
        }

        if (this.icon?.node?.isValid) {
            this.icon.enabled = true;
            this.icon.node.active = true;
        }
    }

    public playSpawnAnimation(overlayLayer?: Node): void {
        const spine = this.spawnSpine;

        if (!spine?.node?.isValid || !spine.skeletonData) {
            console.warn('[ROCKET SPAWN] Spine missing', this.node.uuid);
            this.restoreRocketIcon();
            return;
        }

        const visualNode = spine.node;
        const originalParent = visualNode.parent;

        if (!originalParent?.isValid) {
            console.warn('[ROCKET SPAWN] Original parent missing');
            this.restoreRocketIcon();
            return;
        }

        const originalPosition = visualNode.position.clone();
        const originalRotation = visualNode.rotation.clone();
        const originalScale = visualNode.scale.clone();

        let finished = false;

        const finish = (reason: string): void => {
            if (finished) {
                return;
            }

            finished = true;
            this.spawnVisualInOverlay = null;

            if (visualNode.isValid) {
                if (this.node.isValid && originalParent.isValid) {
                    if (visualNode.parent !== originalParent) {
                        visualNode.setParent(originalParent);
                    }

                    visualNode.setPosition(originalPosition);
                    visualNode.setRotation(originalRotation);
                    visualNode.setScale(originalScale);
                    visualNode.active = false;
                } else {
                    visualNode.destroy();
                }
            }

            this.restoreRocketIcon();

            if (reason === 'complete') {
                console.log( '[ROCKET SPAWN COMPLETE]', this.node.uuid, this.tileType );
            } else {
                console.warn( '[ROCKET SPAWN RECOVERED]', this.node.uuid, this.tileType, reason );
            }
        };

        try {
            if (this.icon?.node?.isValid) {
                this.icon.node.active = false;
            }

            if (overlayLayer?.isValid) {
                visualNode.setParent(overlayLayer, true);
                visualNode.setSiblingIndex(overlayLayer.children.length - 1);

                this.spawnVisualInOverlay = visualNode;
            }

            visualNode.active = true;

            visualNode.setRotationFromEuler( 0, 0, this.tileType === 'rocket_vertical' ? 90 : 0 );

            spine.clearTracks();
            spine.setToSetupPose();

            const track = spine.setAnimation(0, 'spawn', false);

            if (!track) {
                finish('missing-track');
                return;
            }

            spine.setTrackCompleteListener(
                track,
                () => finish('complete')
            );

            spine.setTrackInterruptListener(
                track,
                () => finish('interrupt')
            );

            spine.setTrackEndListener(
                track,
                () => finish('end')
            );

            this.scheduleOnce(() => {
                finish('timeout');
            }, 5);

        } catch (error) {
            console.error('[ROCKET SPAWN ERROR]', error);
            finish('exception');
        }
    }
}


