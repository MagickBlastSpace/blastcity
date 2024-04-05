import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { UITile } from '../UITile';
const { ccclass, property } = _decorator;

@ccclass('UITutorialFingerStatus')
export class UITutorialFingerStatus extends UITile {

    startScaleAnimation() {
        tween(this.node).stop();
    
        tween(this.node)
            .to(0.8, { scale: new Vec3(1.2, 1.2, 1.2) }, { easing: 'linear' })
            .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: 'linear' })
            .call(() => { this.startScaleAnimation() }) 
            .start();
    }


    init(posX: number, posY: number, layout: Node, isStatus: boolean) {
        this.node.setPosition(posX, posY);

        layout.addChild(this.node);

        this.currentX = posX;
        this.currentY = posY;

        this.startScaleAnimation();

        this.isBlocked = false;
    }
}


