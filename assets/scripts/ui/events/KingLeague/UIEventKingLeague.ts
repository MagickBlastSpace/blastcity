import { _decorator, Component, Node, instantiate, Button } from 'cc';
import { UIEventKingsCup } from '../KingsCup/UIEventKingsCup';
const { ccclass, property } = _decorator;

@ccclass('UIEventKingLeague')
export class UIEventKingLeague extends UIEventKingsCup {
    start() {
        this.eventController.node.on("refresh", () => this.refresh());

        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        if(this.closeBtn_Duplicate) {
            this.closeBtn_Duplicate.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        }
    }

    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();

        this.playersLayout.active = this.isEventStarted;
        this.closeBtn.active = this.isEventStarted;
        this.startBtn.node.active = !this.isEventStarted;

        let data = this.eventController.sortPlayersByProgress();

        for(let i = 0; i < data.length; i++) {
            //this.items[i].node.active = i < data.length;

            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.playerItemsLayout.addChild(itemNode);
        
                let item = itemNode.getComponent("UIEventKingsCupPlayerItem");
                item.init(i + 1);
        
                this.items.push(item);
            }

            this.items[i].refresh(data[i]);
        }
    }
}


