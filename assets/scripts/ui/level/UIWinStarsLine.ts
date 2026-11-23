import {
    _decorator,
    Component,
    instantiate,
    isValid,
    Mask,
    Node,
    Prefab,
    sp,
    Tween,
    tween,
    UITransform,
    Vec3
} from 'cc';
import { ResolutionManager } from '../../utils/ResolutionManager';

const { ccclass, property } = _decorator;

@ccclass('UIWinStarsLine')
export class UIWinStarsLine extends Component {

    @property(Prefab)
    linePrefab: Prefab | null = null;

    @property
    referenceLength: number = 650;

    @property
    reachDelay: number = 0.77;

    @property
    portraitThickness: number = 2;

    @property
    portraitClipAboveCounter: number = 25;

    @property
    angleOffset: number = 0;

    @property(Node)
    debugStartNode: Node | null = null;

    @property(Node)
    debugEndNode: Node | null = null;

    @property
    debugPlayOnStart: boolean = false;

    private activeLines: Set<Node> = new Set();

    start(): void {
        if(!this.debugPlayOnStart) return;

        const fieldNode = this.node.parent?.getChildByName('Field');

        if(!fieldNode) {
            console.warn('[WIN LINE DEBUG] Field node not found');
            return;
        }

        let debugLaunched = false;

        const launchDebug = (): void => {
            if(debugLaunched) return;

            debugLaunched = true;

            this.scheduleOnce(() => {
                const from = this.debugStartNode;
                const to = this.debugEndNode;

                if(!from?.isValid || !to?.isValid) {
                    console.warn('[WIN LINE DEBUG] Debug nodes missing');
                    return;
                }

                if(!from.activeInHierarchy || !to.activeInHierarchy) {
                    console.warn('[WIN LINE DEBUG] Debug node is inactive');
                    return;
                }

                this.playBetweenNodes(from, to);

            }, 0.5);
        };

        fieldNode.once('level_init', launchDebug, this);

        this.scheduleOnce(() => {
            if(
                !debugLaunched &&
                this.debugStartNode?.activeInHierarchy &&
                this.debugEndNode?.activeInHierarchy
            ) {
                console.log('[WIN LINE DEBUG] Using fallback launch');
                launchDebug();
            }
        }, 5);
    }

    public playBetweenNodes(
        fromNode: Node,
        toNode: Node,
        onReach?: () => void
    ): Node | null {

        if(!fromNode?.isValid || !toNode?.isValid) {
            console.warn('[WIN LINE] Invalid start or target node');
            onReach?.();
            return null;
        }

        return this.playLine(
            fromNode.worldPosition.clone(),
            toNode.worldPosition.clone(),
            onReach
        );
    }

    public playLine(
        fromWorld: Vec3,
        toWorld: Vec3,
        onReach?: () => void
    ): Node | null {

        if(!this.node.isValid || !this.node.activeInHierarchy) {
            onReach?.();
            return null;
        }

        if(!this.linePrefab) {
            console.warn('[WIN LINE] Prefab missing');
            onReach?.();
            return null;
        }

        this.updatePortraitClip(fromWorld);

        const transform = this.node.getComponent(UITransform);

        if(!transform) {
            console.error('[WIN LINE] UITransform missing on effects layer');
            onReach?.();
            return null;
        }

        const start = transform.convertToNodeSpaceAR(fromWorld);
        const target = transform.convertToNodeSpaceAR(toWorld);

        const dx = target.x - start.x;
        const dy = target.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < 1) {
            onReach?.();
            return null;
        }

        const effect = instantiate(this.linePrefab);
        this.node.addChild(effect);

        effect.layer = this.node.layer;
        effect.active = true;
        effect.setPosition(start.x, start.y, 0);

        const angle = Math.atan2(dy, dx) * 180 / Math.PI
            + this.angleOffset;

        effect.setRotationFromEuler(0, 0, angle);

        const isPortrait = ResolutionManager.instance.isPortraitOrientation();

        const thickness = isPortrait
            ? this.portraitThickness
            : 1;

        effect.setScale(
            distance / Math.max(1, this.referenceLength),
            thickness,
            1
        );

        const skeleton = effect.getComponent(sp.Skeleton);

        if(!skeleton?.skeletonData ||
           !skeleton.findAnimation('activate')) {

            console.warn('[WIN LINE] Spine activate missing');
            effect.destroy();
            onReach?.();
            return null;
        }

        this.activeLines.add(effect);

        skeleton.enabled = true;
        skeleton.timeScale = 1;
        skeleton.clearTracks();
        skeleton.setToSetupPose();

        const track = skeleton.setAnimation(
            0,
            'activate',
            false
        );

        if(!track) {
            this.activeLines.delete(effect);
            effect.destroy();
            onReach?.();
            return null;
        }

        let hasReached = false;

        const reach = (): void => {
            if(hasReached || !this.activeLines.has(effect)) return;

            hasReached = true;

            try {
                onReach?.();
            } catch(error) {
                console.error('[WIN LINE] Reach callback error', error);
            }
        };

        const finish = (): void => {
            if(!this.activeLines.has(effect)) return;

            reach();

            this.activeLines.delete(effect);
            this.unschedule(reach);
            this.unschedule(finish);

            if(isValid(effect, true)) {
                Tween.stopAllByTarget(effect);
                effect.destroy();
            }
        };

        const duration = track.animation?.duration ?? 2.17;

        const travelTime = Math.min(
            Math.max(0.01, this.reachDelay),
            duration
        );

        const frontOffset = 47;
        const correction = frontOffset / Math.max(1, this.referenceLength);

        const adjustedTarget = new Vec3(
            target.x - dx * correction,
            target.y - dy * correction,
            0
        );

        tween(effect)
            .to(
                travelTime,
                {
                    position: adjustedTarget
                },
                {
                    easing: 'linear'
                }
            )
            .call(() => {
                reach();
            })
            .start();

        skeleton.setTrackCompleteListener(track, finish);
        skeleton.setTrackInterruptListener(track, finish);
        skeleton.setTrackEndListener(track, finish);

        this.scheduleOnce(finish, duration + 0.3);

        return effect;
    }

    public clearLines(): void {
        this.unscheduleAllCallbacks();

        const lines = Array.from(this.activeLines);
        this.activeLines.clear();

        for(const effect of lines) {
            Tween.stopAllByTarget(effect);

            if(isValid(effect, true)) {
                effect.destroy();
            }
        }
    }

    private updatePortraitClip(fromWorld: Vec3): void {
        const mask = this.node.getComponent(Mask);
        const transform = this.node.getComponent(UITransform);

        if(!mask || !transform) {
            console.warn('[WIN LINE] Mask or UITransform missing');
            return;
        }

        const isPortrait =
            ResolutionManager.instance.isPortraitOrientation();

        if(!isPortrait) {
            mask.enabled = false;
            return;
        }

        const start = transform.convertToNodeSpaceAR(fromWorld);

        const clipSize = 12000;

        const topBoundary =
            start.y + this.portraitClipAboveCounter;

        transform.setContentSize(clipSize, clipSize);

        transform.setAnchorPoint(
            0.5,
            1 - topBoundary / clipSize
        );

        mask.type = Mask.Type.GRAPHICS_RECT;
        mask.inverted = false;
        mask.enabled = true;
    }

    protected onDisable(): void {
        this.clearLines();
    }

    protected onDestroy(): void {
        this.clearLines();
    }
}
