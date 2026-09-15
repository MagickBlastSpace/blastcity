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
    private basic_prize_layout_size_H: number = 700;
    private basic_header_size: number = 1224;
    private basic_info_size: number = 107;
    private basic_popup_Size: number = 1452;

    private mobileScaleMul: number = 0.5;
    private tabletScaleMul: number = 0.71;


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

        const banner_H = 2.276 * x;
        const banner_W = 3.596 * x;
        this.banner.getComponent(UITransform).setContentSize(new Size(banner_W, banner_H));

        const back_prize_W = 1.0256 * x;

        const back_gold_H = 1.481 * x;
        this.back_gold.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_gold_H));

        const back_silver_H = 1.327 * x;
        this.back_silver.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_silver_H));

        const back_bronze_H = 1.212 * x;
        this.back_bronze.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_bronze_H));

        const bannerPaddingTop = (1.468 + 0.16) * x;
        this.banner_Widget.top = bannerPaddingTop;

        const scroll_H = h - (1.468 + 0.16 + 2.276 + 0.064 + 0.8526 + 0.5769) * x;
        const scroll_W = 3.436 * x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scroll_W, scroll_H));

        const scrollPaddingTop = (1.468 + 0.16 + 2.276) * x;
        this.scroll_Widget.top = scrollPaddingTop;

        const layoutSize = 3.244 * x;
        const layoutScale = layoutSize / this.basic_prize_layout_size;
        this.prizeLayout.node.setScale(new Vec3(layoutScale, layoutScale, 1));

        const headerSize = 2.1667 * x;
        const headerScale = headerSize / this.basic_header_size;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const infoSize = 0.192 * x;
        const infoScale = infoSize / this.basic_info_size;
        this.btnInfo.setScale(new Vec3(infoScale, infoScale, 1));

        const prizeLayoutSpacing = 0.0962 * x;
        this.prizeLayout.spacingX = prizeLayoutSpacing;
        this.prizeLayout.updateLayout();

        const popupScale = 0.8 * w / this.basic_popup_Size;

        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(popupScale, popupScale, 1));
        }
    }


    makeDesktopVariation(w: number, h: number) {
        const x = 0.125 * h;

        const banner_H = h - (1.92 + 1.15 + 2 + 0.62) * x;
        const banner_W = 7.52 * x;
        this.banner.getComponent(UITransform).setContentSize(new Size(banner_W, banner_H));

        const bannerPaddingTop = (2 + 0.62) * x;
        this.banner_Widget.top = bannerPaddingTop;

        const scroll_H = 2.42 * x;
        const scroll_W = 7.52 * x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scroll_W, scroll_H));

        const scrollPaddingTop = bannerPaddingTop + banner_H;
        this.scroll_Widget.top = scrollPaddingTop;

        const layoutSize = 1.4 * x;
        const layoutScale = layoutSize / this.basic_prize_layout_size_H;
        this.prizeLayout.node.setScale(new Vec3(layoutScale, layoutScale, 1));

        const headerSize = 2.8 * x;
        const headerScale = headerSize / this.basic_header_size;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const infoSize = 0.27 * x;
        const infoScale = infoSize / this.basic_info_size;
        this.btnInfo.setScale(new Vec3(infoScale, infoScale, 1));

        const back_prize_W = 2.5588 * x;

        const back_gold_H = 2.6176 * x;
        this.back_gold.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_gold_H));

        const back_silver_H = 2.3382 * x;
        this.back_silver.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_silver_H));

        const back_bronze_H = 2.1324 * x;
        this.back_bronze.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_bronze_H));

        const prizeLayoutSpacing = 0.5883 * x;
        this.prizeLayout.spacingX = prizeLayoutSpacing;
        this.prizeLayout.updateLayout();

        const popupScale = w / 4.5 / this.basic_popup_Size;

        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(popupScale, popupScale, 1));
        }
    }


    makeTabletVariation(w: number, h: number) {
        const x = 0.140 * w * this.tabletScaleMul;

        const banner_H = 1.867 * x;
        const banner_W = 5.0133 * x;
        this.banner.getComponent(UITransform).setContentSize(new Size(banner_W, banner_H));

        const bannerPaddingTop = 1.427 * x;
        this.banner_Widget.top = bannerPaddingTop;

        const scroll_H = h - (1.427 + 0.033 + 1.867 + 0.3) * x;
        const scroll_W = 5.0133 * x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scroll_W, scroll_H));

        const scrollPaddingTop = (1.427 + 1.867) * x;
        this.scroll_Widget.top = scrollPaddingTop;

        const layoutSize = 1.3 * x;
        const layoutScale = layoutSize / this.basic_prize_layout_size_H;
        this.prizeLayout.node.setScale(new Vec3(layoutScale, layoutScale, 1));

        const headerSize = 2.3733 * x;
        const headerScale = headerSize / this.basic_header_size;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const infoSize = 0.18 * x;
        const infoScale = infoSize / this.basic_info_size;
        this.btnInfo.setScale(new Vec3(infoScale, infoScale, 1));

        const back_prize_W = 1.16 * x;

        const back_gold_H = 1.1867 * x;
        this.back_gold.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_gold_H));

        const back_silver_H = 1.06 * x;
        this.back_silver.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_silver_H));

        const back_bronze_H = 0.966 * x;
        this.back_bronze.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_bronze_H));

        const prizeLayoutSpacing = 0.3133 * x;
        this.prizeLayout.spacingX = prizeLayoutSpacing;
        this.prizeLayout.updateLayout();

        const popupScale = w / 4.5 / this.basic_popup_Size;

        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(popupScale, popupScale, 1));
        }
    }
}
