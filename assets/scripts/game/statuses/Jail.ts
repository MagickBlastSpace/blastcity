import { _decorator, EventTouch, Node, sp } from 'cc';
import { StatusBase } from './StatusBase';
const { ccclass, property } = _decorator;

@ccclass('Jail')
export class Jail extends StatusBase {

    @property(sp.Skeleton)
    cageSpine: sp.Skeleton = null;

    private isJailTouching: boolean = false;
    private isJailDestroying: boolean = false;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isBlockMovement = true;
        this.isBlockInteraction = true;
        this.isBlockDestroyTile = true;
        this.isMatchHit = true;

        this.isJailTouching = false;
        this.isJailDestroying = false;

        this.node.off(Node.EventType.TOUCH_END, this.onJailTouched, this);
        this.node.on(Node.EventType.TOUCH_END, this.onJailTouched, this);

        this.node.off('jail_touch', this.playJailTouch, this);
        this.node.on('jail_touch', this.playJailTouch, this);

        const skeleton = this.cageSpine;

        if(skeleton?.skeletonData) {
            skeleton.node.active = true;
            skeleton.enabled = true;
            skeleton.clearTracks();
            skeleton.setToSetupPose();
        }
    }

    private onJailTouched(event: EventTouch): void {
        event.propagationStopped = true;
        this.node.emit('jail_click');
    }

    private playJailTouch(): void {
        if(this.isJailDestroying || this.isJailTouching) return;

        const skeleton = this.cageSpine;

        if(!skeleton?.node?.isValid || !skeleton.skeletonData) return;
        if(!skeleton.findAnimation('touch')) return;

        this.isJailTouching = true;

        skeleton.node.active = true;
        skeleton.enabled = true;

        skeleton.clearTracks();
        skeleton.setToSetupPose();

        const track = skeleton.setAnimation(0, 'touch', false);

        if(!track) {
            this.isJailTouching = false;
            return;
        }

        skeleton.setTrackCompleteListener(track, () => {
            if(!this.node.isValid || this.isJailDestroying) return;

            this.isJailTouching = false;

            skeleton.clearTracks();
            skeleton.setToSetupPose();
        });
    }

    getDamage() {
        if(this.isJailDestroying) return;

        this.setAsDamaged();
        this.playDamageSound();
    }

    isReadyToDestroy(): boolean {
        return this.isDamaged;
    }

    destroyStatus(): void {
        if(this.isJailDestroying) return;

        this.isJailDestroying = true;
        this.isJailTouching = false;

        this.startDestroyConsequences();

        const skeleton = this.cageSpine;

        if(!skeleton?.node?.isValid || !skeleton.skeletonData) {
            this.node.destroy();
            return;
        }

        skeleton.node.active = true;
        skeleton.enabled = true;

        skeleton.clearTracks();
        skeleton.setToSetupPose();

        const finish = (): void => {
            if(this.node.isValid) this.node.destroy();
        };

        const track = skeleton.setAnimation(0, 'activate', false);

        if(track) {
            skeleton.setTrackCompleteListener(track, finish);
            this.scheduleOnce(finish, 0.65);
        } else {
            finish();
        }
    }

    startDestroyConsequences() {
        this.node.emit('goal', 'jail');
    }

    playDamageSound() {
        this.playSound(0);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_END, this.onJailTouched, this);
        this.node.off('jail_touch', this.playJailTouch, this);
    }
}
