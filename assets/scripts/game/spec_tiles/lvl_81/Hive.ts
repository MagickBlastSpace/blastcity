import { _decorator, sp } from 'cc';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';

const { ccclass, property } = _decorator;

@ccclass('Hive')
export class Hive extends SpecTileBase {

    private getHiveSpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }

    private playHiveTouch(): void {
        if(this.strength <= 0) return;

        const skeleton = this.getHiveSpine();
        if(!skeleton?.skeletonData || !skeleton.node.activeInHierarchy) return;

        const currentAnimation = skeleton.getCurrent(0)?.animation?.name;
        if(currentAnimation !== 'idle') return;

        const touchAnimation = 'touch2';

        if(!skeleton.findAnimation(touchAnimation)) {
            console.warn('[HIVE] Touch animation not found:', touchAnimation);
            return;
        }

        if(!touchAnimation) {
            console.warn('[HIVE] Touch animation not found');
            return;
        }

        skeleton.setAnimation(0, touchAnimation, false);
        skeleton.addAnimation(0, 'idle', true, 0);
    }

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;

        this.node.off('touch_feedback', this.playHiveTouch, this);
        this.node.on('touch_feedback', this.playHiveTouch, this);

        const uiTile = this.node.getComponent(UITile);

        if (uiTile) {
            uiTile.keepSpineVisible = true;
            uiTile.useSpineDestroyOnly = true;
        }

        const skeleton = this.getHiveSpine();

        if (skeleton?.skeletonData) {
            skeleton.node.active = true;
        }
    }

    start() {
        const skeleton = this.getHiveSpine();

        if (!skeleton?.skeletonData) return;

        skeleton.node.active = true;
        skeleton.clearTracks();

        skeleton.setAnimation(0, 'idle', true);
    }

    getDamage(damageType: string) {
        if (damageType !== 'bonus' || this.strength <= 0) {
            return;
        }

        this.strength--;

        const skeleton = this.getHiveSpine();

        if (!skeleton?.skeletonData) {
            console.warn('[HIVE] Spine not found');
            return;
        }

        skeleton.node.active = true;
        skeleton.clearTracks();

        skeleton.setAnimation(0, 'destroy', false);
    }

    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }

    startDestroyConsequences() {
        this.node.emit('goal', 'hive');
    }

    protected onDestroyHive(): void {
        this.node.off('touch_feedback', this.playHiveTouch, this);
    }
}
