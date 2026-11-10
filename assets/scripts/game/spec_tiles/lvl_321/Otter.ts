import { _decorator, Node, sp, Sprite, SpriteFrame } from 'cc';
import { GoalData } from '../../../data/GameData';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Otter')
export class Otter extends SpecTileBase {

    @property(SpriteFrame)
    active: SpriteFrame = null;
    @property(SpriteFrame)
    inactive: SpriteFrame = null;

    @property(Sprite)
    icon: Sprite = null;

    private isInactive: boolean = false;

    protected goalCount: number = 0;

    protected fieldNode: Node = null;
    protected destroyTileCallback: Function = null;

    protected isGenerate: boolean = false;

    protected isFieldSubscribed: boolean = false;

    private isOtter(): boolean {
        return this.tileType === 'otter';
    }

    private getOtterSpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }

    private playOtterAnimation(animation: string, loop: boolean = true): void {
        if (!this.isOtter()) {
            return;
        }

        const uiTile = this.node.getComponent(UITile);
        const skeleton = uiTile?.spine;

        console.log('[OTTER DEBUG] Animation request:', {
            animation,
            tileType: this.tileType,
            hasUITile: !!uiTile,
            hasSkeleton: !!skeleton,
            hasSkeletonData: !!skeleton?.skeletonData,
            spineActive: skeleton?.node.active,
            keepSpineVisible: uiTile?.keepSpineVisible
        });

        if (!skeleton || !skeleton.skeletonData) {
            console.error('[OTTER] Skeleton or SkeletonData missing');
            return;
        }

        try {
            skeleton.node.active = true;

            const track = skeleton.setAnimation(0, animation, loop);

            console.log('[OTTER DEBUG] Animation started:', {
                animation,
                success: !!track,
                current: skeleton.getCurrent(0)?.animation?.name
            });
        } catch (error) {
            console.error('[OTTER] Animation failed:', animation, error);
        }
    }

    isGroupedTile(): boolean {
        return true;
    }

    subscribeOnFieldEvents(field: Node) {
        if (this.isFieldSubscribed) {
            return;
        }

        this.isFieldSubscribed = true;

        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;

        this.destroyTileCallback = (tileType) => {
            if(tileType === "bubble") {
                this.goalCount--;

                if(this.goalCount <= 0) {
                    this.setInactiveState();
                }
            }
        };

        field.on("spawn", this.destroyTileCallback);
    }

    destroyTile(delay: number = 0) {
        if (this.fieldNode && this.destroyTileCallback) {
            this.fieldNode.off("spawn", this.destroyTileCallback);
        }

        super.destroyTile(delay);
    }

    destroyClear() {
        if (this.fieldNode && this.destroyTileCallback) {
            this.fieldNode.off("spawn", this.destroyTileCallback);
        }

        super.destroyClear();
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;

        this.isInactive = false;
        this.isGenerate = false;
        this.goalCount = 0;

        if (this.isOtter()) {
            this.icon.enabled = false;

            const uiTile = this.node.getComponent(UITile);

            if (uiTile) {
                uiTile.keepSpineVisible = true;
            }

            this.playOtterAnimation('idle_active', true);
        } else {
            this.icon.enabled = true;
            this.icon.spriteFrame = this.active;
        }
    }

    getDamage(damageType: string) {
        if (this.isTileDamaged() || this.isInactive || this.goalCount <= 0) {
            return;
        }

        this.setAsDamaged();
        this.isGenerate = true;

        if (this.isOtter()) {
            const skeleton = this.getOtterSpine();

            if (skeleton) {
                skeleton.node.active = true;

                skeleton.setAnimation(0, 'activate', false);
                skeleton.addAnimation(0, 'idle_active', true, 0);
            }
        } else {
            this.playAdditionalAnimation(null, 'activation', this.icon.node);
        }
    }

    startPreActionEffect(): boolean {
        if(this.isGenerate && this.goalCount > 0) {
            this.node.emit("status", "bubble");

            this.playGenerateSound();
        }

        return false;
    }

    subscribeOnGoals(goals: GoalData[]) {
        this.goalCount = 0;

        for(let i = 0; i < goals.length; i++) {
            if(goals[i].id === "bubble") {
                this.goalCount = goals[i].count;
                return;
            }
        }
    }

    isReadyToDestroy(): boolean {
        return false;
    }

    setInactiveState() {
        if (this.isInactive) {
            return;
        }

        this.isInactive = true;

        if (this.isOtter()) {
            const skeleton = this.getOtterSpine();

            if (skeleton && skeleton.skeletonData) {
                skeleton.node.active = true;

                skeleton.setAnimation(0, 'collaps', false);
                skeleton.addAnimation(0, 'idle_inactive', true, 0);

                console.log('[OTTER] Sleep sequence started: collaps -> idle_inactive');
            } else {
                console.warn('[OTTER] Cannot play sleep sequence: Spine is missing');
            }
        } else {
            this.icon.spriteFrame = this.inactive;
        }

        this.playInactiveSound();
    }


    reduceGoalCount(field: Node[][]) {
        this.findAllTilesThisType(field);
    }

    clear() {
        super.clear();

        this.isGenerate = false;
    }


    getCustomParameter(): number {
        return this.goalCount;
    }

    setCustomParameter(index: number) {
        const wasInactive = this.isInactive;

        this.goalCount = index;

        if (this.goalCount <= 0) {
            this.setInactiveState();
            return;
        }

        this.isInactive = false;

        if (wasInactive) {
            if (this.isOtter()) {
                this.playOtterAnimation('idle_active', true);
            } else {
                this.icon.spriteFrame = this.active;
            }
        }
    }


    playInactiveSound() {
        this.playSound(1);
    }

    playGenerateSound() {
        this.playSound(0);
    }
}
