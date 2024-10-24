import { _decorator, Component, Node, Sprite, Label } from 'cc';
import { UIRewardEffect } from './UIRewardEffect';
import { SpriteTileData } from '../../game/Tile';
const { ccclass, property } = _decorator;

@ccclass('UIEventProgressEffect')
export class UIEventProgressEffect extends UIRewardEffect {

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    icons: SpriteTileData[] = [];

    @property(Label)
    countLabel: Label = null;

    private lifeTime: number = 2.5;
    
    
    setIcon(eventName: string) {
        this.icon.spriteFrame = this.icons.find(i => i.id === eventName)?.icon;
    }

    setCount(count: number) {
        this.countLabel.string = count;
    }
}


