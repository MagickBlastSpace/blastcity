import { _decorator, Node, sp, Sprite, SpriteFrame, tween, Vec2, Vec3 } from 'cc';
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

    private bombCombo_Delay: number = 0.3;

    private spawnVisualInOverlay: Node = null;


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

        let matches = this.getRocketMatchesByType(field, statuses);

        return matches;
    }


    getRocketMatchesByType(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        if(this.isCombo()) {
            matches = this.getMatchesByCombo(field, statuses);
            return matches;
        }

        this.playAnimation(this.tileType, false, 1);

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
        let matches = [];

        this.playAnimation("rocket_rocket", false, 1);
        this.playComboSound();

        this.rowExtraHit(field, this.row, this.col);
        this.colExtraHit(field, this.row, this.col);

        return matches;
    }

    getBombComboMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        this.playAnimation("rocket_bomb", false, 1);
        this.playComboSound();
        this.playHideAnimation(this.icon.node);
        this.hideCombinationNode(field);

        this.scheduleOnce(() => {
            /*this.rowExtraHit(field, this.row, this.col);
            this.rowExtraHit(field, this.row + 1, this.col);
            this.rowExtraHit(field, this.row - 1, this.col);

            this.colExtraHit(field, this.row, this.col);
            this.colExtraHit(field, this.row, this.col + 1);
            this.colExtraHit(field, this.row, this.col - 1);*/

            this.crossExtraHit(field, this.row, this.col);

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

        for(let i = 0; i < tiles.length; i++) {
            this.scheduleOnce(() => {
                try {
                    let comboComp = field[this.comboPosition.x][this.comboPosition.y].getComponent(TileBase);
                    if(comboComp) {
                        this.renderLine(new Vec2(comboComp.getRow(), comboComp.getCol()), new Vec2(tiles[i].getRow(), tiles[i].getCol()));
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

        let anim = this.tileType === "rocket_vertical" ? "rocket_discoball_vert" : "rocket_discoball_hor";

        this.scheduleOnce(() => {
            this.playAnimation(anim, true, 1);
        }, 0.2);
    }


    hideCombinationNode(field: Node[][]) {
        let tile = field[this.comboPosition.x][this.comboPosition.y];
        this.playHideAnimation(tile);
    }

    playHideAnimation(nodeToHide: Node) {
        tween(nodeToHide)
            .to(0.15, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .start();
    }

    public playSpawnAnimation(overlayLayer?: Node) {
        if(!this.spawnSpine) {
            return;
        }

        console.log('[ROCKET SPINE START POSITION]', this.node.uuid, this.spawnSpine.node.worldPosition.toString());

        const visualNode = this.spawnSpine.node;
        const originalParent = visualNode.parent;

        if(!originalParent) {
            return;
        }

        const originalPosition = visualNode.position.clone();
        const originalRotation = visualNode.rotation.clone();
        const originalScale = visualNode.scale.clone();

        console.log( '[ROCKET SPAWN START]', this.node.uuid, this.tileType, this.node.isValid);
        if(this.icon) {
            this.icon.node.active = false;
        }

        if(overlayLayer) {
            visualNode.setParent(overlayLayer, true);
            console.log('[ROCKET SPINE AFTER REPARENT]', this.node.uuid, visualNode.worldPosition.toString());
            visualNode.setSiblingIndex(
                overlayLayer.children.length - 1
            );

            this.spawnVisualInOverlay = visualNode;
        }

        visualNode.active = true;

        visualNode.setRotationFromEuler(
            0,
            0,
            this.tileType === 'rocket_vertical'
                ? 90
                : 0
        );

        this.spawnSpine.clearTracks();
        this.spawnSpine.setToSetupPose();

        const spawnTrack = this.spawnSpine.setAnimation(
            0,
            'spawn',
            false
        );
        console.log('[ROCKET SPINE TRACK]', this.node.uuid, 'track:', spawnTrack?.animation?.name, 'duration:', spawnTrack?.animation?.duration);

        if(!spawnTrack) {
            this.spawnVisualInOverlay = null;

            if(originalParent.isValid && visualNode.isValid) {
                visualNode.setParent(originalParent);

                visualNode.setPosition(originalPosition);
                visualNode.setRotation(originalRotation);
                visualNode.setScale(originalScale);

                visualNode.active = false;
            }

            console.warn('[ROCKET SPAWN FAILED]', this.node.uuid, this.tileType);

            if(this.icon && this.icon.node.isValid) {
                this.icon.node.active = true;
            }

            return;
        }

        this.spawnSpine.setTrackCompleteListener(
            spawnTrack,
            () => {
                if(!visualNode.isValid) {
                    this.spawnVisualInOverlay = null;
                    return;
                }

                if(!originalParent || !originalParent.isValid) {
                    this.spawnVisualInOverlay = null;
                    visualNode.destroy();
                    return;
                }

                visualNode.setParent(originalParent);

                visualNode.setPosition(originalPosition);
                visualNode.setRotation(originalRotation);
                visualNode.setScale(originalScale);

                visualNode.active = false;

                this.spawnVisualInOverlay = null;

                console.log('[ROCKET SPAWN COMPLETE]', this.node.uuid, this.tileType );

                if(this.icon && this.icon.node.isValid) {
                    this.icon.node.active = true;
                    console.log('[ROCKET ICON]', this.node.uuid, 'active:', this.icon.node.active, 'inHierarchy:',
                        this.icon.node.activeInHierarchy, 'parent:', this.icon.node.parent?.name,
                        'scale:', this.icon.node.scale.toString()
                    );
                }

                console.log('[ROCKET LAYER]', this.node.uuid, 'parent:', this.node.parent?.name, 'sibling:', this.node.getSiblingIndex());
                console.log('[ROCKET POSITION]', this.node.uuid, 'position:', this.node.position.toString(), 'iconWorld:', this.icon?.node.worldPosition.toString());
                console.log('[ROCKET SPRITE]', this.node.uuid, 'enabled:', this.icon?.enabled, 'frame:', this.icon?.spriteFrame?.name);
            }
        );
    }
}


