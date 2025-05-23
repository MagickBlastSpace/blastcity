import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventBattlepassAdaptive')
export class UIEventBattlepassAdaptive extends UIAdaptivityBase {

    @property(Node)
    banner: Node = null;
    @property(Node)
    progress: Node = null;
    @property(Node)
    panel: Node = null;
    @property(Node)
    caption: Node = null;
    @property(Node)
    scroll: Node = null;
    @property(Node)
    safe: Node = null;

    @property(Node)
    btnInfo: Node = null;
    @property(Node)
    btnClose: Node = null;
    @property(Node)
    btnActivate: Node = null;
    @property(Node)
    progressBar: Node = null;
    @property(Node)
    captionLeft: Node = null;
    @property(Node)
    captionRight: Node = null;

    @property(Widget)
    progress_Widget: Widget = null;
    @property(Widget)
    panel_Widget: Widget = null;
    @property(Widget)
    scroll_Widget: Widget = null;
    @property(Widget)
    caption_Widget: Widget = null;

    @property(Widget)
    btnInfo_Widget: Widget = null;
    @property(Widget)
    btnClose_Widget: Widget = null;
    @property(Widget)
    btnActivate_Widget: Widget = null;
    @property(Widget)
    progressBar_Widget: Widget = null;
    @property(Widget)
    captionLeft_Widget: Widget = null;
    @property(Widget)
    captionRight_Widget: Widget = null;

    private items: UIAdaptivityBase[] = [];

    private basic_Safe_Size: number = 1508;
    private basic_ProgressBar_Size: number = 570;
    private basic_BtnClose_Size: number = 200;
    private basic_BtnInfo_Size: number = 140;
    private basic_BtnActivate_Size: number = 500;

    
    refresh() {
        const visibleSize = view.getVisibleSize();
    
        let w = visibleSize.width;
        let h = visibleSize.height;
    
        if (w > h) {
            w = w / 3.5;

            const x = 0.3094 * w;

            const banner_H = 2.169 * x;
            this.banner.getComponent(UITransform).setContentSize(new Size(w, banner_H));

            const prgoress_H = 0.656 * x;
            this.progress.getComponent(UITransform).setContentSize(new Size(w, prgoress_H));

            const panel_H = 0.509 * x;
            this.panel.getComponent(UITransform).setContentSize(new Size(w, panel_H));

            const uiTransform = this.scroll.getComponent(UITransform);
            const currentSize = uiTransform.contentSize;
            uiTransform.setContentSize(new Size(w, currentSize.height));

            const caption_H = 0.301 * x;
            const caption_W = 2.8142 * x;
            this.caption.getComponent(UITransform).setContentSize(new Size(caption_W, caption_H));

            this.progress_Widget.top = banner_H;
            this.panel_Widget.top = banner_H + prgoress_H;
            this.scroll_Widget.top = banner_H + prgoress_H + panel_H;
            this.scroll_Widget.bottom = 0;

            const safeScale = w / this.basic_Safe_Size;
            this.safe.setScale(new Vec3(safeScale, safeScale, 1));

            const paddingSide = 0.21 * x;
            
            const btn_Info_Size = 0.273 * x;
            const btn_Info_Scale = btn_Info_Size / this.basic_BtnInfo_Size;
            const btn_Info_Padding_Top = 0.301 * x;
            this.btnInfo.setScale(new Vec3(btn_Info_Scale, btn_Info_Scale, 1));
            this.btnInfo_Widget.top = btn_Info_Padding_Top;
            this.btnInfo_Widget.left = paddingSide;

            const btn_Close_Size = 0.383 * x;
            const btn_Close_Scale = btn_Close_Size / this.basic_BtnClose_Size;
            const btn_Close_Padding_Top = 0.421 * x;
            this.btnClose.setScale(new Vec3(btn_Close_Scale, btn_Close_Scale, 1));
            this.btnClose_Widget.top = btn_Close_Padding_Top;
            this.btnClose_Widget.right = paddingSide;

            const btnActivateScale = x / this.basic_BtnActivate_Size;
            this.btnActivate.setScale(new Vec3(btnActivateScale, btnActivateScale, 1));
            this.btnActivate_Widget.right = paddingSide;

            const progressBarScale = x / this.basic_ProgressBar_Size;
            this.progressBar.setScale(new Vec3(progressBarScale, progressBarScale, 1));
            this.progressBar_Widget.left = paddingSide;

            this.captionLeft.setScale(new Vec3(btnActivateScale, btnActivateScale, 1));
            this.captionLeft_Widget.left = paddingSide;

            this.captionRight.setScale(new Vec3(btnActivateScale, btnActivateScale, 1));
            this.captionRight_Widget.right = paddingSide;

            this.caption_Widget.top = -0.2 * x;

        } else {
            const x = 0.3094 * w;

            const banner_H = 2.169 * x;
            this.banner.getComponent(UITransform).setContentSize(new Size(w, banner_H));

            const prgoress_H = 0.656 * x;
            this.progress.getComponent(UITransform).setContentSize(new Size(w, prgoress_H));

            const panel_H = 0.509 * x;
            this.panel.getComponent(UITransform).setContentSize(new Size(w, panel_H));

            const uiTransform = this.scroll.getComponent(UITransform);
            const currentSize = uiTransform.contentSize;
            uiTransform.setContentSize(new Size(w, currentSize.height));

            const caption_H = 0.301 * x;
            const caption_W = 2.8142 * x;
            this.caption.getComponent(UITransform).setContentSize(new Size(caption_W, caption_H));

            this.progress_Widget.top = banner_H;
            this.panel_Widget.top = banner_H + prgoress_H;
            this.scroll_Widget.top = banner_H + prgoress_H + panel_H;
            this.scroll_Widget.bottom = 0;

            const safeScale = w / this.basic_Safe_Size;
            this.safe.setScale(new Vec3(safeScale, safeScale, 1));

            const paddingSide = 0.21 * x;
            
            const btn_Info_Size = 0.273 * x;
            const btn_Info_Padding_Top = 0.301 * x;
            this.btnInfo.getComponent(UITransform).setContentSize(new Size(btn_Info_Size, btn_Info_Size));
            this.btnInfo_Widget.top = btn_Info_Padding_Top;
            this.btnInfo_Widget.left = paddingSide;

            const btn_Close_Size = 0.383 * x;
            const btn_Close_Padding_Top = 0.421 * x;
            this.btnClose.getComponent(UITransform).setContentSize(new Size(btn_Close_Size, btn_Close_Size));
            this.btnClose_Widget.top = btn_Close_Padding_Top;
            this.btnClose_Widget.right = paddingSide;

            const btn_Activate_H = 0.328 * x;
            const btn_Activate_W = x;
            this.btnActivate.getComponent(UITransform).setContentSize(new Size(btn_Activate_W, btn_Activate_H));
            this.btnActivate_Widget.right = paddingSide;

            const progressBarScale = x / this.basic_ProgressBar_Size;
            this.progressBar.setScale(new Vec3(progressBarScale, progressBarScale, 1));
            this.progressBar_Widget.left = paddingSide;

            const captionLeft_H = 0.328 * x;
            const captionLeft_W = x;
            this.captionLeft.getComponent(UITransform).setContentSize(new Size(captionLeft_W, captionLeft_H));
            this.captionLeft_Widget.left = paddingSide;

            const captionRight_H = 0.328 * x;
            const captionRight_W = x;
            this.captionRight.getComponent(UITransform).setContentSize(new Size(captionRight_W, captionRight_H));
            this.captionRight_Widget.right = paddingSide;

            this.caption_Widget.top = -0.2 * x;
        }

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].refresh();
        }
    }


    addAdaptiveItem(item: UIAdaptivityBase) {
        this.items.push(item);
    }
}


