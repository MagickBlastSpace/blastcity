
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
        this.node.off('touch_feedback', this.playHatTouchAnimation, this);
        super.destroyTile(delay);
    }

    destroyClear() {
        if(this.fieldNode && this.destroyTileCallback) {
            this.fieldNode.off('spawn', this.destroyTileCallback);
        }

        this.node.off(Node.EventType.TOUCH_END, this.onHatTouched, this);
        this.node.off('touch_feedback', this.playHatTouchAnimation, this);
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

        this.node.off('touch_feedback', this.playHatTouchAnimation, this);
        this.node.on('touch_feedback', this.playHatTouchAnimation, this);

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

        let displayFx: Node = null;
        let carrotFx: Node = null;
        let sourceNode: Node = null;
        let sourceWasActive = true;
        let completed = false;

        const completeGoal = () => {
            if(completed) return;
            completed = true;

            if(displayFx?.isValid) displayFx.destroy();
            if(carrotFx?.isValid) carrotFx.destroy();

            if(sourceNode?.isValid) {
                sourceNode.active = sourceWasActive;
            }

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
            console.warn('[MAGIC HAT] Carrot animations missing');
            completeGoal();
            return;
        }

        if(!overlayLayer?.isValid || !overlayLayer.activeInHierarchy) {
            console.warn('[MAGIC HAT] AnimationsLayer missing');
            completeGoal();
            return;
        }

        if(!sourceSpine.findAnimation('hat_back') || !sourceSpine.findAnimation('hat_front')) {
            console.warn('[MAGIC HAT] Hat animations missing');
            completeGoal();
            return;
        }

        const animationName = animations[Math.floor(Math.random() * animations.length)];

        sourceNode = sourceSpine.node;
        sourceWasActive = sourceNode.active;

        const worldPosition = sourceNode.worldPosition.clone();
        const worldRotation = sourceNode.worldRotation.clone();
        const worldScale = sourceNode.worldScale.clone();

        this.isCarrotAnimating = true;

        try {
            const getOrCreateLayer = (name: string): Node => {
                let layer = overlayLayer.getChildByName(name);

                if(!layer) {
                    layer = new Node(name);
                    overlayLayer.addChild(layer);
                }

                return layer;
            };

            const displayLayer = getOrCreateLayer('MagicHatDisplayLayer');
            const carrotLayer = getOrCreateLayer('MagicHatCarrotLayer');

            displayLayer.setSiblingIndex(overlayLayer.children.length - 1);
            carrotLayer.setSiblingIndex(overlayLayer.children.length - 1);

            const createFxNode = (name: string, parent: Node): Node => {
                const fx = instantiate(sourceNode);
                fx.name = name;

                parent.addChild(fx);

                fx.setWorldPosition(worldPosition);
                fx.setWorldRotation(worldRotation);
                fx.setWorldScale(worldScale);

                fx.active = true;

                return fx;
            };

            displayFx = createFxNode('MagicHatDisplayFx', displayLayer);
            carrotFx = createFxNode('MagicHatCarrotFx', carrotLayer);

            const displaySpine = displayFx.getComponent(sp.Skeleton);
            const carrotSpine = carrotFx.getComponent(sp.Skeleton);

            if(!displaySpine?.skeletonData || !carrotSpine?.skeletonData) {
                throw new Error('MagicHat Spine clone missing');
            }

            displaySpine.enabled = true;
            displaySpine.timeScale = 1;
            displaySpine.clearTracks();
            displaySpine.setToSetupPose();

            carrotSpine.enabled = true;
            carrotSpine.timeScale = 1;
            carrotSpine.clearTracks();
            carrotSpine.setToSetupPose();

            const backTrack = displaySpine.setAnimation(0, 'hat_back', false);
            const frontTrack = displaySpine.setAnimation(1, 'hat_front', false);

            const carrotTrack = carrotSpine.setAnimation(0, animationName, false);

            if(!backTrack || !frontTrack || !carrotTrack) {
                throw new Error('Cannot start MagicHat animations');
            }

            sourceNode.active = false;

            console.log('[MAGIC HAT OVERLAY START]', {
                row: this.row,
                col: this.col,
                animation: animationName,
                displayLayer: displayLayer.name,
                carrotLayer: carrotLayer.name
            });

            carrotSpine.setTrackCompleteListener(carrotTrack, () => {
                console.log('[MAGIC HAT OVERLAY COMPLETE]', animationName);
                completeGoal();
            });

        } catch(error) {
            console.error('[MAGIC HAT OVERLAY ERROR]', error);
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
