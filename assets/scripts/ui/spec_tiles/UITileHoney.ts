import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { UITile } from '../UITile';
const { ccclass, property } = _decorator;

@ccclass('UITileHoney')
export class UITileHoney extends UITile {
    init(posX: number, posY: number, layout: Node, isStatus: boolean, tileType: string) {
        if(this.isBlocked) {
            return;
        }

        this.node.setPosition(posX, posY);
        this.node.setScale(new Vec3(0, 0, 0));

        this.currentX = posX;
        this.currentY = posY;

        this.destroyLayout = this.node.parent;
        this.animationsLayout = this.destroyLayout.parent;

        layout.addChild(this.node);

        if(this.content === null || this.content === undefined) {
            this.content = this.node;
        }

        tween(this.node)
            .to(this.fallTime, { scale: new Vec3(0.92, 1.08, 1) }, { easing: 'linear' })
            .to(0.07, { scale: new Vec3(1.03, 0.97, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(0.97, 1.03, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticInOut' })
            .start();
    }
}


