
import { _decorator, EventTouch, instantiate, Node, sp, Vec2 } from 'cc';
import { GoalData } from '../../../data/GameData';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';

const { ccclass, property } = _decorator;

@ccclass('MagicHat')
export class MagicHat extends SpecTileBase {

    @property(Node)
    inactiveState: Node = null;

    @property(Node)
    activeState: Node = null;

    @property(sp.Skeleton)
    hatSpine: sp.Skeleton = null;

    private isInactive: boolean = false;
    private isCarrotAnimating: boolean = false;
    private goalCount: number = 0;

    private fieldNode: Node = null;
    private destroyTileCallback: (tileType: string) => void = null;

    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) return;

        super.subscribeOnFieldEvents(field);
        this.fieldNode = field;

        this.destroyTileCallback = (tileType: string) => {
            if(tileType !== 'magic_hat') return;

            this.goalCount--;

            if(this.goalCount <= 0) {
                this.setInactiveState();
            }
        };

        field.on('spawn', this.destroyTileCallback);
    }

    destroyTile(delay: number) {
        if(this.fieldNode && this.destroyTileCallback) {
            this.fieldNode.off('spawn', this.destroyTileCallback);
        }

        this.node.off(Node.EventType.TOUCH_END, this.onHatTouched, this);
        super.destroyTile(delay);
    }

    destroyClear() {
        if(this.fieldNode && this.destroyTileCallback) {
            this.fieldNode.off('spawn', this.destroyTileCallback);
        }

        this.node.off(Node.EventType.TOUCH_END, this.onHatTouched, this);
        super.destroyClear();
    }

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = false;
        this.isInactive = false;
        this.isCarrotAnimating = false;

        this.node.off(Node.EventType.TOUCH_END, this.onHatTouched, this);
        this.node.on(Node.EventType.TOUCH_END, this.onHatTouched, this);

        if(this.hatSpine?.skeletonData) {
            this.hatSpine.node.active = true;
            this.hatSpine.enabled = true;
            this.hatSpine.clearTracks();
            this.hatSpine.setToSetupPose();
            this.hatSpine.setAnimation(0, 'idle_active', false);

            if(this.activeState) this.activeState.active = false;
            if(this.inactiveState) this.inactiveState.active = false;
        }
    }

    getDamage(damageType: string) {
        console.log('[MAGIC HAT DAMAGE]', {
            row: this.row,
            col: this.col,
            goalCount: this.goalCount,
            isDamaged: this.isDamaged,
            isInactive: this.isInactive,
            isCarrotAnimating: this.isCarrotAnimating,
            hasSpine: !!this.hatSpine?.skeletonData
        });

        if(this.isDamaged || this.isInactive || this.isCarrotAnimating || this.goalCount <= 0) {
            return;
        }

        this.setAsDamaged();

        if(this.goalCount > 0) {
            this.playGoalSound();
        }

        this.playRandomCarrotAnimation();
    }

    private playRandomCarrotAnimation(): void {
        const sourceSpine = this.hatSpine;
        const uiTile = this.node.getComponent(UITile);
        const overlayLayer = uiTile?.getAnimationsLayout();

        let completed = false;

        const completeGoal = () => {
            if(completed) return;
            completed = true;

            this.isCarrotAnimating = false;

            if(!this.node.isValid) return;

            this.node.emit('goal', 'magic_hat');
            this.node.emit('goal_effect', 'magic_hat', this.row, this.col);
        };

        if(!sourceSpine?.skeletonData || !sourceSpine.node.isValid) {
            console.warn('[MAGIC HAT] Source Spine missing');
            completeGoal();
            return;
        }

        const animations = ['carrot_1', 'carrot_2', 'carrot_3', 'carrot_4']
            .filter(name => !!sourceSpine.findAnimation(name));

        if(animations.length === 0) {
            console.warn('[MAGIC HAT] No carrot animations found');
            completeGoal();
            return;
        }

        if(!overlayLayer?.isValid || !overlayLayer.activeInHierarchy) {
            console.warn('[MAGIC HAT] AnimationsLayer missing or inactive');
            completeGoal();
            return;
        }

        const animationName = animations[Math.floor(Math.random() * animations.length)];

        this.isCarrotAnimating = true;

        const sourceNode = sourceSpine.node;
        const worldPosition = sourceNode.worldPosition.clone();
        const worldRotation = sourceNode.worldRotation.clone();
        const worldScale = sourceNode.worldScale.clone();

        let fxNode: Node = null;

        try {
            // Создаём отдельную копию Spine только для вылета морковки.
            fxNode = instantiate(sourceNode);
            fxNode.name = 'MagicHatCarrotFx';

            const fxSpine = fxNode.getComponent(sp.Skeleton);

            if(!fxSpine?.skeletonData) {
                throw new Error('Cloned carrot Spine is missing');
            }

            // Помещаем эффект поверх игрового поля.
            overlayLayer.addChild(fxNode);

            // Сохраняем точное положение и масштаб исходного Spine.
            fxNode.setWorldPosition(worldPosition);
            fxNode.setWorldRotation(worldRotation);
            fxNode.setWorldScale(worldScale);
            fxNode.setSiblingIndex(overlayLayer.children.length - 1);

            fxNode.active = true;
            fxSpine.enabled = true;
            fxSpine.timeScale = 1;

            // Убираем все старые анимации и возвращаем setup pose.
            // В нашем hat.json слоты шляпы в setup pose пустые.
            fxSpine.clearTracks();
            fxSpine.setToSetupPose();

            // Запускаем только морковку, без touch и анимации шляпы.
            const carrotTrack = fxSpine.setAnimation(0, animationName, false);

            if(!carrotTrack) {
                throw new Error('Cannot start animation: ' + animationName);
            }

            console.log('[MAGIC HAT CARROT OVERLAY START]', {
                animation: animationName,
                row: this.row,
                col: this.col,
                overlay: overlayLayer.name,
                position: fxNode.worldPosition.toString()
            });

            fxSpine.setTrackCompleteListener(carrotTrack, () => {
                console.log('[MAGIC HAT CARROT OVERLAY COMPLETE]', animationName);

                if(fxNode?.isValid) fxNode.destroy();

                completeGoal();
            });

        } catch(error) {
            console.error('[MAGIC HAT CARROT OVERLAY ERROR]', error);

            if(fxNode?.isValid) fxNode.destroy();

            completeGoal();
        }
    }

    subscribeOnGoals(goals: GoalData[]) {
        this.goalCount = 0;

        for(let i = 0; i < goals.length; i++) {
            if(goals[i].id === this.tileType) {
                this.goalCount = goals[i].count;
                return;
            }
        }
    }

    isReadyToDestroy(): boolean {
        return false;
    }

    setInactiveState() {
        if(this.isInactive) return;

        this.isInactive = true;

        if(this.hatSpine?.skeletonData) {
            if(this.activeState) this.activeState.active = false;
            if(this.inactiveState) this.inactiveState.active = false;

            const skeleton = this.hatSpine;
            skeleton.clearTracks();

            const track = skeleton.setAnimation(0, 'inactive', false);

            if(track) {
                skeleton.setTrackCompleteListener(track, () => {
                    if(this.node.isValid && this.isInactive && skeleton.isValid) {
                        skeleton.setAnimation(0, 'idle_inactive', false);
                    }
                });
            }
            else {
                skeleton.setAnimation(0, 'idle_inactive', false);
            }
        }
        else {
            if(this.inactiveState) this.inactiveState.active = true;
            if(this.activeState) this.activeState.active = false;
        }

        this.playInactiveSound();
    }

    clearExtra() {
        this.isDamaged = false;
    }

    getCustomParameter(): number {
        return this.goalCount;
    }

    setCustomParameter(index: number) {
        this.goalCount = index;

        if(this.goalCount <= 0) {
            this.setInactiveState();
        }
    }

    playInactiveSound() {
        this.playSound(1);
    }

    playGoalSound() {
        this.playSound(0);
    }


    private onHatTouched(event: EventTouch): void {
        const start = event.getUIStartLocation();
        const end = event.getUILocation();

        if(Vec2.distance(start, end) > 12) return;

        console.log('[MAGIC HAT TOUCH]', {
            row: this.row,
            col: this.col,
            inactive: this.isInactive
        });

        this.playHatTouchAnimation();
    }

    private playHatTouchAnimation(): void {
        if(this.isCarrotAnimating) return;

        const skeleton = this.hatSpine;

        if(!skeleton?.skeletonData) {
            console.warn('[MAGIC HAT TOUCH] HatSpine is missing');
            return;
        }

        const animationName = this.isInactive ? 'touch_inactive' : 'touch_active';

        if(!skeleton.findAnimation(animationName)) {
            console.warn('[MAGIC HAT TOUCH] Animation missing:', animationName);
            return;
        }

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.timeScale = 1;

        const track = skeleton.setAnimation(0, animationName, false);

        if(!track) return;

        console.log('[MAGIC HAT TOUCH START]', animationName);

        skeleton.setTrackCompleteListener(track, () => {
            if(!this.node.isValid || !skeleton.isValid || this.isCarrotAnimating) return;

            const idleName = this.isInactive ? 'idle_inactive' : 'idle_active';
            skeleton.setAnimation(0, idleName, false);

            console.log('[MAGIC HAT TOUCH COMPLETE]', animationName);
        });
    }
}
