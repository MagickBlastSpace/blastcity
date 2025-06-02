import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardItemAdaptivity')
export class UILeaderboardItemAdaptivity extends UIAdaptivityBase {
    @property(Node)
    container: Node = null;

    @property([Node])
    items: Node[] = [];

    @property(Widget)
    number_Widget: Widget = null;
    @property(Widget)
    player_Widget: Widget = null;
    @property(Widget)
    avatar_Widget: Widget = null;
    @property(Widget)
    progress_Widget: Widget = null;

    private basic_H: number = 470;


    refresh() {
        const visibleSize = view.getVisibleSize();
    
        let w = visibleSize.width;
        let h = visibleSize.height;
    
        if (w > h) {   
            const x = 0.140 * w;

            const container_H = 0.567 * x;
            const container_W = 4.88 * x;
            this.container.getComponent(UITransform).setContentSize(new Size(container_W, container_H));

            const itemScale = container_H / this.basic_H;
            for(let i = 0; i < this.items.length; i++) {
                this.items[i].setScale(new Vec3(itemScale, itemScale, 1));
            }

            const sidePadding = 0.133 * x;
            this.number_Widget.left = sidePadding;
            this.avatar_Widget.left = sidePadding + 0.4 * x;
            this.player_Widget.left = sidePadding + 0.9 * x;
            this.progress_Widget.right = sidePadding;

        } else {
            const x = 0.262 * w;

            const container_H = 0.5769 * x;
            const container_W = 3.436 * x;
            this.container.getComponent(UITransform).setContentSize(new Size(container_W, container_H));

            const itemScale = container_H / this.basic_H;
            for(let i = 0; i < this.items.length; i++) {
                this.items[i].setScale(new Vec3(itemScale, itemScale, 1));
            }

            const sidePadding = 0.141 * x;
            this.number_Widget.left = sidePadding;
            this.avatar_Widget.left = sidePadding + 0.3 * x;
            this.player_Widget.left = sidePadding + 0.9 * x;
            this.progress_Widget.right = sidePadding;
        }
    }
}


