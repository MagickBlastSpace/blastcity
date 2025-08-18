import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardItemAdaptivity')
export class UILeaderboardItemAdaptivity extends UIAdaptivityBase {
    @property(Node)
    container: Node = null;

    @property([Node])
    items: Node[] = [];

    @property(Node)
    number: Node = null;
    @property(Node)
    player: Node = null;
    @property(Node)
    avatar: Node = null;
    @property(Node)
    progress: Node = null;

    @property(Widget)
    number_Widget: Widget = null;
    @property(Widget)
    player_Widget: Widget = null;
    @property(Widget)
    avatar_Widget: Widget = null;
    @property(Widget)
    progress_Widget: Widget = null;

    private basic_H: number = 470;

    private number_W: number = 178;
    private player_H: number = 300;
    private avatar_H: number = 250;
    private progress_W: number = 250;

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

        const container_H = 0.85 * x;
        const container_W = 7.32 * x;
        this.container.getComponent(UITransform).setContentSize(new Size(container_W, container_H));

        /*const itemScale = container_H / this.basic_H;
        for(let i = 0; i < this.items.length; i++) {
            this.items[i].setScale(new Vec3(itemScale, itemScale, 1));
        }*/

        const numberScale = 0.5882 * x / this.number_W;
        this.number.setScale(new Vec3(numberScale, numberScale, 1));
        const playerScale = 0.8 * x / this.player_H;
        this.player.setScale(new Vec3(playerScale, playerScale, 1));
        const avatarScale = 0.7353 * x / this.avatar_H;
        this.avatar.setScale(new Vec3(avatarScale, avatarScale, 1));
        const progressScale = 0.8824 * x / this.progress_W;
        this.progress.setScale(new Vec3(progressScale, progressScale, 1));

        const sidePadding = 0.2 * x;
        this.number_Widget.left = sidePadding;
        this.avatar_Widget.left = sidePadding + 0.5 * x;
        this.player_Widget.left = sidePadding + 1.2 * x;
        this.progress_Widget.right = sidePadding;
    }

    makeTabletVariation(w: number, h: number) {
        const x = 0.140 * w;

        const container_H = 0.567 * x;
        const container_W = 4.88 * x;
        this.container.getComponent(UITransform).setContentSize(new Size(container_W, container_H));

        /*const itemScale = container_H / this.basic_H;
        for(let i = 0; i < this.items.length; i++) {
            this.items[i].setScale(new Vec3(itemScale, itemScale, 1));
        }*/
        const numberScale = 0.3 * x / this.number_W;
        this.number.setScale(new Vec3(numberScale, numberScale, 1));
        const playerScale = 0.65 * x / this.player_H;
        this.player.setScale(new Vec3(playerScale, playerScale, 1));
        const avatarScale = 0.4333 * x / this.avatar_H;
        this.avatar.setScale(new Vec3(avatarScale, avatarScale, 1));
        const progressScale = 0.4 * x / this.progress_W;
        this.progress.setScale(new Vec3(progressScale, progressScale, 1));

        const sidePadding = 0.133 * x;
        this.number_Widget.left = sidePadding;
        this.avatar_Widget.left = sidePadding + 0.4 * x;
        this.player_Widget.left = sidePadding + 0.9 * x;
        this.progress_Widget.right = sidePadding;
    }

    makeMobileVariation(w: number, h: number) {
        const x = 0.262 * w * this.mobileScaleMul;

        const container_H = 0.5769 * x;
        const container_W = 3.436 * x;
        this.container.getComponent(UITransform).setContentSize(new Size(container_W, container_H));

        /*const itemScale = container_H / this.basic_H;
        for(let i = 0; i < this.items.length; i++) {
            this.items[i].setScale(new Vec3(itemScale, itemScale, 1));
        }*/
        const numberScale = 0.25 * x / this.number_W;
        this.number.setScale(new Vec3(numberScale, numberScale, 1));
        const playerScale = 0.6 * x / this.player_H;
        this.player.setScale(new Vec3(playerScale, playerScale, 1));
        const avatarScale = 0.3 * x / this.avatar_H;
        this.avatar.setScale(new Vec3(avatarScale, avatarScale, 1));
        const progressScale = 0.3 * x / this.progress_W;
        this.progress.setScale(new Vec3(progressScale, progressScale, 1));

        const sidePadding = 0.141 * x;
        this.number_Widget.left = sidePadding;
        this.avatar_Widget.left = sidePadding + 0.3 * x;
        this.player_Widget.left = sidePadding + 0.9 * x;
        this.progress_Widget.right = sidePadding;
    }
}


