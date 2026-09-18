import { _decorator, Node, Widget, view, Vec3 } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';

const { ccclass, property } = _decorator;

@ccclass('UILeaderboardAdaptivity')
export class UILeaderboardAdaptivity extends UIAdaptivityBase {

    @property(Node)
    header: Node = null;

    @property(Node)
    tabsFrame: Node = null;

    @property(Widget)
    tabsFrame_Widget: Widget = null;

    private basic_header_Size_Y: number = 210;

    private basic_tabsFrame_Size_X: number = 2260;
    private basic_tabsFrame_Size_Y: number = 180;

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
    }


    private makeMobileVariation(w: number, h: number) {
        const x = 0.262 * w * this.mobileScaleMul;

        const header_H = 1.468 * x;
        const headerScale = header_H / this.basic_header_Size_Y;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const tabsFrame_W = 3.564 * x;
        const tabsFrame_H = 0.4808 * x;
        const tabsFrameScaleX = tabsFrame_W / this.basic_tabsFrame_Size_X;
        const tabsFrameScaleY = tabsFrame_H / this.basic_tabsFrame_Size_Y;
        this.tabsFrame.setScale(new Vec3(tabsFrameScaleX, tabsFrameScaleY, 1));

        this.tabsFrame_Widget.top = 0.9872 * x;
    }


    private makeTabletVariation(w: number, h: number) {
        const x = 0.140 * w * this.tabletScaleMul;

        const header_H = 1.127 * x;
        const headerScale = header_H / this.basic_header_Size_Y;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const tabsFrame_W = 5.0133 * x;
        const tabsFrame_H = 0.5 * x;
        const tabsFrameScaleX = tabsFrame_W / this.basic_tabsFrame_Size_X;
        const tabsFrameScaleY = tabsFrame_H / this.basic_tabsFrame_Size_Y;
        this.tabsFrame.setScale(new Vec3(tabsFrameScaleX, tabsFrameScaleY, 1));

        this.tabsFrame_Widget.top = 0.83 * x;
    }


    private makeDesktopVariation(w: number, h: number) {
        const x = 0.125 * h;

        const header_H = 2 * x;
        const headerScale = header_H / this.basic_header_Size_Y;
        this.header.setScale(new Vec3(headerScale, headerScale, 1));

        const tabsFrame_W = 7.52 * x;
        const tabsFrame_H = 0.75 * x;
        const tabsFrameScaleX = tabsFrame_W / this.basic_tabsFrame_Size_X;
        const tabsFrameScaleY = tabsFrame_H / this.basic_tabsFrame_Size_Y;
        this.tabsFrame.setScale(new Vec3(tabsFrameScaleX, tabsFrameScaleY, 1));

        this.tabsFrame_Widget.top = 1.65 * x;
    }
}