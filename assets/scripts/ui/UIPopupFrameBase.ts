import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { UIFrameBase } from './UIFrameBase';
import { ResolutionManager } from '../utils/ResolutionManager';
const { ccclass, property } = _decorator;

@ccclass('UIPopupFrameBase')
export class UIPopupFrameBase extends UIFrameBase {

    @property(Node)
    contentNode: Node = null;

    
    show() {
        if(!this.node.active) {
            this.contentNode.scale = new Vec3(0, 0, 0);
        }

        this.node.active = true;
        
        tween(this.contentNode)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                this.adjustResolution();
            })
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

    adjustResolution() {
        ResolutionManager.instance.adjustResolution();
    }
}


