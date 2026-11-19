import { _decorator, EventTouch, Node, sp, Vec2 } from 'cc';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';
import { Honey } from './Honey';

const { ccclass } = _decorator;

@ccclass('HoneyJar')
export class HoneyJar extends SpecTileBase {

    private isHoneyJarTile: boolean = false;
    private isJarBreaking: boolean = false;


    private getHoneyJarSpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;
        this.isJarBreaking = false;
        this.isHoneyJarTile = tileType.replace(/_/g, '').toLowerCase() === 'honeyjar';

        if(!this.isHoneyJarTile) return;

        const uiTile = this.node.getComponent(UITile);

        if(uiTile) uiTile.keepSpineVisible = true;

        const skeleton = this.getHoneyJarSpine();

        if(skeleton?.skeletonData) {
            skeleton.node.active = true;
            skeleton.enabled = true;
            skeleton.timeScale = 1;
            skeleton.clearTracks();
            skeleton.setToSetupPose();
            skeleton.setAnimation(0, 'idle_jar', true);
        }

        this.node.off(Node.EventType.TOUCH_END, this.onHoneyJarTouched, this);
        this.node.on(Node.EventType.TOUCH_END, this.onHoneyJarTouched, this);

        this.node.off('touch_feedback', this.playHoneyJarTouch, this);
        this.node.on('touch_feedback', this.playHoneyJarTouch, this);
    }


    private onHoneyJarTouched(event: EventTouch): void {
        if(Vec2.distance(event.getUIStartLocation(), event.getUILocation()) > 12) return;

        this.playHoneyJarTouch();
    }


    private playHoneyJarTouch(): void {
        if(!this.isHoneyJarTile || this.isJarBreaking || this.strength <= 0) return;

        const skeleton = this.getHoneyJarSpine();

        if(!skeleton?.skeletonData || !skeleton.findAnimation('touch_jar')) return;

        const currentAnimation = skeleton.getCurrent(0)?.animation?.name;

        if(currentAnimation && currentAnimation !== 'idle_jar') return;

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.timeScale = 1;

        skeleton.setAnimation(0, 'touch_jar', false);
        skeleton.addAnimation(0, 'idle_jar', true, 0);
    }


    getDamage(damageType: string) {
        if(this.strength <= 0) return;

        if(damageType === 'bonus') {
            this.strength--;
        }
        else if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    startDestroyConsequences() {
        if(!this.isHoneyJarTile) {
            this.node.emit('change', this.row, this.col, 'honey');
            return;
        }

        if(this.isJarBreaking) return;
        this.isJarBreaking = true;

        const row = this.row;
        const col = this.col;
        const skeleton = this.getHoneyJarSpine();

        const canPlayBreak = !!skeleton?.skeletonData &&
            !!skeleton.findAnimation('hit_1');

        const transitionId = canPlayBreak
            ? Honey.beginJarTransition(row, col)
            : null;

        let isBreakStarted = false;

        if(canPlayBreak && skeleton) {
            skeleton.node.active = true;
            skeleton.enabled = true;
            skeleton.timeScale = 1;

            skeleton.clearTracks();

            this.playAnimation('hit_1', false, 1);

            const track = skeleton.getCurrent(0);

            if(track?.animation?.name === 'hit_1') {
                isBreakStarted = true;

            skeleton.setCompleteListener(() => {
                const effectNode = skeleton.node;

                const effectWorldPosition = effectNode?.isValid
                    ? effectNode.worldPosition.clone()
                    : undefined;

                if(effectNode?.isValid) {
                    effectNode.active = false;
                    effectNode.destroy();
                }

                if(transitionId !== null) {
                    Honey.finishJarTransition(row, col, transitionId, effectWorldPosition);
                }
            });
            }
        }

        this.node.emit('change', row, col, 'honey');

        if(!isBreakStarted && transitionId !== null) {
            Honey.finishJarTransition(row, col, transitionId);
        }
    }


    destroyTile(delay: number) {
        this.node.off(Node.EventType.TOUCH_END, this.onHoneyJarTouched, this);
        this.node.off('touch_feedback', this.playHoneyJarTouch, this);

        super.destroyTile(delay);
    }


    destroyClear() {
        this.node.off(Node.EventType.TOUCH_END, this.onHoneyJarTouched, this);
        this.node.off('touch_feedback', this.playHoneyJarTouch, this);

        super.destroyClear();
    }
}
