import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size, Mask } from 'cc';
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

    private items: UILeaderboardItemAdaptivity[] = [];

    private basic_prize_layout_size: number = 1452;
    private basic_prize_layout_size_H: number = 700;
    private basic_header_size: number = 1224;
    private basic_info_size: number = 107;


    refresh() {
        const visibleSize = view.getVisibleSize();
    
        let w = visibleSize.width;
        let h = visibleSize.height;
    
        if (w > h) {
            const x = 0.140 * w;

            const banner_H = 1.867 * x;
            const banner_W = 5.0133 * x;
            this.banner.getComponent(UITransform).setContentSize(new Size(banner_W, banner_H))

            const bannerPaddingTop = 1.427 * x;
            this.banner_Widget.top = bannerPaddingTop;

            const scroll_H = h - (1.427 + 0.033 + 1.867 + 0.3 + 0.7867) * x;
            const scroll_W = 5.0133 * x;
            this.scroll.getComponent(UITransform).setContentSize(new Size(scroll_W, scroll_H));

            const scrollPaddingTop = (1.427 + 0.033 + 1.867) * x;
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

        } else {
            const x = 0.262 * w;

            const banner_H = 2.276 * x;
            const banner_W = 3.596 * x;
            this.banner.getComponent(UITransform).setContentSize(new Size(banner_W, banner_H))

            /*const back_prize_W = 1.0256 * x;
            
            const back_gold_H = 1.481 * x;
            this.back_gold.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_gold_H));

            const back_silver_H = 1.327 * x;
            this.back_silver.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_silver_H));

            const back_bronze_H = 1.212 * x;
            this.back_bronze.getComponent(UITransform).setContentSize(new Size(back_prize_W, back_bronze_H));*/

            const bannerPaddingTop = (1.468 + 0.16) * x;
            this.banner_Widget.top = bannerPaddingTop;

            const scroll_H = h - (1.468 + 0.16 + 2.276 + 0.064 + 0.8526) * x;
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

            /*const prizeLayoutSpacing = 0.0962 * x;
            this.prizeLayout.spacingX = prizeLayoutSpacing;
            this.prizeLayout.updateLayout();*/
        }

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].refresh();
        }
    }


    addItem(item: UILeaderboardItemAdaptivity) {
        this.items.push(item);
    }
}


