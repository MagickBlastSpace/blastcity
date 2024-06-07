import { _decorator, Component, Node } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { EventBase } from '../../game/events/EventBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventPopupFrameBase')
export class UIEventPopupFrameBase extends UIPopupFrameBase {

    private eventController: EventBase = null;

    private isInited: boolean = false;


    onLoad() {
        this.isInited = false;
    }
    
    init(event: EventBase) {
        this.eventController = event;

        this.eventController.node.on("refresh", () => this.refresh());

        this.isInited = true;

        this.refresh();
    }


    refresh() {}
}


