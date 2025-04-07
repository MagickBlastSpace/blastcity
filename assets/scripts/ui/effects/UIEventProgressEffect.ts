import { _decorator, Component, Node, Sprite, Label, Vec3, tween } from 'cc';
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

    private eventName: string = "";


    init(startPosition: Vec2, targetPosition: Vec2) {
        this.node.setPosition(startPosition.x, startPosition.y);

        tween(this.node)
            .to(this.lifeTime, { position: new Vec3(targetPosition.x, targetPosition.y, 0) })
            .call(() => {
                this.node.emit("event_progress_done", this.eventName);

                this.node.destroy();
            })
            .start();
    }
    
    
    setIcon(eventName: string) {
        this.icon.spriteFrame = this.icons.find(i => i.id === eventName)?.icon;

        this.eventName = eventName;
    }

    setCount(count: number) {
        this.countLabel.string = count;
    }
}


