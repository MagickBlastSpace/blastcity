import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size, Mask } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
import { UIEventWeeklyContestAdaptivity } from '../../events/WeeklyContest/UIEventWeeklyContestAdaptivity';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardAdaptivity')
export class UILeaderboardAdaptivity extends UIAdaptivityBase {

    @property(Node)
    header: Node = null;
    @property(Node)
    tabsFrame: Node = null;

    @property(Widget)
    tabsFrame_Widget: Widget = null;

    private basic_header_Size_X: number = 1040;
    private basic_header_Size_Y: number = 210;

    private basic_tabsFrame_Size_X: number = 2260;
    private basic_tabsFrame_Size_Y: number = 180;

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
        const x = 0.125 * h;

        const header_H = 2 * x;
        const header_Scale_Y = header_H / this.basic_header_Size_Y;

        this.header.setScale(new Vec3(header_Scale_Y, header_Scale_Y, 1));

        const tabsFrame_W = 7.52 * x;
        const tabsFrame_H = 0.75 * x;
        const tabsFrame_Scale_X = tabsFrame_W / this.basic_tabsFrame_Size_X;
        const tabsFrame_Scale_Y = tabsFrame_H / this.basic_tabsFrame_Size_Y;

        this.tabsFrame.setScale(new Vec3(tabsFrame_Scale_X, tabsFrame_Scale_Y, 1));

        const tabsFramePaddingTop = 1.65 * x;

        this.tabsFrame_Widget.top = tabsFramePaddingTop;
    }

    makeTabletVariation(w: number, h: number) {
        const x = 0.140 * w;

        const header_H = 1.127 * x;
        const header_Scale_Y = header_H / this.basic_header_Size_Y;

        this.header.setScale(new Vec3(header_Scale_Y, header_Scale_Y, 1));

        const tabsFrame_W = 5.0133 * x;
        const tabsFrame_H = 0.5 * x;
        const tabsFrame_Scale_X = tabsFrame_W / this.basic_tabsFrame_Size_X;
        const tabsFrame_Scale_Y = tabsFrame_H / this.basic_tabsFrame_Size_Y;

        this.tabsFrame.setScale(new Vec3(tabsFrame_Scale_X, tabsFrame_Scale_Y, 1));

        const tabsFramePaddingTop = 0.83 * x;

        this.tabsFrame_Widget.top = tabsFramePaddingTop;
    }

    makeMobileVariation(w: number, h: number) {
        const x = 0.262 * w * this.mobileScaleMul;

        const header_H = 1.468 * x;
        const header_Scale_Y = header_H / this.basic_header_Size_Y;

        this.header.setScale(new Vec3(header_Scale_Y, header_Scale_Y, 1));

        const tabsFrame_W = 3.564 * x;
        const tabsFrame_H = 0.4808 * x;
        const tabsFrame_Scale_X = tabsFrame_W / this.basic_tabsFrame_Size_X;
        const tabsFrame_Scale_Y = tabsFrame_H / this.basic_tabsFrame_Size_Y;

        this.tabsFrame.setScale(new Vec3(tabsFrame_Scale_X, tabsFrame_Scale_Y, 1));

        const tabsFramePaddingTop = 0.9872 * x;

        this.tabsFrame_Widget.top = tabsFramePaddingTop;
    }
}


