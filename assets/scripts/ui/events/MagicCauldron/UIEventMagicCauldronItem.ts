import { _decorator, Component, Node, Sprite, tween, Vec3 } from 'cc';
import { SpriteTileData } from '../../../game/Tile';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldronItem')
export class UIEventMagicCauldronItem extends Component {
    
    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    iconsData: SpriteTileData[] = [];


    refresh(color: string) {
        if(color === "none") {
            if(this.icon.spriteFrame !== null) {
                tween(this.node).stop();
                tween(this.node)
                    .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
                    .call(() => {
                        this.icon.spriteFrame = null;
                    })
                    .start();
            }
                
            this.icon.spriteFrame = null;
            return;
        }

        tween(this.node).stop();
        tween(this.node)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();

        this.icon.spriteFrame = this.iconsData.find(i => i.id === color)?.icon;
    }
}


