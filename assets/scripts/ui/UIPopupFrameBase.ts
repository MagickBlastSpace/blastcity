import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { UIFrameBase } from './UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIPopupFrameBase')
export class UIPopupFrameBase extends UIFrameBase {

    @property(Node)
    contentNode: Node = null;

    
    show() {
        this.node.active = true;
        this.contentNode.scale = new Vec3(0, 0, 0);

        tween(this.contentNode)
            //.to(0, { scale: new Vec3(0, 0, 0) }, { easing: 'linear' })
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }


    hide() {
        tween(this.contentNode)
            .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    hideClean() {
        this.node.active = false;
    }
}


