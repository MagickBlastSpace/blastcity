import { _decorator, instantiate, Node, sp, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
import { UITile } from '../../ui/UITile';
import { SpriteTileData } from '../Tile';
import { TileBase } from '../TileBase';
import { BonusTileBase } from './BonusTileBase';
const { ccclass, property } = _decorator;

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

    private primaryColor: string = "";
    private secondaryColor: string = "";

    private disco_disco_time: number = 0.7;

    private currentSpineSkin: string = "";
    private isSpineSpawned: boolean = false;

    private isSpineActivationStarted: boolean = false;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.icon.spriteFrame = this.tileType === 'multi' ? this.multi : this.super;
    }


    getMatches(field: Node[][], statuses: Node[][], isBlockingCombo: boolean): Node[] {
        if(this.isActivated) {
            return;
        }

        this.combo = "";
        if(!isBlockingCombo) {
            this.getCombo(field);
        }

        let tilesToDestroy = isBlockingCombo ? this.getMatchesClear(field, statuses) : this.getDiscoballMatchesByType(field, statuses);

        return tilesToDestroy;
    }


    getMatchesClear(field: Node[][], statuses: Node[][]): Node[] {
        let matches = this.getDiscoballMatchesByType(field, statuses);

        return matches;
    }


    getDiscoballMatchesByType(field: Node[][], statuses: Node[][]): Node[] {
        if(this.isActivated) {
            return;
        }

        this.isShifts = false;

        let matches = [];

        if(this.isCombo()) {
            matches = this.getMatchesByCombo(field, statuses);
            return matches;
        }

        let tiles = [];
        tiles = this.tileType === "super" ? this.getTwoBiggestCommonTilesGroups(field, statuses) : this.getBiggestCommonTilesGroup(field, statuses);

        this.isActivated = true;

        for(let i = 0; i < tiles.length; i++) {
            tiles[i].startShake();

            this.node.emit("goal", "discoball");
        }

        tiles.push(this);

        let totalTime = this.timeBetweenTiles * tiles.length;
        totalTime = totalTime < this.disco_combo_time ? this.disco_combo_time : totalTime;


        const lastLineEnd = Math.max( totalTime,  Math.max(0, tiles.length - 2) * this.timeBetweenTiles + 0.87);

        this.activateIsolatedDiscoballAnimation( this.disco_combo_time / totalTime, lastLineEnd);


        this.setRespawnEvent(totalTime + 0.05);

        if(this.respawnDelay < totalTime) { //protection from delayed combo bonuses
            this.scheduleOnce(() => {
                this.setRespawnEvent(totalTime + 0.05 - this.respawnDelay);
            }, this.respawnDelay);
        }

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    this.renderLine(
                        new Vec2(this.row, this.col),
                        new Vec2(tiles[i].getRow(), tiles[i].getCol()),
                        this.getLineSkinName(),
                        this.getLineAnimationForTarget(tiles[i].getTileType())
                    );
                }
                catch (error) {
                    console.log("Render Line Error: " + error);
                }
            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit("clear_lines");

            for(let i = 0; i < tiles.length; i++) {
                this.node.emit("extra_hit_with_damage", tiles[i].getRow(), tiles[i].getCol());
            }

            this.setRespawnEvent(0);
        }, totalTime - 0.05);

        this.playDiscoballSound();

        return matches;
    }


    getMatchesByCombo(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.isActivated = true;

        if(this.combo === "rocket_vertical" || this.combo === "rocket_horizontal") {
            matches = this.getRocketComboMatches(field, statuses);
        }
        else if(this.combo === "bomb") {
            matches = this.getBombComboMatches(field, statuses);
        }
        else if(this.availableColors.includes(this.combo) || this.combo === "multi") {
            matches = this.getDiscoballComboMatches(field, statuses);
        }
        else if(this.combo === "super") {
            matches = this.getSuperDiscoballComboMatches(field, statuses);
        }

        return matches;
    }


    getRocketComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];

        tiles = this.tileType === 'super'
            ? this.getTwoBiggestCommonTilesGroups(field, statuses)
            : this.getBiggestCommonTilesGroup(field, statuses);

        for(let i = 0; i < tiles.length; i++) {
            this.node.emit('goal', 'discoball');
        }

        let totalTime = this.timeBetweenTiles * tiles.length;

        totalTime = totalTime < this.disco_combo_time
            ? this.disco_combo_time
            : totalTime;

        this.activateDiscoballComboAnimation(field);

        const lastLineEnd = Math.max(
            totalTime,
            Math.max(0, tiles.length - 1) * this.timeBetweenTiles + 0.87
        );

        this.activateIsolatedDiscoballAnimation(
            this.disco_combo_time / totalTime,
            lastLineEnd
        );

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    this.renderLine(
                        new Vec2(this.row, this.col),
                        new Vec2(tiles[i].getRow(), tiles[i].getCol()),
                        this.getLineSkinName(),
                        this.getLineAnimationForTarget(tiles[i].getTileType())
                    );
                }
                catch(error) {
                    console.log('Render Line Error: ' + error);
                }

                const rocketString = Math.floor(Math.random() * 2) === 0
                    ? 'rocket_vertical'
                    : 'rocket_horizontal';

                this.changeTile(tiles[i], rocketString);

            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit('clear_lines');

            this.node.emit(
                'extra_hit',
                this.row,
                this.col,
                false,
                0
            );

            this.node.emit(
                'extra_hit',
                this.comboPosition.x,
                this.comboPosition.y,
                false,
                0
            );

            this.node.emit('activate_bonus_pool');

        }, totalTime);

        this.playComboSound();

        return matches;
    }


    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let tiles = [];

        tiles = this.tileType === 'super'
            ? this.getTwoBiggestCommonTilesGroups(field, statuses)
            : this.getBiggestCommonTilesGroup(field, statuses);

        for(let i = 0; i < tiles.length; i++) {
            this.node.emit('goal', 'discoball');
        }

        let totalTime = this.timeBetweenTiles * tiles.length;

        totalTime = totalTime < this.disco_combo_time
            ? this.disco_combo_time
            : totalTime;

        this.activateDiscoballComboAnimation(field);

        const lastLineEnd = Math.max(
            totalTime,
            Math.max(0, tiles.length - 1) * this.timeBetweenTiles + 0.87
        );

        this.activateIsolatedDiscoballAnimation(
            2.0 / totalTime,
            lastLineEnd
        );

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    this.renderLine(
                        new Vec2(this.row, this.col),
                        new Vec2(tiles[i].getRow(), tiles[i].getCol()),
                        this.getLineSkinName(),
                        this.getLineAnimationForTarget(tiles[i].getTileType())
                    );
                }
                catch(error) {
                    console.log('Render Line Error: ' + error);
                }

                this.changeTile(tiles[i], 'bomb');

            }, this.timeBetweenTiles * i);
        }

        this.scheduleOnce(() => {
            this.node.emit('clear_lines');

            this.node.emit(
                'extra_hit',
                this.row,
                this.col,
                false,
                0
            );

            this.node.emit(
                'extra_hit',
                this.comboPosition.x,
                this.comboPosition.y,
                false,
                0
            );

            this.node.emit('activate_bonus_pool');

        }, totalTime);

        this.playComboSound();

        return matches;
    }


    getDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        const matches: Node[] = [];

        const numRows = field.length;
        const numCols = numRows > 0 ? field[0].length : 0;

        const hitDelay = 0.1;
        const activeFadeTime = 0.8333;

        this.activateDiscoballComboAnimation(field);

        this.activateIsolatedDiscoballAnimation(
            1,
            activeFadeTime
        );

        this.playDoubleDiscoballSound();

        this.scheduleOnce(() => {
            for(let i = 0; i < numRows; i++) {
                for(let j = 0; j < numCols; j++) {
                    const isBonusChain = this.isChain(i, j);

                    this.node.emit(
                        'extra_hit',
                        i,
                        j,
                        isBonusChain,
                        0
                    );

                    this.node.emit('goal', 'discoball');
                }
            }

            this.clearTiles();

        }, hitDelay);

        this.setRespawnEvent(hitDelay + this.respawnDelay);

        return matches;
    }


    getSuperDiscoballComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        this.activateDiscoballComboAnimation(field);
        //Временно оставим шар+шар без анимации поля , после добавим новую анимацию
        this.activateIsolatedDiscoballAnimation(
            1,
            this.disco_disco_time
        );

        this.playDoubleDiscoballSound();

        this.scheduleOnce(() => {
            for(let i = 0; i < numRows; i++) {
                for(let j = 0; j < numCols; j++) {
                    if(i === this.getRow() && j === this.getCol()) {
                        continue;
                    }

                    let isBonusChain = this.isChain(i, j);
                    this.node.emit("extra_hit", i, j, isBonusChain, 0);

                    this.node.emit("goal", "discoball");
                }
            }

            this.clearTiles();

        }, this.disco_disco_time);

        this.setRespawnEvent(this.disco_disco_time);
        this.setRespawnEvent(this.disco_disco_time * 2);

        this.scheduleOnce(() => {
            this.getDiscoballComboMatches(field, statuses);
        }, this.disco_disco_time);

        return matches;
    }

    changeTile(tile: TileBase, tileType: string) {
        if(tile === null) {
            return;
        }
        try {
            this.node.emit("change_bonus", tile.getRow(), tile.getCol(), tileType, true);
        }
        catch (error) {
            return;
        }
    }

    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }

    isChain(row: number, col: number) {
        return row !== this.row && col !== this.col && row !== this.row + 1 && row !== this.row - 1 && col !== this.col + 1 && col !== this.col - 1;
    }


    activateDiscoballComboAnimation(field: Node[][]): void {
        try {
            if(!this.comboPosition) {
                return;
            }

            const tile = field[this.comboPosition.x]?.[this.comboPosition.y];

            if(!tile || !tile.isValid || tile === this.node) {
                return;
            }

            const otherDiscoball = tile.getComponent(Discoball);

            if(!otherDiscoball || !otherDiscoball.isValid) {
                return;
            }

            const tileType = otherDiscoball.getTileType();

            if(tileType !== 'multi' && tileType !== 'super') {
                return;
            }

            otherDiscoball.activateIsolatedDiscoballAnimation(
                1,
                0.8333
            );

            console.log('[DISCO COMBO SECOND SPINE]', {
                type: tileType,
                row: otherDiscoball.getRow(),
                col: otherDiscoball.getCol(),
                skin: otherDiscoball.getLineSkinName()
            });

        } catch(error) {
            console.error('[DISCO COMBO] Second discoball activation failed:', error);
        }
    }


    playHideAnimation(nodeToHide: Node) {
        tween(nodeToHide)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();
    }

    activateIsolatedDiscoballAnimation(
        timeScale: number,
        visibleUntil?: number
    ) {
        if(this.playNewDiscoballActivation(timeScale, visibleUntil)) {
            return;
        }

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

        let time = timeScale < 1 ? timeScale : 1;

        this.playAnimation("discoball_color" + colorString, false, time);
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

        if(this.tileType === "multi") {
            this.icon.spriteFrame = this.multiIcons.find(i => i.id === primaryColor)?.icon;
        }
        else {
            this.icon.spriteFrame = this.superIcons.find(i => i.id === (primaryColor + "_" + secondaryColor))?.icon;
        }

        this.playNewDiscoballSpawn();
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

    private playNewDiscoballActivation(
        timeScale: number,
        visibleUntil?: number
    ): boolean {
        if(this.tileType !== 'multi' && this.tileType !== 'super') {
            return false;
        }

        if(this.tileType === 'super' && !this.secondaryColor) {
            return false;
        }

        if(this.isSpineActivationStarted) {
            return true;
        }

        const sourceSpine = this.discoballSpine;
        const uiTile = this.node.getComponent(UITile);
        const overlayLayer = uiTile?.getAnimationsLayout();

        if(
            !sourceSpine ||
            !sourceSpine.skeletonData ||
            !sourceSpine.node.isValid ||
            !overlayLayer?.isValid
        ) {
            console.warn('[DISCO ACTIVE] Spine or overlay missing');
            return false;
        }

        console.log('[DISCO ACTIVATION SOURCE]', {
            type: this.tileType,
            row: this.row,
            col: this.col,
            moving: uiTile?.isVisualMoving(),
            tileWorldPosition: this.node.worldPosition.toString(),
            spineWorldPosition: sourceSpine.node.worldPosition.toString(),
            spineActive: sourceSpine.node.active,
            overlayActive: overlayLayer.activeInHierarchy
        });

        const sourceNode = sourceSpine.node;

        const worldPosition = sourceNode.worldPosition.clone();
        const worldRotation = sourceNode.worldRotation.clone();
        const worldScale = sourceNode.worldScale.clone();

        const visualNode = instantiate(sourceNode);
        visualNode.name = 'DiscoballActiveFx';

        const skeleton = visualNode.getComponent(sp.Skeleton);

        if(!skeleton) {
            console.warn('[DISCO ACTIVE] Cloned Skeleton missing');
            visualNode.destroy();
            return false;
        }

        overlayLayer.addChild(visualNode);

        visualNode.setWorldPosition(worldPosition);
        visualNode.setWorldRotation(worldRotation);
        visualNode.setWorldScale(worldScale);
        visualNode.setSiblingIndex(overlayLayer.children.length - 1);

        visualNode.active = true;
        skeleton.enabled = true;

        console.log('[DISCO OVERLAY POSITION]', {
            type: this.tileType,
            row: this.row,
            col: this.col,
            source: worldPosition.toString(),
            clone: visualNode.worldPosition.toString(),
            parent: overlayLayer.name
        });

        try {
            const skinName = this.getLineSkinName();

            skeleton.setSkin(skinName);
            skeleton.setSlotsToSetupPose();

            if(
                !skeleton.findAnimation('idle') ||
                !skeleton.findAnimation('active')
            ) {
                throw new Error('Discoball idle or active animation missing');
            }

            skeleton.clearTracks();
            skeleton.setToSetupPose();
            skeleton.timeScale = 1;

            const idleTrack = skeleton.setAnimation(
                0,
                'idle',
                true
            );

            if(!idleTrack) {
                throw new Error('Cannot start discoball idle');
            }

            const safeTimeScale = Math.max(0.01, timeScale);

            const totalTime = this.disco_combo_time / safeTimeScale;
            const lastLineEnd = visibleUntil ?? (totalTime + 0.87);

            const activeFadeTime = 0.8333;

            const activeDelay = Math.max(
                0,
                lastLineEnd - activeFadeTime
            );

            tween(visualNode)
                .delay(activeDelay)
                .call(() => {
                    if(!visualNode.isValid || !skeleton.isValid) {
                        return;
                    }

                    try {
                        skeleton.clearTracks();
                        skeleton.setToSetupPose();
                        skeleton.timeScale = 1;

                        const activeTrack = skeleton.setAnimation(
                            0,
                            'active',
                            false
                        );

                        if(!activeTrack) {
                            throw new Error('Cannot start discoball active');
                        }

                        skeleton.setTrackCompleteListener(
                            activeTrack,
                            () => {
                                if(visualNode.isValid) {
                                    console.log('[DISCO ACTIVE COMPLETE]', {
                                        skin: skinName
                                    });

                                    visualNode.destroy();
                                }
                            }
                        );

                        console.log('[DISCO ACTIVE START]', {
                            skin: skinName,
                            delay: activeDelay,
                            duration: activeTrack.animation?.duration
                        });

                    } catch(error) {
                        console.error(
                            '[DISCO ACTIVE] Playback failed:',
                            error
                        );

                        if(visualNode.isValid) {
                            visualNode.destroy();
                        }
                    }
                })

                .delay(1.5)
                .call(() => {
                    if(visualNode.isValid) {
                        console.warn(
                            '[DISCO FX FALLBACK CLEANUP]',
                            {
                                skin: skinName,
                                node: visualNode.name,
                                position: visualNode.worldPosition.toString()
                            }
                        );

                        visualNode.destroy();
                    }
                })
                .start();

            this.isSpineActivationStarted = true;

            sourceNode.active = false;

            if(this.icon) {
                this.icon.enabled = false;
            }

            uiTile?.setSpineDestroyOnly(true);

            console.log('[DISCO ACTIVE SCHEDULED]', {
                type: this.tileType,
                skin: skinName,
                totalTime,
                lastLineEnd,
                activeDelay,
                position: worldPosition.toString()
            });

            return true;

        } catch(error) {
            console.error('[DISCO ACTIVE] Setup failed:', error);

            if(visualNode.isValid) {
                visualNode.destroy();
            }

            return false;
        }
    }
}


