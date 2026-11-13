
import { _decorator, Node, sp } from 'cc';
import { StatusBase } from './StatusBase';

const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Bubble extends StatusBase {

    @property(sp.Skeleton)
    bubbleSpine: sp.Skeleton = null;

    private isBubbleDestroying: boolean = false;
    private isBubbleTouchPlaying: boolean = false;

    private getBubbleSpine(): sp.Skeleton | null {
        return this.bubbleSpine ??
            this.node.getChildByName('BubbleSpine')?.getComponent(sp.Skeleton) ??
            null;
    }

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isBlockMovement = false;
        this.isBlockInteraction = false;
        this.isBlockDestroyTile = false;
        this.isMatchHit = false;

        if(this.getStatusType() !== 'bubble') return;

        this.isBubbleDestroying = false;
        this.isBubbleTouchPlaying = false;

        this.node.off(Node.EventType.TOUCH_START, this.onBubbleTouchStart, this);
        this.node.on(Node.EventType.TOUCH_START, this.onBubbleTouchStart, this);

        this.node.off('bubble_touch', this.playBubbleTouch, this);
        this.node.on('bubble_touch', this.playBubbleTouch, this);

        this.showIdleBubble();
    }

    private showIdleBubble(): void {
        const skeleton = this.getBubbleSpine();

        if(!skeleton?.skeletonData || this.isBubbleDestroying) return;

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.clearTracks();
        skeleton.setToSetupPose();
        skeleton.setAttachment('bubble', 'bubble');
    }

    private onBubbleTouchStart(): void {
        if(this.isBubbleDestroying || this.isReadyToDestroy()) return;

        this.node.emit('bubble_click', this.getRow(), this.getCol());
    }

    private playBubbleTouch(): void {
        if(this.isBubbleDestroying || this.isBubbleTouchPlaying || this.isReadyToDestroy()) return;

        const skeleton = this.getBubbleSpine();

        if(!skeleton?.skeletonData) return;

        if(!skeleton.findAnimation('touch')) {
            console.warn('[BUBBLE] touch animation not found');
            return;
        }

        this.isBubbleTouchPlaying = true;

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.clearTracks();
        skeleton.setToSetupPose();

        const track = skeleton.setAnimation(0, 'touch', false);

        if(!track) {
            this.isBubbleTouchPlaying = false;
            this.showIdleBubble();
            return;
        }

        console.log('[BUBBLE TOUCH]', this.getRow(), this.getCol());

        skeleton.setTrackCompleteListener(track, () => {
            if(!this.node.isValid || this.isBubbleDestroying) return;

            this.isBubbleTouchPlaying = false;
            this.showIdleBubble();
        });
    }

    getDamage() {
        if(this.isBubbleDestroying || this.isReadyToDestroy()) return;

        this.setAsDamaged();
        this.playDamageSound();
    }

    isReadyToDestroy(): boolean {
        return this.isDamaged;
    }

    destroyStatus() {
        if(this.getStatusType() !== 'bubble') {
            super.destroyStatus();
            return;
        }

        if(this.isBubbleDestroying) return;

        const skeleton = this.getBubbleSpine();

        if(!skeleton?.skeletonData || !skeleton.findAnimation('animation')) {
            super.destroyStatus();
            return;
        }

        this.isBubbleDestroying = true;
        this.isBubbleTouchPlaying = false;

        this.node.off(Node.EventType.TOUCH_START, this.onBubbleTouchStart, this);

        this.startDestroyConsequences();

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.clearTracks();
        skeleton.setToSetupPose();

        const track = skeleton.setAnimation(0, 'animation', false);

        if(!track) {
            this.node.destroy();
            return;
        }

        console.log('[BUBBLE DESTROY]', this.getRow(), this.getCol());

        skeleton.setTrackCompleteListener(track, () => {
            if(this.node.isValid) this.node.destroy();
        });
    }

    startDestroyConsequences() {
        this.node.emit('goal', 'bubble');
    }

    playDamageSound() {
        this.playSound(0);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onBubbleTouchStart, this);
        this.node.off('bubble_touch', this.playBubbleTouch, this);
    }
}
