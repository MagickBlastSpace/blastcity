import { _decorator, Node, sp, Sprite, tween, Vec2, Vec3 } from 'cc';
import { UITile } from '../../ui/UITile';
import { TileBase } from '../TileBase';
import { BonusTileBase } from './BonusTileBase';
import { Discoball } from './Discoball';
const { ccclass, property } = _decorator;

@ccclass('Bomb')
export class Bomb extends BonusTileBase {

    @property(Sprite)
    icon: Sprite = null;

    @property(sp.Skeleton)
    bombSpine: sp.Skeleton = null;

    @property
    explosionScaleMultiplier: number = 1.25;

    private bombSpineBaseScale: Vec3 = null;

    private bombCombo_Delay: number = 0.3;
    private rocketCombo_Delay: number = 0.3;

    private spawnVisualInOverlay: Node | null = null;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        const uiTile = this.node.getComponent(UITile);

        if (uiTile && this.bombSpine && uiTile.spine === this.bombSpine) {
            uiTile.keepSpineVisible = true;
        }

        if (this.icon) {
            this.icon.enabled = !this.bombSpine?.skeletonData;
        }

        if(this.bombSpine) {
            if(!this.bombSpineBaseScale) {
                this.bombSpineBaseScale = this.bombSpine.node.scale.clone();
            }

            this.bombSpine.node.setScale(this.bombSpineBaseScale);
            this.bombSpine.node.active = true;

            this.bombSpine.clearTracks();
            this.bombSpine.setToSetupPose();
            this.bombSpine.setAnimation(0, "idle", true);
        }
    }

    private playNewBombAnimation() {
        if(!this.bombSpine) {
            this.playAnimation("bomb", false, 1);
            return;
        }

        if(this.icon) {
            this.icon.enabled = false;
        }

        const visualNode = this.bombSpine.node;

        if(!this.bombSpineBaseScale) {
            this.bombSpineBaseScale = visualNode.scale.clone();
        }

        visualNode.setScale(
            this.bombSpineBaseScale.x * this.explosionScaleMultiplier,
            this.bombSpineBaseScale.y * this.explosionScaleMultiplier,
            this.bombSpineBaseScale.z
        );

        visualNode.active = true;

        this.bombSpine.clearTracks();
        this.bombSpine.setToSetupPose();
        this.bombSpine.setAnimation(0, "activate", false);
    }


    private useLegacyComboVisual() {

        if(this.bombSpine) {
            this.bombSpine.node.active = false;
        }

        if(this.icon) {
            this.icon.enabled = true;
        }
    }


    getMatches(
        field: Node[][],
        statuses: Node[][],
        isBlockingCombo: boolean
    ): Node[] {

        if(this.isActivated) {
            return [];
        }

        this.isActivated = true;

        this.combo = "";

        if(!isBlockingCombo) {
            this.getCombo(field);
        }

        return this.getBombMatchesByType(
            field,
            statuses
        );
    }


    private getBombMatchesByType(
        field: Node[][],
        statuses: Node[][]
    ): Node[] {

        if(this.isCombo()) {

            this.useLegacyComboVisual();

            return this.getMatchesByCombo(
                field,
                statuses
            );
        }

        return this.getBombMatches(
            field,
            statuses,
            this.row,
            this.col
        );
    }

    getBombMatches(field: Node[][], statuses: Node[][], row: number, col: number): Node[] {
        let matches = [];

        this.playNewBombAnimation();
        this.playBombSound();

        const totalTime = this.respawnDelay / 2;
        const timeStep = totalTime / 9;

        let counter = 0;

        for(let i = this.row - 1; i <= this.row + 1; i++) {
            for(let j = this.col - 1; j <= this.col + 1; j++) {
                let isBonusChain = i !== this.row || j !== this.col
                isBonusChain = isBonusChain && !this.isBonusPoolState;

                this.node.emit("extra_hit", i, j, isBonusChain, timeStep * counter);

                counter = counter + 1;
            }
        }

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
        let matches = [];

        this.playAnimation("rocket_bomb", false, 1);
        this.playComboSound();
        this.playHideAnimation(this.icon.node);

        this.hideCombinationNode(field);

        const comboPartner = this.comboPosition
            ? field[this.comboPosition.x]?.[this.comboPosition.y]
            : null;

        this.scheduleOnce(() => {
            this.crossExtraHit(field, this.row, this.col);

            if (comboPartner?.isValid) {
                const partnerComp = comboPartner.getComponent(TileBase);

                if (partnerComp?.isValid) {
                    const partnerRow = partnerComp.getRow();
                    const partnerCol = partnerComp.getCol();

                    if (field[partnerRow]?.[partnerCol] === comboPartner) {
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
        }, this.rocketCombo_Delay);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.playAnimation("bomb_bomb", false, 1);
        this.playComboSound();
        this.playHideAnimation(this.icon.node);
        this.hideCombinationNode(field);

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const totalTime = this.respawnDelay / 2;
        const timeStep = totalTime / 49;

        let counter = 0;

        this.scheduleOnce(() => {
            for(let i = this.row - 3; i <= this.row + 3; i++) {
                for(let j = this.col - 3; j <= this.col + 3; j++) {
                    let isBonusChain = true;
                    if(i === this.row && j === this.col) {
                        isBonusChain = false;
                    }
                    else if(i > this.row - 2 && i < this.row + 2 && j > this.col - 2 && j < this.col + 2) {
                        if(i >= 0 && i < numRows && j >= 0 && j < numCols) {
                            let tile = field[i][j];
                            if(tile !== null && tile !== undefined) {
                                const tileComp = tile.getComponent(TileBase);
                                if(
                                    tileComp &&
                                    tileComp.getTileType() === this.tileType
                                ) {
                                    isBonusChain = false;
                                }
                            }
                        }
                    }

                    this.node.emit("extra_hit", i, j, isBonusChain, timeStep * counter);

                    counter = counter + 1;
                }
            }

            this.setRespawnEvent(timeStep * counter);
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

        const discoComp = field[this.comboPosition.x]?.[this.comboPosition.y]?.getComponent(Discoball);

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

        this.setDiscoballComboAnimation(field[this.comboPosition.x][this.comboPosition.y], this.disco_combo_time / totalTime);

        this.playComboSound();

        return matches;
    }

    changeTile(tile: TileBase) {
        this.node.emit("change_bonus", tile.getRow(), tile.getCol(), "bomb", true);
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    setDiscoballComboAnimation(disco: Node, timeScale: number) {
        const discoComp = disco.getComponent(Discoball);
        if (discoComp) {
            discoComp.activateIsolatedDiscoballAnimation(timeScale);
        }
    }

    setBonusPoolAnimation() {
        //this.isBonusPoolState = true;

        this.scheduleOnce(() => {
            this.playAnimation("bomb_discoball", true, 1);
        }, 0.2);
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

    public hideForSpawn() {
        if(!this.bombSpine) {
            return;
        }

        this.bombSpine.clearTracks();
        this.bombSpine.node.active = false;
    }


    public playSpawnAnimation(overlayLayer?: Node): void {
        const spine = this.bombSpine;

        const showFallbackIcon = (): void => {
            if (!this.node.isValid || this.isActivated) return;

            if (this.icon?.node?.isValid) {
                this.icon.node.active = true;
                this.icon.enabled = true;
            }
        };

        if (!spine?.node?.isValid || !spine.skeletonData) {
            console.warn('[BOMB SPAWN] Spine unavailable');
            showFallbackIcon();
            return;
        }

        const visualNode = spine.node;
        const originalParent = visualNode.parent;

        if (!originalParent?.isValid) {
            console.warn('[BOMB SPAWN] Original parent missing');
            showFallbackIcon();
            return;
        }

        const originalSiblingIndex = visualNode.getSiblingIndex();
        const originalPosition = visualNode.position.clone();
        const originalRotation = visualNode.rotation.clone();
        const originalScale = visualNode.scale.clone();

        let finished = false;

        const finish = (reason: string): void => {
            if (finished) return;
            finished = true;

            this.spawnVisualInOverlay = null;

            if (!visualNode.isValid) {
                showFallbackIcon();
                return;
            }

            if (!this.node.isValid || !originalParent.isValid) {
                visualNode.destroy();
                return;
            }

            try {
                if (visualNode.parent !== originalParent) {
                    visualNode.setParent(originalParent);
                }

                visualNode.setPosition(originalPosition);
                visualNode.setRotation(originalRotation);
                visualNode.setScale(originalScale);

                visualNode.setSiblingIndex(
                    Math.min(
                        originalSiblingIndex,
                        originalParent.children.length - 1
                    )
                );

                if (!this.isActivated) {
                    visualNode.active = true;
                    spine.enabled = true;

                    if (reason !== 'complete') {
                        spine.clearTracks();
                        spine.setToSetupPose();

                        if (spine.findAnimation('idle')) {
                            spine.setAnimation(0, 'idle', true);
                        } else {
                            visualNode.active = false;
                            showFallbackIcon();
                        }
                    }
                }

                if (reason !== 'complete') {
                    console.warn(
                        '[BOMB SPAWN RECOVERED]',
                        this.node.uuid,
                        reason
                    );
                }

            } catch (error) {
                console.error('[BOMB SPAWN RESTORE ERROR]', error);
                showFallbackIcon();
            }
        };

        try {
            if (overlayLayer?.isValid) {
                visualNode.setParent(overlayLayer, true);
                visualNode.setSiblingIndex(
                    overlayLayer.children.length - 1
                );

                this.spawnVisualInOverlay = visualNode;
            }

            visualNode.active = true;
            spine.enabled = true;

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

            spine.addAnimation(0, 'idle', true, 0);

            this.scheduleOnce(() => {
                finish('timeout');
            }, 5);

        } catch (error) {
            console.error('[BOMB SPAWN ERROR]', error);
            finish('exception');
        }
    }

    public onDestroy(): void {
        if (
            this.spawnVisualInOverlay &&
            this.spawnVisualInOverlay.isValid
        ) {
            this.spawnVisualInOverlay.destroy();
        }

        this.spawnVisualInOverlay = null;

        super.onDestroy();
    }
}


