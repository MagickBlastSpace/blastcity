import { _decorator, EventTouch, Node, sp, Sprite, SpriteFrame, Vec2 } from 'cc';
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


    private onOtterTouched(event: EventTouch): void {
        if(Vec2.distance(event.getUIStartLocation(), event.getUILocation()) > 12) return;

        this.playOtterTouch();
    }


    private playOtterTouch(): void {
        if(!this.node.isValid || !this.isOtter()) return;

        const skeleton = this.node.getComponent(UITile)?.spine;

        if(!skeleton?.skeletonData || !skeleton.node.activeInHierarchy) return;

        const idleAnimation = this.isInactive ? 'idle_inactive' : 'idle_active';
        const touchAnimation = this.isInactive ? 'touch_inactive' : 'touch_active';

        if(!skeleton.findAnimation(touchAnimation)) {
            console.warn('[OTTER TOUCH] Animation missing:', touchAnimation);
            return;
        }

        const currentAnimation = skeleton.getCurrent(0)?.animation?.name;

        if(currentAnimation && currentAnimation !== idleAnimation) return;

        skeleton.enabled = true;
        skeleton.timeScale = 1;

        skeleton.setAnimation(0, touchAnimation, false);
        skeleton.addAnimation(0, idleAnimation, true, 0);

        console.log('[OTTER TOUCH]', {
            row: this.row,
            col: this.col,
            inactive: this.isInactive,
            animation: touchAnimation
        });
    }


    private startOtterZzz(): void {
        if(!this.node.isValid || !this.isInactive) return;

        const skeleton = this.node.getComponent(UITile)?.spine;

        if(!skeleton?.skeletonData || !skeleton.findAnimation('zzz')) return;

        if(skeleton.getCurrent(1)?.animation?.name === 'zzz') return;

        skeleton.setAnimation(1, 'zzz', true);

        console.log('[OTTER ZZZ START]', {
            row: this.row,
            col: this.col
        });
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

        this.node.off(Node.EventType.TOUCH_END, this.onOtterTouched, this);
        this.node.off('touch_feedback', this.playOtterTouch, this);

        super.destroyTile(delay);
    }

    destroyClear() {
        if (this.fieldNode && this.destroyTileCallback) {
            this.fieldNode.off("spawn", this.destroyTileCallback);
        }

        this.node.off(Node.EventType.TOUCH_END, this.onOtterTouched, this);
        this.node.off('touch_feedback', this.playOtterTouch, this);


        super.destroyClear();
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;

        this.isInactive = false;
        this.isGenerate = false;
        this.goalCount = 0;

        this.node.off(Node.EventType.TOUCH_END, this.onOtterTouched, this);
        this.node.off('touch_feedback', this.playOtterTouch, this);

        if(this.isOtter()) {
            this.icon.enabled = false;

            const uiTile = this.node.getComponent(UITile);
            const skeleton = this.getOtterSpine();

            if(uiTile) {
                uiTile.keepSpineVisible = true;
            }

            if(skeleton?.skeletonData) {
                skeleton.node.active = true;
                skeleton.enabled = true;
                skeleton.timeScale = 1;

                skeleton.clearTracks();
                skeleton.setToSetupPose();
            }

            this.playOtterAnimation('idle_active', true);

            this.node.on(Node.EventType.TOUCH_END, this.onOtterTouched, this);
            this.node.on('touch_feedback', this.playOtterTouch, this);
        }
        else {
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

                const collapsTrack = skeleton.setAnimation(0, 'collaps', false);

                skeleton.addAnimation(0, 'idle_inactive', true, 0);

                if(collapsTrack) {
                    skeleton.setTrackCompleteListener(collapsTrack, () => {
                        if(!this.node.isValid || !skeleton.isValid || !this.isInactive) return;

                        this.startOtterZzz();
                    });
                }
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

        if(this.goalCount <= 0) {
            this.setInactiveState();
            return;
        }

        this.isInactive = false;

        if(wasInactive) {
            if(this.isOtter()) {
                const skeleton = this.getOtterSpine();

                if(skeleton?.skeletonData) {
                    skeleton.node.active = true;
                    skeleton.enabled = true;
                    skeleton.timeScale = 1;

                    skeleton.clearTracks();
                    skeleton.setToSetupPose();

                    this.playOtterAnimation('idle_active', true);
                }
            }
            else {
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
