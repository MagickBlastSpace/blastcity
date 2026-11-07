import { _decorator, sp } from 'cc';
import { UITile } from '../../../ui/UITile';
import { Box } from '../lvl_21/Box';

const { ccclass } = _decorator;

@ccclass('Honey')
export class Honey extends Box {

    private readonly destroyAnimationSpeed: number = 2.5;


    private getHoneySpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }


    init(row: number, col: number, tileType: string) {
        const uiTile = this.node.getComponent(UITile);

        if (uiTile) {
            uiTile.keepSpineVisible = true;
        }

        super.init(row, col, tileType);
    }


    refresh() {
        if (this.strength <= 0) return;

        const skeleton = this.getHoneySpine();

        if (!skeleton?.skeletonData) return;

        skeleton.node.active = true;
        skeleton.clearTracks();

        skeleton.setAnimation(0, 'idle_honey', true);
    }


    startDestroyConsequences() {
        const skeleton = this.getHoneySpine();

        if (skeleton?.skeletonData) {
            const originalTimeScale = skeleton.timeScale;

            skeleton.timeScale = this.destroyAnimationSpeed;

            try {
                //Зменить spine через Юлю на 'destroy' или оставить так
                this.playAdditionalAnimation(
                    skeleton,
                    'destyor',
                    skeleton.node
                );
            } finally {
                skeleton.timeScale = originalTimeScale;
            }

            console.log('[HONEY] DESTROY', {
                animation: 'destyor',
                speed: this.destroyAnimationSpeed
            });
        }

        this.node.emit('goal', 'honey');
    }
}
