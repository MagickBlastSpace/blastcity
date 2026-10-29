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
    mainBtnsFrame: Node = null;

    @property(Widget)
    left_widget: Widget = null;

    @property(Widget)
    right_widget: Widget = null;

    refresh() {
        const visibleSize = view.getVisibleSize();
        const w = visibleSize.width;
        const h = visibleSize.height;

        if(w > h) {
            this.refreshSidePanels(w, h);

            if(this.sideStick_left) this.sideStick_left.active = true;
            if(this.sideStick_right) this.sideStick_right.active = true;
        }
        else {
            if(this.sideStick_left) this.sideStick_left.active = false;
            if(this.sideStick_right) this.sideStick_right.active = false;

            this.refreshMainBtnsFrameMobile();
        }

        this.updateButtonsAdaptivity();

        this.refreshMainBtnsFrameHeight();
    }

    private refreshMainBtnsFrameHeight() {
        if(!this.mainBtnsFrame?.parent) return;

        const frameTransform = this.mainBtnsFrame.getComponent(UITransform);
        const parentTransform = this.mainBtnsFrame.parent.getComponent(UITransform);

        if(!frameTransform || !parentTransform) return;

        const parentBottom = -parentTransform.height * parentTransform.anchorY;

        let maxTop = parentBottom;
        let found = false;

        for(const button of this.buttonsUi) {
            if(!button?.node.activeInHierarchy || !button.icon?.node.activeInHierarchy) continue;

            const iconTransform = button.icon.node.getComponent(UITransform);
            if(!iconTransform) continue;

            const topY = iconTransform.height * (1 - iconTransform.anchorY);
            const leftX = -iconTransform.width * iconTransform.anchorX;
            const rightX = iconTransform.width * (1 - iconTransform.anchorX);

            const leftWorld = iconTransform.convertToWorldSpaceAR( new Vec3(leftX, topY, 0) );
            const rightWorld = iconTransform.convertToWorldSpaceAR( new Vec3(rightX, topY, 0) );

            const leftLocal = parentTransform.convertToNodeSpaceAR(leftWorld);
            const rightLocal = parentTransform.convertToNodeSpaceAR(rightWorld);

            maxTop = Math.max( maxTop, leftLocal.y, rightLocal.y );
            found = true;
        }

        if(!found) return;

        const paddingTop = 12;
        const requiredHeight = Math.max( 0, maxTop - parentBottom + paddingTop );

        const height = requiredHeight / Math.abs(this.mainBtnsFrame.scale.y || 1);

        frameTransform.setContentSize( frameTransform.width, height );

        const frameWidget = this.mainBtnsFrame.getComponent(Widget);
        frameWidget?.updateAlignment();
    }

    private refreshMainBtnsFrameMobile() {
        if(!this.mainBtnsFrame) {
            return;
        }

        const frameTransform = this.mainBtnsFrame.getComponent(UITransform);
        const parentTransform = this.mainBtnsFrame.parent?.getComponent(UITransform);

        if(!frameTransform || !parentTransform) {
            return;
        }

        frameTransform.setContentSize( parentTransform.width, frameTransform.height );
        this.mainBtnsFrame.setPosition( 0, this.mainBtnsFrame.position.y, this.mainBtnsFrame.position.z );
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

        if(this.sideStick_left?.parent) {
            const stickParent = this.sideStick_left.parent.getComponent(UITransform);

            if(stickParent) {
                const worldPos = leftTransform.convertToWorldSpaceAR( new Vec3(leftTransform.width / 2, 0, 0) );
                const localPos = stickParent.convertToNodeSpaceAR( worldPos );

                this.sideStick_left.setPosition( localPos.x, localPos.y, this.sideStick_left.position.z );
            }
        }

        if(this.sideStick_right?.parent) {
            const stickParent = this.sideStick_right.parent.getComponent(UITransform);

            if(stickParent) {
                const worldPos = rightTransform.convertToWorldSpaceAR( new Vec3(-rightTransform.width / 2, 0, 0) );
                const localPos = stickParent.convertToNodeSpaceAR( worldPos );

                this.sideStick_right.setPosition( localPos.x, localPos.y, this.sideStick_right.position.z );
            }
        }

        if(this.mainBtnsFrame && this.sidePanel_left && this.sidePanel_right) {

            const frameTransform = this.mainBtnsFrame.getComponent(UITransform);
            const parentTransform = this.mainBtnsFrame.parent?.getComponent(UITransform);

            if(frameTransform && parentTransform) {

                const leftWorld = leftTransform.convertToWorldSpaceAR( new Vec3(leftTransform.width / 2, 0, 0) );
                const rightWorld = rightTransform.convertToWorldSpaceAR( new Vec3(-rightTransform.width / 2, 0, 0) );

                const leftLocal = parentTransform.convertToNodeSpaceAR( leftWorld );
                const rightLocal = parentTransform.convertToNodeSpaceAR( rightWorld );

                const width = Math.max( 0, rightLocal.x - leftLocal.x );
                const centerX = (leftLocal.x + rightLocal.x) / 2;

                frameTransform.setContentSize( width, frameTransform.height );
                this.mainBtnsFrame.setPosition( centerX, this.mainBtnsFrame.position.y, this.mainBtnsFrame.position.z );
            }
        }

        this.refreshSideSticksOrder();
    }

    private refreshSideSticksOrder() {
        if(this.sideStick_left?.parent) {
            this.sideStick_left.setSiblingIndex(this.sideStick_left.parent.children.length - 1);
        }

        if(this.sideStick_right?.parent) {
            this.sideStick_right.setSiblingIndex(this.sideStick_right.parent.children.length - 1);
        }
    }

    private updateButtonsAdaptivity() {
        for(let i = 0; i < this.buttonsUi.length; i++) {
            this.buttonsUi[i].refreshAdaptivity();
        }
    }
}
