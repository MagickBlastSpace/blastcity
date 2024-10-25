import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { UIFrameBase } from './UIFrameBase';
import { ResolutionManager } from '../utils/ResolutionManager';
import { AudioController } from '../utils/AudioController';
const { ccclass, property } = _decorator;

@ccclass('UIPopupFrameBase')
export class UIPopupFrameBase extends UIFrameBase {

    @property(Node)
    contentNode: Node = null;

    @property
    disablePopupSound: boolean = false;

    
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

        if(!this.disablePopupSound) {
            AudioController.instance.playPopup();
        }
    }


    hide() {
        tween(this.contentNode)
            .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
            .call(() => {
                this.node.active = false;
            })
            .start();

        if(!this.disablePopupSound) {
            AudioController.instance.playPopup();
        }

        this.node.emit("hide");
    }

    hideClean() {
        this.node.active = false;

        this.node.emit("hide");
    }

    adjustResolution() {
        ResolutionManager.instance.adjustResolution();
    }
}


