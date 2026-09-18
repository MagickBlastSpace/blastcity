import { _decorator, Node, Layout, Widget, view, UITransform, Vec3, Size, ScrollView, director } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
import { UILeaderboardItemAdaptivity } from '../../leaderboard/adaptivity/UILeaderboardItemAdaptivity';

const { ccclass, property } = _decorator;

@ccclass('UIEventWeeklyContestAdaptivity')
export class UIEventWeeklyContestAdaptivity extends UIAdaptivityBase {

    @property(Node)
    banner: Node = null;

    @property(Node)
    scroll: Node = null;

    @property(Node)
    header: Node = null;

    @property(Node)
    btnInfo: Node = null;

    @property(Node)
    back_gold: Node = null;

    @property(Node)
    back_silver: Node = null;

    @property(Node)
    back_bronze: Node = null;

    @property([Node])
    prizeContents: Node[] = [];

    @property(Widget)
    banner_Widget: Widget = null;

    @property(Widget)
    scroll_Widget: Widget = null;

    @property(Layout)
    prizeLayout: Layout = null;

    @property([Node])
    popups: Node[] = [];

    private bottomNavigation: Node = null;

    private items: UILeaderboardItemAdaptivity[] = [];
    private postLayoutScheduled: boolean = false;

    private basic_prize_layout_size: number = 1452;
    private basic_header_size: number = 1224;
    private basic_info_size: number = 107;
    private basic_popup_Size: number = 1452;

    private basicPrizeLayoutBottom: number = 10;

    private mobileScaleMul: number = 0.5;
    private tabletScaleMul: number = 0.71;

    private basic_prize_layout_width: number = 1452;
    private basic_prize_layout_height: number = 700;

    private basic_gold_size: Size = new Size(474, 664);
    private basic_silver_size: Size = new Size(474, 598);
    private basic_bronze_size: Size = new Size(474, 554);

    private basic_prize_spacing: number = 15;


    refresh() {
        const visibleSize = view.getVisibleSize();

        const w = visibleSize.width;
        const h = visibleSize.height;
        const ratio = w / h;

        if(ratio < 0.7) {
            this.makeMobileVariation(w, h);
        }
        else if(ratio < 1.5) {
            this.makeTabletVariation(w, h);
        }
        else {
            this.makeDesktopVariation(w, h);
        }

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].refresh();
        }

        if(this.postLayoutScheduled) {
            return;
        }

        this.postLayoutScheduled = true;

        this.scheduleOnce(() => {
            this.postLayoutScheduled = false;

            if(!this.node.activeInHierarchy) {
                return;
            }

            const currentSize = view.getVisibleSize();

            const currentW = currentSize.width;
            const currentH = currentSize.height;
            const currentRatio = currentW / currentH;

            if(currentRatio < 1.5) {
                this.fitScrollToBottomNavigation();
            }

            if(this.scroll_Widget) {
                this.scroll_Widget.updateAlignment();
            }

            const scrollView = this.scroll.getComponent(ScrollView);
            const content = scrollView ? scrollView.content : null;
            const viewNode = content ? content.parent : null;
            const viewWidget = viewNode ? viewNode.getComponent(Widget) : null;

            if(viewWidget) {
                viewWidget.updateAlignment();
            }

            this.refreshScrollLayout();

        }, 0);
    }


    addItem(item: UILeaderboardItemAdaptivity) {
        this.items.push(item);
    }

    private getBottomNavigation(): Node {
        if(this.bottomNavigation) {
            return this.bottomNavigation;
        }

        const scene = director.getScene();

        if(!scene) {
            return null;
        }

        this.bottomNavigation = this.findNodeByName(scene, "MainMenuButtonsPanel");

        return this.bottomNavigation;
    }


    private findNodeByName(root: Node, name: string): Node {
        if(root.name === name) {
            return root;
        }

        for(let i = 0; i < root.children.length; i++) {
            const found = this.findNodeByName(root.children[i], name);

            if(found) {
                return found;
            }
        }

        return null;
    }

    private restoreBasePodiumGeometry() {
        const prizeLayoutTransform = this.prizeLayout.node.getComponent(UITransform);

        if (prizeLayoutTransform) {
            prizeLayoutTransform.setContentSize(
                new Size(this.basic_prize_layout_width, this.basic_prize_layout_height)
            );
        }

        this.back_gold.getComponent(UITransform).setContentSize(this.basic_gold_size);
        this.back_silver.getComponent(UITransform).setContentSize(this.basic_silver_size);
        this.back_bronze.getComponent(UITransform).setContentSize(this.basic_bronze_size);

        this.prizeLayout.spacingX = this.basic_prize_spacing;
        this.prizeLayout.updateLayout();
    }

    private applyUnifiedPodium(
        targetWidth: number,
        bottom: number,
        visualSpacing: number = 15
    ) {
        this.restoreBasePodiumGeometry();

        const prizeLayoutWidget = this.prizeLayout.node.getComponent(Widget);

        const layoutScale = targetWidth / this.basic_prize_layout_width;
        this.prizeLayout.node.setScale(new Vec3(layoutScale, layoutScale, 1));

        this.prizeLayout.spacingX = visualSpacing / layoutScale;
        this.prizeLayout.updateLayout();

        if (prizeLayoutWidget) {
            prizeLayoutWidget.bottom = bottom;
            prizeLayoutWidget.updateAlignment();
        }
    }


    private fitScrollToBottomNavigation() {
        const bottomNavigation = this.getBottomNavigation();

        if(!this.scroll || !bottomNavigation) {
            return;
        }

        const scrollTransform = this.scroll.getComponent(UITransform);
        const navigationTransform = bottomNavigation.getComponent(UITransform);

        if(!scrollTransform || !navigationTransform) {
            return;
        }

        const scrollScaleY = this.scroll.worldScale.y;
        const navigationScaleY = bottomNavigation.worldScale.y;

        if(scrollScaleY === 0) {
            return;
        }

        const scrollTopWorld = this.scroll.worldPosition.y + scrollTransform.height * scrollScaleY * (1 - scrollTransform.anchorY);
        const navigationTopWorld = bottomNavigation.worldPosition.y + navigationTransform.height * navigationScaleY * (1 - navigationTransform.anchorY);

        const availableWorldHeight = scrollTopWorld - navigationTopWorld;

        if(availableWorldHeight <= 0) {
            return;
        }

        const availableLocalHeight = availableWorldHeight / scrollScaleY;

        scrollTransform.setContentSize(scrollTransform.width, availableLocalHeight);
    }


    private refreshScrollLayout() {
        const scrollView = this.scroll.getComponent(ScrollView);

        if(!scrollView || !scrollView.content) {
            return;
        }

        const content = scrollView.content;
        const layout = content.getComponent(Layout);

        if(layout) {
            layout.affectedByScale = true;
            layout.updateLayout();
        }

        scrollView.stopAutoScroll();
        scrollView.scrollToTop(0);

        this.scheduleOnce(() => {
            if(!this.node.activeInHierarchy) {
                return;
            }

            if(layout) {
                layout.updateLayout();
            }

            scrollView.scrollToTop(0);

        }, 0);
    }


    makeMobileVariation(w: number, h: number) {
        const x = 0.262 * w * this.mobileScaleMul;

        const bannerH = 2.276 * x;
        const bannerW = 3.596 * x;
        this.banner.getComponent(UITransform).setContentSize(new Size(bannerW, bannerH));

        const bannerPaddingTop = (1.468 + 0.16) * x;
        this.banner_Widget.top = bannerPaddingTop;

        const scrollH = h - (1.468 + 0.16 + 2.276 + 0.064 + 0.8526 + 0.5769) * x;
        const scrollW = 3.436 * x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scrollW, scrollH));

        const scrollPaddingTop = (1.468 + 0.16 + 2.276) * x;
        this.scroll_Widget.top = scrollPaddingTop;

        this.applyUnifiedPodium(bannerW * 0.92, this.basicPrizeLayoutBottom);

        const headerSize = 2.1667 * x;
        const headerScale = headerSize / this.basic_header_size;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const infoSize = 0.192 * x;
        const infoScale = infoSize / this.basic_info_size;
        this.btnInfo.setScale(new Vec3(infoScale, infoScale, 1));

        const popupScale = 0.8 * w / this.basic_popup_Size;

        for (let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(popupScale, popupScale, 1));
        }
    }


    makeDesktopVariation(w: number, h: number) {
        const x = 0.125 * h;

        const bannerH = h - (1.92 + 1.15 + 2 + 0.62) * x;
        const bannerW = 7.52 * x;
        this.banner.getComponent(UITransform).setContentSize(new Size(bannerW, bannerH));

        const bannerPaddingTop = (2 + 0.62) * x;
        this.banner_Widget.top = bannerPaddingTop;

        const scrollH = 2.42 * x;
        const scrollW = 7.52 * x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scrollW, scrollH));

        const scrollPaddingTop = bannerPaddingTop + bannerH;
        this.scroll_Widget.top = scrollPaddingTop;

        this.applyUnifiedPodium(bannerW * 0.5, -0.11 * x, 43);

        const headerSize = 2.15 * x;
        const headerScale = headerSize / this.basic_header_size;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const infoSize = 0.27 * x;
        const infoScale = infoSize / this.basic_info_size;
        this.btnInfo.setScale(new Vec3(infoScale, infoScale, 1));

        const popupScale = w / 4.5 / this.basic_popup_Size;

        for (let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(popupScale, popupScale, 1));
        }
    }


    makeTabletVariation(w: number, h: number) {
        const x = 0.140 * w * this.tabletScaleMul;

        const tabletBannerHeight = 1.60 * x;
        const bannerW = 5.0133 * x;
        this.banner.getComponent(UITransform).setContentSize(new Size(bannerW, tabletBannerHeight));

        const bannerPaddingTop = 1.427 * x;
        this.banner_Widget.top = bannerPaddingTop;

        const scrollH = h - (1.427 + 0.033 + 1.60 + 0.3) * x;
        const scrollW = 5.0133 * x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scrollW, scrollH));

        const scrollPaddingTop = (1.427 + 1.60) * x;
        this.scroll_Widget.top = scrollPaddingTop;

        this.applyUnifiedPodium(bannerW * 0.5, -0.11 * x, 28);

        const headerSize = 2.20 * x;
        const headerScale = headerSize / this.basic_header_size;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const infoSize = 0.18 * x;
        const infoScale = infoSize / this.basic_info_size;
        this.btnInfo.setScale(new Vec3(infoScale, infoScale, 1));

        const popupScale = w / 4.5 / this.basic_popup_Size;

        for (let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(popupScale, popupScale, 1));
        }
    }
}
