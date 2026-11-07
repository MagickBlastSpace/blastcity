import { _decorator, sp } from 'cc';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';

const { ccclass, property } = _decorator;

@ccclass('Hive')
export class Hive extends SpecTileBase {

    private getHiveSpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;

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

        console.log('[HIVE] DAMAGE', {
            strength: this.strength,
            damageType
        });

        const skeleton = this.getHiveSpine();

        if (!skeleton?.skeletonData) {
            console.warn('[HIVE] Spine not found');
            return;
        }

        skeleton.node.active = true;
        skeleton.clearTracks();

        skeleton.setAnimation(0, 'destroy', false);

        console.log('[HIVE] DESTROY START');
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    startDestroyConsequences() {
        this.node.emit('goal', 'hive');
    }
}
