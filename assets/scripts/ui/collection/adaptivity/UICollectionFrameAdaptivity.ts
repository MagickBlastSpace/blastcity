import { _decorator,  Node, Layout, Widget, view, Vec3, Sprite, SpriteFrame } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
import { UICollectionItemAdaptivity } from './UICollectionItemAdaptivity';
const { ccclass, property } = _decorator;

@ccclass('UICollectionFrameAdaptivity')
export class UICollectionFrameAdaptivity extends UIAdaptivityBase {

    @property(Sprite)
    bannerImg: Sprite = null;

    @property(SpriteFrame)
    bannerPortrait: SpriteFrame = null;
    @property(SpriteFrame)
    bannerLandscape: SpriteFrame = null;

    @property(Node)
    header: Node = null;
    @property(Node)
    banner: Node = null;
    @property(Node)
    progressContainer: Node = null;
    @property(Node)
    progressRight: Node = null;
    @property(Node)
    progressLeft: Node = null;
    @property(Node)
    scroll: Node = null;

    @property(Node)
    btnInfo: Node = null;
    @property(Node)
    btnChest: Node = null;

    @property(Widget)
    header_Widget: Widget = null;
    @property(Widget)
    progress_Widget: Widget = null;
    @property(Widget)
    scroll_Widget: Widget = null;
    @property(Widget)
    banner_Widget: Widget = null;

    @property(Layout)
    layout: Layout = null;

    @property([UICollectionItemAdaptivity])
    items: UICollectionItemAdaptivity[] = [];

    @property([Node])
    landscapeNodes: Node[] = [];

    @property([Node])
    popups: Node[] = [];

    private basic_header_H: number = 153;
    private basic_banner_H: number = 642;
    private basic_progress_H: number = 620;

    private basic_btnInfo_size: number = 127;
    private basic_btnChest_size: number = 176;

    private basic_progress_right_W: number = 1212;
    private basic_progress_left_W: number = 1184;
    private basic_progress_left_W_ls: number = 1857;

    private basic_popup_Size: number = 1452;

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

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].refresh();
        }
    }

    makeDesktopVariation(w: number, h: number) {

        const rootWidget = this.node.getComponent(Widget);

        if(rootWidget) {
            rootWidget.left = 0;
            rootWidget.right = 0;
            rootWidget.updateAlignment();
        }

        this.bannerImg.spriteFrame = this.bannerLandscape;

        for(let i = 0; i < this.landscapeNodes.length; i++) {
            this.landscapeNodes[i].active = true;
        }

        const x = 0.1294 * h;

        const banner_H = 1.5 * x;
        const banner_Scale = banner_H / this.basic_banner_H;

        this.banner.setScale(new Vec3(banner_Scale, banner_Scale, 1));

        const header_H = 0.4615 * x;
        const header_Scale = header_H / this.basic_header_H;

        this.header.setScale(new Vec3(header_Scale, header_Scale, 1));

        const progress_H = 1.5 * x;
        const progress_Scale = progress_H / this.basic_progress_H;

        this.progressContainer.setScale(new Vec3(progress_Scale, progress_Scale, 1));

        let progress_r_W = 2.6635 * x;
        const progressRight_Scale = progress_r_W / this.basic_progress_right_W;

        this.progressRight.setScale(new Vec3(progressRight_Scale / progress_Scale, progressRight_Scale / progress_Scale, 1));

        let progress_l_W = 4.0829 * x;
        const progressLeft_Scale = progress_l_W / this.basic_progress_left_W_ls;

        this.progressLeft.setScale(new Vec3(progressLeft_Scale / progress_Scale, progressLeft_Scale / progress_Scale, 1));

        const spacingX = 1250;

        const halfWidthL = (progress_l_W / 2);
        const halfWidthR = (progress_r_W / 2);

        const totalWidth = halfWidthL + halfWidthR + spacingX;

        this.progressLeft.setPosition(new Vec3(-totalWidth / 2 + halfWidthL, 0, 0));
        this.progressRight.setPosition(new Vec3(totalWidth / 2 - halfWidthR, 0, 0));

        const headerPadding = (1.5 - 0.23) * x;

        this.header_Widget.top = headerPadding;

        const progressPadding = banner_H;

        let sidePadding = 0.14 * w;

        this.progress_Widget.top = progressPadding;
        this.progress_Widget.left = sidePadding;
        this.progress_Widget.right = sidePadding;

        const scrollPadding = banner_H + progress_H;
        let scrollSidePadding = (w - 6.8 * x) / 2;

        this.scroll_Widget.top = scrollPadding;
        this.scroll_Widget.bottom = 0;
        this.scroll_Widget.left = scrollSidePadding;
        this.scroll_Widget.right = scrollSidePadding;

        let layoutSpacingX = -0.12 * x;
        const layoutSpacingY = 0.4 * x;
        //const scrollSidePadding = 0.4 * x;
        
        const containerWidth = w - scrollSidePadding * 2;
        //let scrollSidePadding = (containerWidth - 7 * x) / 2;
        const columns = 5;
        const itemWidth = 1.2692 * x;

        const safetyMargin = 0.05 * itemWidth * columns;

        //layoutSpacingX = (containerWidth - itemWidth * columns - safetyMargin - scrollSidePadding * 2) / (columns - 1);
        layoutSpacingX = (containerWidth - itemWidth * columns - safetyMargin) / (columns - 1);

        this.layout.spacingX = layoutSpacingX;
        this.layout.spacingY = layoutSpacingY;
        //this.layout.paddingLeft = scrollSidePadding;
        //this.layout.paddingRight = scrollSidePadding;
        this.layout.paddingTop = 0.3 * x;
        this.layout.paddingBottom = 1.5 * x;
        this.layout.updateLayout();

        this.banner_Widget.left = sidePadding;
        this.banner_Widget.right = sidePadding;

        let btnInfo_size = 0.5192 * x;
        const btnInfoScale = btnInfo_size / this.basic_btnInfo_size;

        this.btnInfo.setScale(new Vec3(btnInfoScale / banner_Scale, btnInfoScale / banner_Scale, 1));

        let btnChest_size = 0.5192 * x;
        const btnChestScale = btnChest_size / this.basic_btnChest_size;

        this.btnChest.setScale(new Vec3(btnChestScale / banner_Scale, btnChestScale / banner_Scale, 1));

        const popupScale = w / 4.5 / this.basic_popup_Size;
        //const popupScale = w / this.basic_popup_Size;
            for(let i = 0; i < this.popups.length; i++) {
            if(this.popups[i]) {
                this.popups[i].setScale(new Vec3(popupScale, popupScale, 1));
            }
        }
    }

    makeTabletVariation(w: number, h: number) {
        this.makeDesktopVariation(w, h);
    }

    makeMobileVariation(w: number, h: number) {
        const rootWidget = this.node.getComponent(Widget);

        if(rootWidget) {
            rootWidget.left = 0;
            rootWidget.right = 0;
            rootWidget.updateAlignment();
        }

        this.bannerImg.spriteFrame = this.bannerPortrait;

        for(let i = 0; i < this.landscapeNodes.length; i++) {
            this.landscapeNodes[i].active = false;
        }

        const x = 0.30626 * w;

        const banner_H = 1.3425 * x;
        const banner_Scale = banner_H / this.basic_banner_H;

        this.banner.setScale(new Vec3(banner_Scale, banner_Scale, 1));

        const header_H = 0.3315 * x;
        const header_Scale = header_H / this.basic_header_H;

        this.header.setScale(new Vec3(header_Scale, header_Scale, 1));

        const progress_H = 1.3425 * x;
        const progress_Scale = progress_H / this.basic_progress_H;

        this.progressContainer.setScale(new Vec3(progress_Scale, progress_Scale, 1));

        const progress_r_W = 3.1436 * x;
        const progressRight_Scale = progress_r_W / this.basic_progress_right_W;

        this.progressRight.setScale(new Vec3(progressRight_Scale / progress_Scale, progressRight_Scale / progress_Scale, 1));

        const progress_l_W = 2.5635 * x;
        const progressLeft_Scale = progress_l_W / this.basic_progress_left_W;

        this.progressLeft.setScale(new Vec3(progressLeft_Scale / progress_Scale, progressLeft_Scale / progress_Scale, 1));

        this.progressRight.setPosition(new Vec3(0, 72, 0));
        this.progressLeft.setPosition(new Vec3(0, -207, 0));

        const headerPadding = (1.3425 - 0.165) * x;

        this.header_Widget.top = headerPadding;

        const progressPadding = 1.3425 * x;

        this.progress_Widget.top = progressPadding;
        this.progress_Widget.left = 0;
        this.progress_Widget.right = 0;

        const scrollPadding = 1.3425 * x + progress_H;
        const scrollPadding_bottom = 0.3 * x;

        this.scroll_Widget.top = scrollPadding;
        this.scroll_Widget.bottom = scrollPadding_bottom;
        this.scroll_Widget.left = 0;
        this.scroll_Widget.right = 0;

        let layoutSpacingX = -0.12 * x;
        const layoutSpacingY = 0.3 * x;
        const scrollSidePadding = 0.04 * x;

        const containerWidth = w;
        const columns = 3;
        const itemWidth = x;

        const safetyMargin = 0.01 * itemWidth * columns;

        layoutSpacingX = (containerWidth - itemWidth * columns - scrollSidePadding * 2 - safetyMargin) / (columns - 1); 

        this.layout.spacingX = layoutSpacingX;
        //this.layout.spacingY = layoutSpacingX + 0.3 * x;
        this.layout.spacingY = layoutSpacingY;
        this.layout.paddingLeft = scrollSidePadding;
        this.layout.paddingRight = scrollSidePadding;
        this.layout.paddingTop = 0.3 * x;
        this.layout.paddingBottom = 1.1 * x;
        this.layout.updateLayout();

        this.banner_Widget.left = 0;
        this.banner_Widget.right = 0;

        let btnInfo_size = 0.2762 * x;
        const btnInfoScale = btnInfo_size / this.basic_btnInfo_size;

        this.btnInfo.setScale(new Vec3(btnInfoScale / banner_Scale, btnInfoScale / banner_Scale, 1));

        let btnChest_size = 0.4805 * x;
        const btnChestScale = btnChest_size / this.basic_btnChest_size;

        this.btnChest.setScale(new Vec3(btnChestScale / banner_Scale, btnChestScale / banner_Scale, 1));

        //const popupScale = 0.8 * w / this.basic_popup_Size * this.mobileScaleMul;
        const popupScale = 0.8 * w / this.basic_popup_Size;
        for(let i = 0; i < this.popups.length; i++) {
             if(this.popups[i]) {
                this.popups[i].setScale(new Vec3(popupScale, popupScale, 1));
             }
        }
    }


    addItem(item: UICollectionItemAdaptivity) {
        this.items.push(item);
    }
}


