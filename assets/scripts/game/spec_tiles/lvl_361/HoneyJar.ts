import { _decorator, sp } from 'cc';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';

const { ccclass } = _decorator;

@ccclass('HoneyJar')
export class HoneyJar extends SpecTileBase {

    private isHoneyJarTile: boolean = false;


    private getHoneyJarSpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;
        this.isHoneyJarTile = tileType.replace(/_/g, '').toLowerCase() === 'honeyjar';

        if (!this.isHoneyJarTile) return;

        const uiTile = this.node.getComponent(UITile);

        if (uiTile) {
            uiTile.keepSpineVisible = true;
        }

        const skeleton = this.getHoneyJarSpine();

        if (!skeleton?.skeletonData) return;

        skeleton.node.active = true;
        skeleton.clearTracks();
        skeleton.setAnimation(0, 'idle_jar', true);
    }


    getDamage(damageType: string) {
        if (damageType === 'bonus') {
            this.strength--;
        }
        else if (!this.isDamaged) {
            this.changeColor = damageType;
            this.strength--;
            this.setAsDamaged();
        }
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    startDestroyConsequences() {
        if (this.isHoneyJarTile) {
            const skeleton = this.getHoneyJarSpine();

            if (skeleton?.skeletonData) {
                this.playAdditionalAnimation(
                    skeleton,
                    'hit_1',
                    skeleton.node
                );
            }
        }

        this.node.emit('change', this.row, this.col, 'honey');
    }
}
