import { _decorator, Component, Node, SpriteFrame, Sprite, Widget, view, UITransform, Size, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenuButton')
export class UIMainMenuButton extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    active: SpriteFrame = null;

    @property(SpriteFrame)
    passive: SpriteFrame = null;

    @property(Node)
    activeNode: Node = null;

    @property(Node)
    passiveNode: Node = null;

    @property(Node)
    picture_passive: Node = null;

    @property(Node)
    picture_active: Node = null;

    @property(Widget)
    widget: Widget = null;

    @property(Widget)
    labelWidget: Widget = null;

    @property(Widget)
    iconWidget: Widget = null;

    @property(Widget)
    iconWidget_Active: Widget = null;

    @property
    isMain: boolean = false;

    private isActive: boolean = false;

    private basic_icon_width_passive_main: number = 232;
    private basic_icon_width_active_main: number = 291;

    private basic_icon_width_passive: number = 232;
    private basic_icon_width_active: number = 291;

    private basicPanelHeight: number = 300;
    private tabletScaleMul: number = 0.75;


    setActiveIcon(isActive: boolean) {
        this.isActive = isActive;

        this.icon.spriteFrame = isActive ? this.active : this.passive;

        this.activeNode.active = isActive;
        this.passiveNode.active = !isActive;
    }


    refreshAdaptivity() {
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

        this.refreshNavigationPanel(ratio);
    }


    private makeMobileVariation(w: number) {
        const x = 0.1607 * w;

        this.applyPortraitVariation(x);
    }


    private makeTabletVariation(w: number) {
        const x = 0.1607 * w * this.tabletScaleMul;

        this.applyPortraitVariation(x);
    }


    private makeDesktopVariation(h: number) {
        const x = 0.0896 * h;

        const container_w = this.isActive ? 2.5833 * x : 1.25 * x;
        const container_h = x;

        this.icon.node.getComponent(UITransform).setContentSize(new Size(container_w, container_h));

        this.widget.bottom = 0;
        this.widget.updateAlignment();

        const pictureScale_Active = this.isMain ? 0.9444 * x / this.basic_icon_width_active_main : 0.7361 * x / this.basic_icon_width_active;
        const pictureScale_Passive = this.isMain ? 0.6944 * x / this.basic_icon_width_passive_main : 0.6944 * x / this.basic_icon_width_passive;

        this.picture_active.setScale(new Vec3(pictureScale_Active, pictureScale_Active, 1));
        this.picture_passive.setScale(new Vec3(pictureScale_Passive, pictureScale_Passive, 1));

        this.labelWidget.bottom = 0.25 * x;
        this.labelWidget.updateAlignment();

        this.iconWidget.bottom = 0.25 * x;
        this.iconWidget.updateAlignment();

        this.iconWidget_Active.bottom = 0.5 * x;
        this.iconWidget_Active.updateAlignment();
    }


    private applyPortraitVariation(x: number) {
        const container_w = this.isActive ? 2.0632 * x : x;
        const container_h = 1.2316 * x;

        this.icon.node.getComponent(UITransform).setContentSize(new Size(container_w, container_h));

        this.widget.bottom = 0;
        this.widget.updateAlignment();

        const pictureScale_Active = this.isMain ? 1.1684 * x / this.basic_icon_width_active_main : 0.9053 * x / this.basic_icon_width_active;
        const pictureScale_Passive = this.isMain ? 0.8632 * x / this.basic_icon_width_passive_main : 0.8632 * x / this.basic_icon_width_passive;

        this.picture_active.setScale(new Vec3(pictureScale_Active, pictureScale_Active, 1));
        this.picture_passive.setScale(new Vec3(pictureScale_Passive, pictureScale_Passive, 1));

        this.labelWidget.bottom = 0.3684 * x;
        this.labelWidget.updateAlignment();

        this.iconWidget.bottom = 0.3158 * x;
        this.iconWidget.updateAlignment();

        this.iconWidget_Active.bottom = 0.66 * x;
        this.iconWidget_Active.updateAlignment();
    }


    private refreshNavigationPanel(ratio: number) {
        const panel = this.findParentByName(this.node, "MainMenuButtonsPanel");

        if(!panel) {
            return;
        }

        const transform = panel.getComponent(UITransform);

        if(!transform) {
            return;
        }

        const height = ratio >= 0.7 && ratio < 1.5 ? this.basicPanelHeight * this.tabletScaleMul : this.basicPanelHeight;

        transform.setContentSize(transform.width, height);
    }


    private findParentByName(node: Node, name: string): Node {
        let current = node.parent;

        while(current) {
            if(current.name === name) {
                return current;
            }

            current = current.parent;
        }

        return null;
    }
}