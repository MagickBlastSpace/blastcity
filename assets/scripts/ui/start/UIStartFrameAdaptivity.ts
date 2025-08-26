import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size } from 'cc';
import { UIAdaptivityBase } from '../UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('UIStartFrameAdaptivity')
export class UIStartFrameAdaptivity extends UIAdaptivityBase {

    @property([Node])
    events: Node[] = [];
    @property([Layout])
    eventBtnsLs: Layout[] = [];
    @property([Widget])
    eventBtnsWidgets: Widget[] = [];
    @property([Node])
    eventProgressBtns: Node[] = [];

    @property(Widget)
    eventBtnsWidget_Left: Widget;
    @property(Widget)
    eventBtnsWidget_Right: Widget;

    @property([Node])
    playBtns: Node[] = [];
    @property([Widget])
    playBtns_Widgets: Widget[] = [];

    @property(Node)
    chest: Node = null;
    @property(Node)
    resources: Node = null;
    @property([Widget])
    resources_Widgets: Widget[] = [];

    private basicChestSize: number = 864;

    private basic_EventIconSize: number = 280;

    private basic_X: number = 512;
    

    refresh() {
        const visibleSize = view.getVisibleSize();
    
        const w = visibleSize.width;
        const h = visibleSize.height;
    
        if (w > h) {
            const y = 0.125 * h;
            const x = 0.140 * w;
            
            const eventsScale = y / this.basic_EventIconSize;
            for(let i = 0; i < this.events.length; i++) {
                this.events[i].setScale(new Vec3(eventsScale, eventsScale, 1));
            }

            const eventsSpacing = 0.25 * y;

            for(let i = 0; i < this.eventBtnsLs.length; i++) {
                this.eventBtnsLs[i].spacingY = eventsSpacing;

                this.eventBtnsLs[i].updateLayout();
            }

            for(let i = 0; i < this.eventBtnsWidgets.length; i++) {
                this.eventBtnsWidgets[i].top = 37.5;
                this.eventBtnsWidgets[i].bottom = 37.5;
            }

            let eventBtnSidePadding = (x - y) / 2;
            this.eventBtnsWidget_Left.left = eventBtnSidePadding;
            this.eventBtnsWidget_Right.right = eventBtnSidePadding;

            const playBtn_W = 2.54 * x;
            const playBtn_H = 0.56 * x;

            for(let i = 0; i < this.playBtns.length; i++) {
                this.playBtns[i].getComponent(UITransform).setContentSize(new Size(playBtn_W, playBtn_H));
            }

            for(let i = 0; i < this.playBtns_Widgets.length; i++) {
                this.playBtns_Widgets[i].center = 0;
                this.playBtns_Widgets[i].bottom = 400;
            }

            const chestSize = 1.167 * x;
            const chestScale = chestSize / this.basicChestSize;

            this.chest.setScale(new Vec3(chestScale, chestScale, 1));

            const xScale = x / this.basic_X;
            this.resources.setScale(new Vec3(xScale, xScale, 1));

            for(let i = 0; i < this.eventProgressBtns.length; i++) {
                this.eventProgressBtns[i].setScale(new Vec3(xScale, xScale, 1));
            }

            for(let i = 0; i < this.resources_Widgets.length; i++) {
                this.resources_Widgets[i].top = 400;
            }

        } else {
            const y = 0.078 * h;
            const x = 0.2487 * w;
            
            const eventsScale = y / this.basic_EventIconSize;
            for(let i = 0; i < this.events.length; i++) {
                this.events[i].setScale(new Vec3(eventsScale, eventsScale, 1));
            }

            const eventsSpacing = 0.25 * y;

            for(let i = 0; i < this.eventBtnsLs.length; i++) {
                this.eventBtnsLs[i].spacingY = eventsSpacing;

                this.eventBtnsLs[i].updateLayout();
            }

            for(let i = 0; i < this.eventBtnsWidgets.length; i++) {
                this.eventBtnsWidgets[i].top = 1000;
                this.eventBtnsWidgets[i].bottom = 500;
            }

            const playBtn_W = 2.674 * x;
            const playBtn_H = 0.68 * x;

            for(let i = 0; i < this.playBtns.length; i++) {
                this.playBtns[i].getComponent(UITransform).setContentSize(new Size(playBtn_W, playBtn_H));
            }

            for(let i = 0; i < this.playBtns_Widgets.length; i++) {
                this.playBtns_Widgets[i].center = 0;
                this.playBtns_Widgets[i].bottom = 800;
            }

            const chestSize = 1.68 * x;
            const chestScale = chestSize / this.basicChestSize;

            this.chest.setScale(new Vec3(chestScale, chestScale, 1));

            const xScale = x / this.basic_X;
            this.resources.setScale(new Vec3(xScale, xScale, 1));
            
            for(let i = 0; i < this.eventProgressBtns.length; i++) {
                this.eventProgressBtns[i].setScale(new Vec3(xScale, xScale, 1));
            }

            for(let i = 0; i < this.resources_Widgets.length; i++) {
                this.resources_Widgets[i].top = 600;
            }
        }
    }
}


