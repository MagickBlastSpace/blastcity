import { _decorator, Node, UITransform, Vec3, view, Widget } from 'cc';
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
    sideStick_left: Node = null;

    @property(Node)
    sideStick_right: Node = null;

    @property(Node)
    buttonsFrame: Node = null;

    @property(Widget)
    buttonsFrame_widget: Widget = null;

    @property(Widget)
    left_widget: Widget = null;

    @property(Widget)
    right_widget: Widget = null;

    private basic_ButtonsFrameSize: number = 300;
    private tabletScaleMul: number = 0.75;


    refresh() {
        const visibleSize = view.getVisibleSize();

        const w = visibleSize.width;
        const h = visibleSize.height;
        const ratio = w / h;

        if(ratio < 0.7) {
            this.makeMobileVariation(w);
        }
        else if(ratio < 1.5) {
            this.makeTabletVariation(w);
        }
        else {
            this.makeDesktopVariation(h);
        }

        if(w > h) {
            this.refreshSidePanels(w, h);
        }

        this.updateButtonsAdaptivity();
    }


    private makeMobileVariation(w: number) {
        const btnsFrameScale = 0.1607 * w * 1.2316 / this.basic_ButtonsFrameSize;

        this.applyButtonsFrameScale(btnsFrameScale);
    }


    private makeTabletVariation(w: number) {
        const btnsFrameScale = 0.1607 * w * this.tabletScaleMul * 1.2316 / this.basic_ButtonsFrameSize;

        this.applyButtonsFrameScale(btnsFrameScale);
    }


    private makeDesktopVariation(h: number) {
        const btnsFrameScale = 0.0897 * h / this.basic_ButtonsFrameSize;

        this.applyButtonsFrameScale(btnsFrameScale);
    }


    private applyButtonsFrameScale(scale: number) {
        this.buttonsFrame.setScale(new Vec3(scale, scale, 1));

        this.buttonsFrame_widget.bottom = 0;
        this.buttonsFrame_widget.updateAlignment();
    }


    private refreshSidePanels(w: number, h: number) {

        const sidePanelSize = 0.140 * w;

        const leftTransform = this.sidePanel_left.getComponent(UITransform);

        const rightTransform = this.sidePanel_right.getComponent(UITransform);

        leftTransform.setContentSize( sidePanelSize, h );

        rightTransform.setContentSize( sidePanelSize, h );

        this.sidePanel_left.setPosition( -w / 2 + sidePanelSize / 2, 0 );

        this.sidePanel_right.setPosition( w / 2 - sidePanelSize / 2, 0 );

        this.left_widget.left = 0;
        this.left_widget.updateAlignment();

        this.right_widget.right = 0;
        this.right_widget.updateAlignment();

        const leftStickX = this.sidePanel_left.position.x + sidePanelSize / 2;

        const rightStickX = this.sidePanel_right.position.x - sidePanelSize / 2;

        if(this.sideStick_left) {
            this.sideStick_left.setPosition(
                leftStickX,
                0,
                this.sideStick_left.position.z
            );
        }

        if(this.sideStick_right) {
            this.sideStick_right.setPosition(
                rightStickX,
                0,
                this.sideStick_right.position.z
            );
        }
    }


    private updateButtonsAdaptivity() {
        for(let i = 0; i < this.buttonsUi.length; i++) {
            this.buttonsUi[i].refreshAdaptivity();
        }
    }
}
