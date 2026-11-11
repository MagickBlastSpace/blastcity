import { _decorator, isValid, sp } from 'cc';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Sticker')
export class Sticker extends SpecTileBase {

    @property(sp.Skeleton)
    crystalBallSpine: sp.Skeleton = null;

    playAnimation(
        animation: string,
        isLooped: boolean,
        timeScale: number
    ): void {

        if(
            /^balloon\d+$/i.test(animation) &&
            this.crystalBallSpine &&
            this.crystalBallSpine.skeletonData &&
            isValid(this.crystalBallSpine.node, true)
        ) {
            const uiTile = this.node.getComponent(UITile);

            if(uiTile?.getAnimationsLayout()) {

                uiTile.playAdditionalAnimation(
                    this.crystalBallSpine,
                    'destroy',
                    null
                );

                this.crystalBallSpine.node.active = false;

                return;
            }
        }

        super.playAnimation(animation, isLooped, timeScale);
    }

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 1;
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }

        this.strength--;

        this.setAsDamaged();
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    startDestroyConsequences() {
        this.node.emit("goal", "balloon");

        this.node.emit("goal", "sticker");

        this.playAnimation("balloon0", false, 1);
    }
}


