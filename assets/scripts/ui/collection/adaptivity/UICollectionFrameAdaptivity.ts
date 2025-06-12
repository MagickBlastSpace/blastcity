import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size, Mask } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('UICollectionFrameAdaptivity')
export class UICollectionFrameAdaptivity extends UIAdaptivityBase {

    @property(Node)
    header: Node = null;
    @property(Node)
    banner: Node = null;
    @property(Node)
    progressContainer: Node = null;
    @property(Node)
    scroll: Node = null;

    @property(Widget)
    header_Widget: Widget = null;
    @property(Widget)
    progress_Widget: Widget = null;
    @property(Widget)
    scroll_Widget: Widget = null;

    private basic_header_H: number = 153;
    private basic_banner_H: number = 642;
    private basic_progress_H: number = 620;

    private mobileScaleMul: number = 0.5;


    refresh() {
        const visibleSize = view.getVisibleSize();
    
        let w = visibleSize.width;
        let h = visibleSize.height;

        if (w > h) {
            const ratio = w / h;
            if(ratio > 1.5) {
                this.makeDesktopVariation(w, h);
            }
            else {
                this.makeTabletVariation(w, h);
            }
        } else {
            this.makeMobileVariation(w, h);
        }
    }

    makeDesktopVariation(w: number, h: number) {
        
    }

    makeTabletVariation(w: number, h: number) {
        
    }

    makeMobileVariation(w: number, h: number) {
        const x = 0.30626 * w * this.mobileScaleMul;

        const banner_H = 1.3425 * x;
        const banner_Scale = banner_H / this.basic_banner_H;

        this.banner.setScale(new Vec3(banner_Scale, banner_Scale, 1));

        const header_H = 0.3315 * x;
        const header_Scale = header_H / this.basic_header_H;

        this.header.setScale(new Vec3(header_Scale, header_Scale, 1));

        const progress_H = 1.3425 * x;
        const progress_Scale = progress_H / this.basic_progress_H;

        this.progressContainer.setScale(new Vec3(progress_Scale, progress_Scale, 1));

        /*const scroll_H = h * this.mobileScaleMul - banner_H - progress_H;
        const scroll_W = w * this.mobileScaleMul;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scroll_W, scroll_H));*/

        const headerPadding = (1.3425 - 0.165) * x;

        this.header_Widget.top = headerPadding;

        const progressPadding = 1.3425 * x;

        this.progress_Widget.top = progressPadding;

        const scrollPadding = 1.3425 * x + progress_H;
        const scrollPadding_bottom = 0.3 * x;

        this.scroll_Widget.top = scrollPadding;
        this.scroll_Widget.bottom = scrollPadding_bottom;
    }
}


