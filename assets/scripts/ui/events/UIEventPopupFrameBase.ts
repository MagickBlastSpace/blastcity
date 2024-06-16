import { _decorator, Component, Node, Widget, find, Canvas } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { EventBase } from '../../game/events/EventBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventPopupFrameBase')
export class UIEventPopupFrameBase extends UIPopupFrameBase {

    @property([Widget])
    widgets: Widget[] = [];

    private eventController: EventBase = null;

    private isInited: boolean = false;


    onLoad() {
        this.isInited = false;
    }

    
    init(event: EventBase) {
        this.setWidgetsTargetToMainCanvas();

        this.eventController = event;

        this.eventController.node.on("refresh", () => this.refresh());

        this.isInited = true;

        this.refresh();
    }


    refresh() {}


    private setWidgetsTargetToMainCanvas() {
        const canvasNode = find('Canvas');
        if (!canvasNode) {
            console.error('Main Canvas node not found');
            return;
        }

        for(let i = 0; i < this.widgets.length; i++) {
            this.widgets[i].target = canvasNode;
            this.widgets[i].updateAlignment();
        }

        console.log('Widget target set to main Canvas successfully');
    }
}


