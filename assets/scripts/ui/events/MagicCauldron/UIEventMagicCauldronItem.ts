import { _decorator, Component, Node, Sprite } from 'cc';
import { SpriteTileData } from '../../../game/Tile';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldronItem')
export class UIEventMagicCauldronItem extends Component {
    
    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    iconsData: SpriteTileData[] = [];


    refresh(color: string) {
        this.icon.spriteFrame = this.iconsData.find(i => i.id === color)?.icon;
    }
}


