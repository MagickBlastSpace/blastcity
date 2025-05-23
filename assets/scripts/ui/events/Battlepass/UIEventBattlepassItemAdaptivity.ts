import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventBattlepassItemAdaptivity')
export class UIEventBattlepassItemAdaptivity extends UIAdaptivityBase {

    @property(Node)
    container: Node = null;

    @property([Node])
    items: Node[] = [];
    @property(Node)
    progress: Node = null;

    @property(Widget)
    item_Left: Widget = null;
    @property(Widget)
    item_Right: Widget = null;

    private basic_progress_size: number = 470;
    private basic_item_size: number = 600;


    refresh() {
        const visibleSize = view.getVisibleSize();
    
        let w = visibleSize.width;
        let h = visibleSize.height;
    
        if (w > h) {   
            w = w / 4;

            const x = 0.3094 * w;

            const container_H = w / 2.98; //???
            this.container.getComponent(UITransform).setContentSize(new Size(w, container_H));

            const progressSize = 0.951 * x;
            const progressScale = progressSize / this.basic_progress_size;
            this.progress.setScale(new Vec3(progressScale, progressScale, 1));

            const itemSize = 0.94 * x;
            const itemScale = itemSize / this.basic_item_size;
            for(let i = 0; i < this.items.length; i++) {
                this.items[i].setScale(new Vec3(itemScale, itemScale, 1));
            }

            const itemsPadding = 0.21 * x;
            this.item_Left.left = itemsPadding;
            this.item_Right.right = itemsPadding;
        } else {
            const x = 0.3094 * w;

            const container_H = w / 2.98; //???
            this.container.getComponent(UITransform).setContentSize(new Size(w, container_H));

            const progressSize = 0.951 * x;
            const progressScale = progressSize / this.basic_progress_size;
            this.progress.setScale(new Vec3(progressScale, progressScale, 1));

            const itemSize = 0.94 * x;
            const itemScale = itemSize / this.basic_item_size;
            for(let i = 0; i < this.items.length; i++) {
                this.items[i].setScale(new Vec3(itemScale, itemScale, 1));
            }

            const itemsPadding = 0.21 * x;
            this.item_Left.left = itemsPadding;
            this.item_Right.right = itemsPadding;
        }
    }
}


