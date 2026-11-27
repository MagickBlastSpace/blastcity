import { _decorator, instantiate, isValid, Node, sp, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { UITile } from '../../ui/UITile';
import { SpriteTileData } from '../Tile';
import { TileBase } from '../TileBase';
import { BonusTileBase } from './BonusTileBase';

const { ccclass, property } = _decorator;

type DiscoballTarget = {
    row: number;
    col: number;
    color: string;
    node: Node;
};

@ccclass('Discoball')
export class Discoball extends BonusTileBase {

    @property(SpriteFrame)
    multi: SpriteFrame = null;

    @property(SpriteFrame)
    super: SpriteFrame = null;

    @property([SpriteTileData])
    multiIcons: SpriteTileData[] = [];

    @property([SpriteTileData])
    superIcons: SpriteTileData[] = [];

    @property(Sprite)
    icon: Sprite = null;

    @property(sp.Skeleton)
    discoballSpine: sp.Skeleton = null;

    private primaryColor: string = '';
    private secondaryColor: string = '';

    private disco_disco_time: number = 0.7;
    private currentSpineSkin: string = '';
    private isSpineSpawned: boolean = false;
    private isSpineActivationStarted: boolean = false;
    private isSpineActivationCompleted: boolean = false;
    private activeFxNode: Node | null = null;
    private activeHoldNode: Node | null = null;
    private activeReadyCallbacks: Array<() => void> = [];

    init(row: number, col: number, tileType: string): void {
        super.init(row, col, tileType);

        const uiTile = this.node.getComponent(UITile);

        if (
            uiTile &&
            this.discoballSpine &&
            uiTile.spine === this.discoballSpine
        ) {
            uiTile.keepSpineVisible = true;
        }

        if(this.icon) {
            this.icon.spriteFrame = (this.tileType === 'multi' ? this.multi : this.super) ?? this.icon.spriteFrame;
            this.icon.enabled = true;
        }
    }

    getMatches(field: Node[][], statuses: Node[][], isBlockingCombo: boolean): Node[] {
        if(this.isActivated) return [];

        this.combo = '';
        if(!isBlockingCombo) this.getCombo(field);

        return isBlockingCombo
            ? this.getMatchesClear(field, statuses)
            : this.getDiscoballMatchesByType(field, statuses);
    }

    getMatchesClear(field: Node[][], statuses: Node[][]): Node[] {
        return this.getDiscoballMatchesByType(field, statuses);
    }

    getDiscoballMatchesByType(field: Node[][], statuses: Node[][]): Node[] {
        if(this.isActivated) return [];
        this.isShifts = false;

        if(this.isCombo()) return this.getMatchesByCombo(field, statuses);

        const tiles = this.tileType === 'super'
            ? this.getTwoBiggestCommonTilesGroups(field, statuses)
            : this.getBiggestCommonTilesGroup(field, statuses);

        this.isActivated = true;
        const targets = this.toTargets(tiles);

        for(const tile of tiles) {
            tile.startShake();
            this.node.emit('goal', 'discoball');
        }

        this.reserveRespawnForLines(targets.length);

        this.activateIsolatedDiscoballAnimation(1, undefined, () => {
            this.launchTargetLines(field, targets, target=> {
                this.node.emit('extra_hit_with_damage', target.row, target.col);
            }, () => {
                this.node.emit('clear_lines');
                this.finishActiveFx(() => {
                    if(!this.node.isValid) return;
                    this.node.emit('extra_hit_with_damage', this.row, this.col);
                    this.setRespawnEvent(0);
                });
            });
        });

        this.playDiscoballSound();
        return [];
    }

    getMatchesByCombo(field: Node[][], statuses: Node[][]): Node[] {
        this.isActivated = true;

        if(this.combo === 'rocket_vertical' || this.combo === 'rocket_horizontal') {
            return this.getRocketComboMatches(field, statuses);
        }
        if(this.combo === 'bomb') return this.getBombComboMatches(field, statuses);
        if(this.availableColors.includes(this.combo) || this.combo === 'multi') {
            return this.getDiscoballComboMatches(field, statuses);
        }
        if(this.combo === 'super') return this.getSuperDiscoballComboMatches(field, statuses);

        return [];
    }

    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        return this.startBonusCombo(field, statuses, 'rocket');
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        return this.startBonusCombo(field, statuses, 'bomb');
    }

    private startBonusCombo(field: Node[][], statuses: Node[][], bonus: 'rocket' | 'bomb'): Node[] {
        const tiles = this.tileType === 'super'
            ? this.getTwoBiggestCommonTilesGroups(field, statuses)
            : this.getBiggestCommonTilesGroup(field, statuses);
        const targets = this.toTargets(tiles);

        for(const target of targets) this.node.emit('goal', 'discoball');
        this.reserveRespawnForLines(targets.length);

        this.activateIsolatedDiscoballAnimation(1, undefined, () => {
            this.launchTargetLines(field, targets, target => {
                const bonusType = bonus === 'bomb'
                    ? 'bomb'
                    : Math.random() < 0.5 ? 'rocket_vertical' : 'rocket_horizontal';

                this.node.emit('change_bonus', target.row, target.col, bonusType, true);
            }, () => {
                this.node.emit('clear_lines');

                this.finishActiveFx(() => {
                    if(!this.node.isValid) return;

                    if(!this.comboPosition) {
                        console.error('[DISCO COMBO] Partner position missing');
                        this.setRespawnEvent(0);
                        return;
                    }

                    const originalBonusType = bonus === 'bomb'
                        ? 'bomb'
                        : this.combo;

                    console.log('[DISCO COMBO] Preserve original bonuses', {
                        discoball: [this.row, this.col],
                        partner: [this.comboPosition.x, this.comboPosition.y],
                        bonusType: originalBonusType
                    });

                    this.node.emit(
                        'finish_discoball_bonus_combo',
                        this.row,
                        this.col,
                        this.comboPosition.x,
                        this.comboPosition.y,
                        originalBonusType
                    );
                });
            });
        });

        this.playComboSound();
        return [];
    }

    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        const numRows = field.length;
        const numCols = numRows > 0 ? field[0].length : 0;
        this.setRespawnEvent(this.getActiveDuration() + 0.15 + this.respawnDelay + 0.35);
        this.playDoubleDiscoballSound();

        this.startBothDiscoballActives(field, other => {
            this.finishBothDiscoballFx(other, () => {
                for(let i = 0; i < numRows; i++) {
                    for(let j = 0; j < numCols; j++) {
                        this.node.emit('extra_hit', i, j, this.isChain(i, j), 0);
                        this.node.emit('goal', 'discoball');
                    }
                }
                this.clearTiles();
                this.setRespawnEvent(0);
            });
        });
        return [];
    }

    getSuperDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        const numRows = field.length;
        const numCols = numRows > 0 ? field[0].length : 0;
        this.setRespawnEvent(this.getActiveDuration() + this.disco_disco_time + 0.15 + this.respawnDelay + 0.35);
        this.playDoubleDiscoballSound();

        this.startBothDiscoballActives(field, other => {
            this.finishBothDiscoballFx(other, () => {
                for(let i = 0; i < numRows; i++) {
                    for(let j = 0; j < numCols; j++) {
                        if(i === this.row && j === this.col) continue;
                        this.node.emit('extra_hit', i, j, this.isChain(i, j), 0);
                        this.node.emit('goal', 'discoball');
                    }
                }

                this.scheduleOnce(() => {
                    if(!this.node.isValid) return;
                    for(let i = 0; i < numRows; i++) {
                        for(let j = 0; j < numCols; j++) {
                            this.node.emit('extra_hit', i, j, this.isChain(i, j), 0);
                            this.node.emit('goal', 'discoball');
                        }
                    }
                    this.clearTiles();
                    this.setRespawnEvent(0);
                }, this.disco_disco_time);
            });
        });
        return [];
    }

    private getComboDiscoball(field: Node[][]): Discoball | null {
        if(!this.comboPosition) return null;
        const tile = field[this.comboPosition.x]?.[this.comboPosition.y];
        if(!tile?.isValid || tile === this.node) return null;
        const other = tile.getComponent(Discoball);
        if(!other?.isValid) return null;
        return other;
    }

    private startBothDiscoballActives(field: Node[][], onReady: (other: Discoball | null) => void): void {
        const other = this.getComboDiscoball(field);
        let pending = other ? 2 : 1;
        const ready = () => {
            pending--;
            if(pending === 0 && this.node.isValid) onReady(other);
        };

        this.activateIsolatedDiscoballAnimation(1, undefined, ready);
        if(other) other.activateIsolatedDiscoballAnimation(1, undefined, ready);
    }

    private finishBothDiscoballFx(other: Discoball | null, onFinished: () => void): void {
        let pending = other ? 2 : 1;
        const finished = () => {
            pending--;
            if(pending === 0) onFinished();
        };

        this.finishActiveFx(finished);
        if(other?.isValid) other.finishActiveFx(finished);
        else if(other) finished();
    }

    private toTargets(tiles: TileBase[]): DiscoballTarget[] {
        return tiles.map(tile => ({
            row: tile.getRow(),
            col: tile.getCol(),
            color: tile.getTileType(),
            node: tile.node
        })).filter(target => target.row !== this.row || target.col !== this.col);
    }

    private isTargetAvailable(field: Node[][], target: DiscoballTarget): boolean {
        const tile = field[target.row]?.[target.col];

        if(!tile || !isValid(tile, true)) return false;
        if(tile !== target.node) return false;
        if(!tile.activeInHierarchy) return false;

        const tileComp = tile.getComponent(TileBase);

        if(!tileComp || !isValid(tileComp, true)) return false;
        if(tileComp.isEmptyTile()) return false;
        if(tileComp.getTileType() !== target.color) return false;

        return true;
    }

    private launchTargetLines(
        field: Node[][],
        targets: DiscoballTarget[],
        onHit: (target: DiscoballTarget) => void,
        onAllFinished: () => void
    ): void {
        const availableTargets = targets.filter(target => this.isTargetAvailable(field, target));

        console.log('[DISCO TARGETS FILTERED]', {
            original: targets.length,
            available: availableTargets.length,
            skipped: targets.length - availableTargets.length
        });

        if(availableTargets.length === 0) {
            onAllFinished();
            return;
        }

        let remaining = availableTargets.length;
        const from = new Vec2(this.row, this.col);

        const finishTarget = (): void => {
            remaining--;

            if(remaining === 0) {
                onAllFinished();
            }
        };

        for(let i = 0; i < availableTargets.length; i++) {
            const target = availableTargets[i];
            const to = new Vec2(target.row, target.col);
            const skin = this.getLineSkinName();
            const animation = this.getLineAnimationForTarget(target.color);

            this.scheduleOnce(() => {
                if(!isValid(this, true) || !isValid(this.node, true)) return;

                if(!this.isTargetAvailable(field, target)) {
                    console.log('[DISCO LINE SKIPPED]', {
                        row: target.row,
                        col: target.col,
                        color: target.color
                    });

                    finishTarget();
                    return;
                }

                let completed = false;

                const complete = (reached: boolean) => {
                    if(completed) return;
                    completed = true;

                    if(!isValid(this, true) || !isValid(this.node, true)) return;

                    if(!reached) {
                        console.warn('[DISCO LINE] Visual failed, finishing gameplay target:', target);
                    }

                    try {
                        onHit(target);
                    } catch(error) {
                        console.error('[DISCO LINE] Target action failed:', target, error);
                    }

                    console.log('[DISCO LINE ARRIVED]', {
                        row: target.row,
                        col: target.col,
                        color: target.color,
                        remaining: remaining - 1
                    });

                    finishTarget();
                };

                try {
                    this.renderLine(from, to, skin, animation, complete);
                } catch(error) {
                    console.error('[DISCO LINE] renderLine failed:', error);
                    complete(false);
                }
            }, i * this.timeBetweenTiles);
        }
    }

    private getActiveDuration(): number {
        try {
            return Math.max(0.8333, this.discoballSpine?.findAnimation('active')?.duration ?? 0.8333);
        } catch(error) {
            return 0.8333;
        }
    }

    private getMaxLineDuration(): number {
        let duration = 0.87;
        this.node.emit('get_discoball_line_duration', (actual: number) => {
            if(Number.isFinite(actual) && actual > 0) duration = Math.max(duration, actual);
        });
        return duration;
    }

    private reserveRespawnForLines(targetCount: number): void {
        const lastStart = Math.max(0, targetCount - 1) * this.timeBetweenTiles;
        const scheduledTime = this.getActiveDuration() + lastStart + this.getMaxLineDuration() + 0.15 + 0.3;
        this.setRespawnEvent(scheduledTime);
        console.log('[DISCO RESPAWN RESERVED]', { targetCount, scheduledTime });
    }

    changeTile(tile: TileBase, tileType: string): void {
        if(!tile) return;
        try {
            this.node.emit('change_bonus', tile.getRow(), tile.getCol(), tileType, true);
        } catch(error) {
            console.error('[DISCO] changeTile failed:', error);
        }
    }

    setRespawnEvent(timeToRespawn: number): void {
        this.node.emit('respawn', timeToRespawn);
    }

    isChain(row: number, col: number): boolean {
        return row !== this.row && col !== this.col && row !== this.row + 1 && row !== this.row - 1 && col !== this.col + 1 && col !== this.col - 1;
    }

    activateDiscoballComboAnimation(field: Node[][]): void {
        const other = this.getComboDiscoball(field);
        if(other) other.activateIsolatedDiscoballAnimation(1);
    }

    playHideAnimation(nodeToHide: Node, onFinished?: () => void): void {
        if(!nodeToHide?.isValid) {
            onFinished?.();
            return;
        }
        tween(nodeToHide)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .call(() => onFinished?.())
            .start();
    }

    private finishActiveFx(onFinished: () => void): void {
        const activeNode = this.activeFxNode;
        const holdNode = this.activeHoldNode;

        let finished = false;

        const finish = (): void => {
            if (finished) return;
            finished = true;

            if (activeNode?.isValid) {
                activeNode.destroy();
            }

            if (holdNode?.isValid) {
                holdNode.destroy();
            }

            if (this.activeFxNode === activeNode) {
                this.activeFxNode = null;
            }

            if (this.activeHoldNode === holdNode) {
                this.activeHoldNode = null;
            }

            onFinished();
        };

        const visibleNode =
            holdNode?.isValid && holdNode.activeInHierarchy
                ? holdNode
                : activeNode;

        if (!visibleNode?.isValid) {
            finish();
            return;
        }

        console.log('[DISCO FINAL HIDE START]', {
            row: this.row,
            col: this.col,
            visual: visibleNode.name
        });

        this.playHideAnimation(visibleNode, finish);
    }

    activateIsolatedDiscoballAnimation(
        timeScale: number,
        visibleUntil?: number,
        onReady?: () => void
    ): void {
        if(this.playNewDiscoballActivation(onReady)) return;

        let colorString = '0';
        const numbers: Record<string, string> = {
            yellow: '1', red: '2', blue: '3', green: '4', purple: '5', orange: '6'
        };
        colorString = numbers[this.primaryColor] ?? '0';
        if(this.tileType === 'super') colorString += `_${numbers[this.secondaryColor] ?? '0'}`;
        this.playAnimation('discoball_color' + colorString, false, Math.min(1, timeScale));
        this.scheduleOnce(() => onReady?.(), this.getActiveDuration());
    }

    activateFastAnimation() {
        let colorString = "0";

        switch(this.primaryColor) {
            case "yellow":
                colorString = "1";
                break;
            case "red":
                colorString = "2";
                break;
            case "blue":
                colorString = "3";
                break;
            case "green":
                colorString = "4";
                break;
            case "purple":
                colorString = "5";
                break;
            case "orange":
                colorString = "6";
                break;
        }

        if(this.tileType === "super") {
            switch(this.secondaryColor) {
                case "yellow":
                    colorString += "_1";
                    break;
                case "red":
                    colorString += "_2";
                    break;
                case "blue":
                    colorString += "_3";
                    break;
                case "green":
                    colorString += "_4";
                    break;
                case "purple":
                    colorString += "_5";
                    break;
                case "orange":
                    colorString += "_6";
                    break;
            }
        }

        this.playAnimation("discoball_color" + colorString, false, 10);
    }


    private playNewDiscoballSpawn(): void {
        const skeleton = this.discoballSpine;

        if(!skeleton || !skeleton.skeletonData) {
            console.warn('[DISCO SPINE] New Spine missing');
            return;
        }

        if(this.isSpineActivationStarted) {
            return;
        }

        if(!this.primaryColor) {
            console.warn('[DISCO SPINE] Primary color not selected');
            return;
        }

        if(this.tileType === 'super' && !this.secondaryColor) {
            return;
        }

        const skinName = this.getLineSkinName();

        const visualNode = skeleton.node;
        visualNode.active = true;
        skeleton.enabled = true;

        if(!visualNode.activeInHierarchy) {
            console.warn('[DISCO SPINE] Node is inactive in hierarchy');
            return;
        }

        try {
            if(this.currentSpineSkin !== skinName) {
                skeleton.setSkin(skinName);
                skeleton.setSlotsToSetupPose();

                this.currentSpineSkin = skinName;

                console.log('[DISCO SPINE COLOR]', {
                    type: this.tileType,
                    skin: skinName,
                    isSpineSpawned: this.isSpineSpawned
                });
            }

            if(this.isSpineSpawned) {
                return;
            }

            skeleton.clearTracks();
            skeleton.setToSetupPose();

            const spawnTrack = skeleton.setAnimation(
                0,
                'appiert',
                false
            );

            if(!spawnTrack) {
                throw new Error('Cannot start appiert animation');
            }

            skeleton.addAnimation(
                0,
                'idle',
                true,
                0
            );

            this.isSpineSpawned = true;

            if(this.icon) {
                this.icon.enabled = false;
            }

            console.log('[DISCO SPINE SPAWN]', {
                type: this.tileType,
                skin: skinName,
                animation: 'appiert -> idle',
                duration: spawnTrack.animation?.duration
            });

        } catch(error) {
            console.error('[DISCO SPINE] Spawn failed:', error);

            if(!this.isSpineSpawned) {
                visualNode.active = false;

                if(this.icon) {
                    this.icon.enabled = true;
                }
            }
        }
    }

    setColor(primaryColor: string, secondaryColor: string) {
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;

        const coloredFrame = this.tileType === 'multi'
            ? this.multiIcons.find(i => i.id === primaryColor)?.icon
            : this.superIcons.find(i => i.id === `${primaryColor}_${secondaryColor}`)?.icon;

        if(this.icon) {
            if(coloredFrame) {
                this.icon.spriteFrame = coloredFrame;
            }
            else {
                this.icon.spriteFrame = this.icon.spriteFrame ?? (this.tileType === 'multi' ? this.multi : this.super);

                console.warn('[DISCO SPAWN] Colored icon missing, using fallback:', {
                    row: this.row,
                    col: this.col,
                    type: this.tileType,
                    primaryColor,
                    secondaryColor
                });
            }

            if(!this.isSpineSpawned && !this.isSpineActivationStarted) {
                this.icon.enabled = true;
            }
        }

        this.playNewDiscoballSpawn();

        if(!this.isSpineSpawned && !this.isSpineActivationStarted && this.icon) {
            this.icon.enabled = true;
        }
    }


    public getLineSkinName(): string {
        if(this.tileType !== 'super' || !this.secondaryColor) {
            return this.primaryColor || 'blue';
        }

        const colorOrder = ['yellow', 'red', 'purple', 'green', 'blue'];

        const firstIndex = colorOrder.indexOf(this.primaryColor);
        const secondIndex = colorOrder.indexOf(this.secondaryColor);

        if(firstIndex < 0 || secondIndex < 0 || firstIndex === secondIndex) {
            return this.primaryColor || 'blue';
        }

        return firstIndex < secondIndex
            ? `${this.primaryColor}_${this.secondaryColor}`
            : `${this.secondaryColor}_${this.primaryColor}`;
    }

    public getLineAnimationForTarget(
        targetColor: string
    ): 'line_color_1' | 'line_color_2' {
        const skinName = this.getLineSkinName();
        const colors = skinName.split('_');

        if(colors.length === 2 && targetColor === colors[1]) {
            return 'line_color_2';
        }

        return 'line_color_1';
    }


    private playNewDiscoballActivation(onReady?: () => void): boolean {
        if(this.tileType !== 'multi' && this.tileType !== 'super') return false;
        if(this.tileType === 'super' && !this.secondaryColor) return false;

        if(this.isSpineActivationStarted) {
            if(onReady) {
                if(this.isSpineActivationCompleted) onReady();
                else this.activeReadyCallbacks.push(onReady);
            }

            return true;
        }

        const sourceSpine = this.discoballSpine;
        const uiTile = this.node.getComponent(UITile);
        const overlayLayer = uiTile?.getAnimationsLayout();

        if(!sourceSpine?.skeletonData || !sourceSpine.node.isValid || !overlayLayer?.isValid) {
            console.warn('[DISCO ACTIVE] Spine or overlay missing');
            return false;
        }

        const sourceNode = sourceSpine.node;
        const worldPosition = sourceNode.worldPosition.clone();
        const worldRotation = sourceNode.worldRotation.clone();
        const worldScale = sourceNode.worldScale.clone();

        const visualNode = instantiate(sourceNode);
        visualNode.name = 'DiscoballActiveFx';

        const skeleton = visualNode.getComponent(sp.Skeleton);

        if(!skeleton) {
            visualNode.destroy();
            return false;
        }

        const holdNode = instantiate(sourceNode);
        holdNode.name = 'DiscoballHoldFx';

        const holdSkeleton = holdNode.getComponent(sp.Skeleton);

        if(!holdSkeleton) {
            visualNode.destroy();
            holdNode.destroy();
            return false;
        }

        try {
            const skinName = this.getLineSkinName();

            overlayLayer.addChild(visualNode);

            visualNode.setWorldPosition(worldPosition);
            visualNode.setWorldRotation(worldRotation);
            visualNode.setWorldScale(worldScale);
            visualNode.setSiblingIndex(overlayLayer.children.length - 1);

            visualNode.active = true;
            skeleton.enabled = true;

            skeleton.setSkin(skinName);
            skeleton.setSlotsToSetupPose();

            overlayLayer.addChild(holdNode);

            holdNode.setWorldPosition(worldPosition);
            holdNode.setWorldRotation(worldRotation);
            holdNode.setWorldScale(worldScale);
            holdNode.setSiblingIndex(overlayLayer.children.length - 1);

            holdNode.active = true;
            holdSkeleton.enabled = true;

            holdSkeleton.setSkin(skinName);
            holdSkeleton.setSlotsToSetupPose();
            holdSkeleton.clearTracks();
            holdSkeleton.setToSetupPose();

            const hasEmptyHold = !!holdSkeleton.findAnimation('empty_hold');

            if(hasEmptyHold) {
                holdSkeleton.setAnimation(0, 'empty_hold', true);
                holdSkeleton.timeScale = 1;
            }
            else if(holdSkeleton.findAnimation('idle')) {
                holdSkeleton.setAnimation(0, 'idle', true);
                holdSkeleton.updateAnimation(0);
                holdSkeleton.timeScale = 0;
            }
            else {
                throw new Error('No empty_hold or idle for discoball hold');
            }

            holdNode.active = false;

            if(!skeleton.findAnimation('active')) {
                throw new Error('Discoball active animation missing');
            }

            skeleton.clearTracks();
            skeleton.setToSetupPose();
            skeleton.timeScale = 1;

            const activeTrack = skeleton.setAnimation(0, 'active', false);

            if(!activeTrack) {
                throw new Error('Cannot start discoball active');
            }

            this.isSpineActivationStarted = true;
            this.isSpineActivationCompleted = false;

            this.activeFxNode = visualNode;
            this.activeHoldNode = holdNode;

            if(onReady) {
                this.activeReadyCallbacks.push(onReady);
            }

            sourceNode.active = false;

            if(this.icon) {
                this.icon.enabled = false;
            }

            uiTile?.setSpineDestroyOnly(true);

            const enterEmptyBallHold = (trigger: 'event' | 'progress' | 'complete') => {
                if(!visualNode.isValid || !skeleton.isValid || this.isSpineActivationCompleted) {
                    return;
                }

                skeleton.timeScale = 0;

                visualNode.active = true;
                skeleton.enabled = true;

                if(holdNode.isValid) {
                    holdNode.active = false;
                }

                this.isSpineActivationCompleted = true;

                console.log('[DISCO EMPTY BALL FROZEN]', {
                    trigger,
                    skin: skinName,
                    row: this.row,
                    col: this.col,
                    trackTime: activeTrack.trackTime,
                    nodeActive: visualNode.active
                });

                const callbacks = this.activeReadyCallbacks.splice(0);

                for(const callback of callbacks) {
                    try {
                        callback();
                    }
                    catch(error) {
                        console.error('[DISCO ACTIVE] Ready callback failed:', error);
                    }
                }
            };

            const emptyBallTime = 0.4;

            this.scheduleOnce(() => {
                if(!this.node.isValid || !visualNode.isValid || this.isSpineActivationCompleted) {
                    return;
                }

                enterEmptyBallHold('progress');

            }, emptyBallTime);

            skeleton.setTrackEventListener(activeTrack, (_entry, event) => {
                if(typeof event === 'number') return;

                if(event?.data?.name === 'empty_ready') {
                    enterEmptyBallHold('event');
                }
            });

            skeleton.setTrackCompleteListener(activeTrack, () => {
                if(this.isSpineActivationCompleted) return;

                console.warn('[DISCO] active completed without empty_ready event');

                enterEmptyBallHold('complete');
            });

            console.log('[DISCO ACTIVE START]', {
                skin: skinName,
                duration: activeTrack.animation?.duration,
                position: worldPosition.toString()
            });

            return true;

        } catch(error) {
            console.error('[DISCO ACTIVE] Setup failed:', error);

            if(visualNode.isValid) visualNode.destroy();
            if(holdNode.isValid) holdNode.destroy();

            if(sourceNode.isValid) sourceNode.active = true;
            if(this.icon) this.icon.enabled = true;

            this.activeReadyCallbacks = [];
            this.activeFxNode = null;
            this.activeHoldNode = null;

            this.isSpineActivationStarted = false;
            this.isSpineActivationCompleted = false;

            return false;
        }
    }

    public onDestroy(): void {
        if (this.activeFxNode?.isValid) {
            this.activeFxNode.destroy();
        }

        if (this.activeHoldNode?.isValid) {
            this.activeHoldNode.destroy();
        }

        this.activeFxNode = null;
        this.activeHoldNode = null;
        this.activeReadyCallbacks.length = 0;

        super.onDestroy();
    }
}
