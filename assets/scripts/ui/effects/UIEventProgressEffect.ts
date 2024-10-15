import { _decorator, Component, Node, Sprite } from 'cc';
import { UIRewardEffect } from './UIRewardEffect';
import { SpriteTileData } from '../../game/Tile';
const { ccclass, property } = _decorator;

@ccclass('UIEventProgressEffect')
export class UIEventProgressEffect extends UIRewardEffect {

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    icons: SpriteTileData[] = [];
    
    
    setIcon(eventName: string) {
        this.icon.spriteFrame = this.icons.find(i => i.id === eventName)?.icon;
    }
}


