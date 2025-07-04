import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size } from 'cc';
import { UIAdaptivityBase } from '../UIAdaptivityBase';
import { UIMainMenuButton } from './UIMainMenuButton';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenuFrameAdaptivity')
export class UIMainMenuFrameAdaptivity extends UIAdaptivityBase {

    @property([UIMainMenuButton])
    buttonsUi: UIMainMenuButton[] = [];

    @property(Node)
    sidePanel_left: Node = null;
    @property(Node)
    sidePanel_right: Node = null;

    @property(Node)
    buttonsFrame: Node = null;

    @property(Widget)
    buttonsFrame_widget: Widget = null;

    private basic_ButtonsFrameSize: number = 300;

    
    refresh() {
        const visibleSize = view.getVisibleSize();
    
        const w = visibleSize.width;
        const h = visibleSize.height;
    
        if (w > h) {
            const y = 0.125 * h;
            const x = 0.140 * w;
            
            const btnsFrameScale = 0.0897 * h / this.basic_ButtonsFrameSize;
            this.buttonsFrame.setScale(new Vec3(btnsFrameScale, btnsFrameScale, 1));

            this.buttonsFrame_widget.bottom = 0;
            this.buttonsFrame_widget.updateAlignment();

            const sidePanelSize = x;
            this.sidePanel_left.getComponent(UITransform).setContentSize(new Size(sidePanelSize, h));
            this.sidePanel_left.setPosition(-w / 2 + sidePanelSize / 2, 0);

            this.sidePanel_right.getComponent(UITransform).setContentSize(new Size(sidePanelSize, h));
            this.sidePanel_right.setPosition(w / 2 - sidePanelSize / 2, 0);

        } else {
            const y = 0.078 * h;
            const x = 0.2487 * w;
            
            const btnsFrameScale = 0.1607 * w * 1.2316 / this.basic_ButtonsFrameSize;
            this.buttonsFrame.setScale(new Vec3(btnsFrameScale, btnsFrameScale, 1));
        }

        this.updateButtonsAdaptivity();
    }

    updateButtonsAdaptivity() {
        for(let i = 0; i < this.buttonsUi.length; i++) {
            this.buttonsUi[i].refreshAdaptivity();
        }
    }
}


