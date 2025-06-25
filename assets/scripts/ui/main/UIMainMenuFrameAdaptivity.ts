import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size } from 'cc';
import { UIAdaptivityBase } from '../UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenuFrameAdaptivity')
export class UIMainMenuFrameAdaptivity extends UIAdaptivityBase {

    @property(Node)
    mainMenuBtns: Node = null;

    @property(Node)
    sidePanel_left: Node = null;
    @property(Node)
    sidePanel_right: Node = null;

    private basic_MenuBtnsSize: number = 598;

    
    refresh() {
        const visibleSize = view.getVisibleSize();
    
        const w = visibleSize.width;
        const h = visibleSize.height;
    
        if (w > h) {
            const y = 0.125 * h;
            const x = 0.140 * w;
            
            const btnsScale = x / this.basic_MenuBtnsSize;
            this.mainMenuBtns.setScale(new Vec3(btnsScale, btnsScale, 1));

            const sidePanelSize = x;
            this.sidePanel_left.getComponent(UITransform).setContentSize(new Size(sidePanelSize, h));
            this.sidePanel_left.setPosition(-w / 2 + sidePanelSize / 2, 0);

            this.sidePanel_right.getComponent(UITransform).setContentSize(new Size(sidePanelSize, h));
            this.sidePanel_right.setPosition(w / 2 - sidePanelSize / 2, 0);

        } else {
            const y = 0.078 * h;
            const x = 0.2487 * w;
            
            const btnsScale = x / this.basic_MenuBtnsSize;
            this.mainMenuBtns.setScale(new Vec3(btnsScale, btnsScale, 1));
        }
    }
}


