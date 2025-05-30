import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size, Mask } from 'cc';
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

    private basic_header_Size_X: number = 1040;
    private basic_header_Size_Y: number = 210;

    private basic_tabsFrame_Size_X: number = 2260;
    private basic_tabsFrame_Size_Y: number = 180;


    refresh() {
        const visibleSize = view.getVisibleSize();
    
        let w = visibleSize.width;
        let h = visibleSize.height;
    
        if (w > h) {
            const x = 0.140 * w;

            const header_W = w - 2 * x;
            const header_H = 1.127 * x;
            const header_Scale_X = header_W / this.basic_header_Size_X;
            const header_Scale_Y = header_H / this.basic_header_Size_Y;

            this.header.setScale(new Vec3(header_Scale_X, header_Scale_Y, 1));

            const tabsFrame_W = 5.0133 * x;
            const tabsFrame_H = 0.5 * x;
            const tabsFrame_Scale_X = tabsFrame_W / this.basic_tabsFrame_Size_X;
            const tabsFrame_Scale_Y = tabsFrame_H / this.basic_tabsFrame_Size_Y;

            this.tabsFrame.setScale(new Vec3(tabsFrame_Scale_X, tabsFrame_Scale_Y, 1));

            const tabsFramePaddingTop = 0.83 * x;

            this.tabsFrame_Widget.top = tabsFramePaddingTop;

        } else {
            const x = 0.262 * w;

            const header_W = w;
            const header_H = 1.468 * x;
            const header_Scale_X = header_W / this.basic_header_Size_X;
            const header_Scale_Y = header_H / this.basic_header_Size_Y;

            this.header.setScale(new Vec3(header_Scale_X, header_Scale_Y, 1));

            const tabsFrame_W = 3.564 * x;
            const tabsFrame_H = 0.4808 * x;
            const tabsFrame_Scale_X = tabsFrame_W / this.basic_tabsFrame_Size_X;
            const tabsFrame_Scale_Y = tabsFrame_H / this.basic_tabsFrame_Size_Y;

            this.tabsFrame.setScale(new Vec3(tabsFrame_Scale_X, tabsFrame_Scale_Y, 1));

            const tabsFramePaddingTop = 0.9872 * x;

            this.tabsFrame_Widget.top = tabsFramePaddingTop;
        }
    }
}


