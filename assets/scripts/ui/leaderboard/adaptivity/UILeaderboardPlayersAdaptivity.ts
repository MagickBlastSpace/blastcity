import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
import { UILeaderboardItemAdaptivity } from '../../leaderboard/adaptivity/UILeaderboardItemAdaptivity';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardPlayersAdaptivity')
export class UILeaderboardPlayersAdaptivity extends UIAdaptivityBase {

    @property(Node)
    scroll: Node = null;

    @property(Widget)
    scroll_Widget: Widget = null;

    private items: UILeaderboardItemAdaptivity[] = [];

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

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].refresh();
        }
    }


    addItem(item: UILeaderboardItemAdaptivity) {
        this.items.push(item);
    }


    makeMobileVariation(w: number, h: number) {
        const x = 0.9492 * w;

        const header_H = 1.468 * 0.262 * w * this.mobileScaleMul;

        const scroll_H = h - header_H - 0.2 * x;
        const scroll_W = x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scroll_W, scroll_H));

        const scrollPaddingTop = header_H;
        this.scroll_Widget.top = scrollPaddingTop;
    }

    makeDesktopVariation(w: number, h: number) {
        const x = 0.0846 * h;

        const scroll_H = 0.6 * h;
        //const scroll_W = 7.52 * x;
        const scroll_W = 11.0588 * x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scroll_W, scroll_H));

        const scrollPaddingTop = 0.32 * h;
        this.scroll_Widget.top = scrollPaddingTop;
    }

    makeTabletVariation(w: number, h: number) {
        const x = 0.140 * w;

        const scroll_H = 0.6 * h;
        const scroll_W = 5.0133 * x;
        this.scroll.getComponent(UITransform).setContentSize(new Size(scroll_W, scroll_H));

        const scrollPaddingTop = 0.32 * h;
        this.scroll_Widget.top = scrollPaddingTop;
    }
}


