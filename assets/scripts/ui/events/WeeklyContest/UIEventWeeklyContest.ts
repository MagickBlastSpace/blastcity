import { _decorator, Component, Node, Label, Prefab, instantiate } from 'cc';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventWeeklyContestPlayerItem } from './UIEventWeeklyContestPlayerItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventWeeklyContest')
export class UIEventWeeklyContest extends UIEventPopupFrameBase {

    @property(Label)
    timeLabel: Label = null;

    @property([UIEventWeeklyContestPlayerItem])
    items: UIEventWeeklyContestPlayerItem[] = [];

    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    playerItemsLayout: Node = null;


    start() {
        this.eventController.node.on("refresh", () => this.refresh());
    }

    update(deltaTime: number) {
        if(!this.node.active) {
            return;
        }

        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        let data = this.eventController.sortPlayersByProgress();

        for(let i = 0; i < data.length; i++) {
            //this.items[i].node.active = i < data.length;

            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.playerItemsLayout.addChild(itemNode);
        
                let item = itemNode.getComponent("UIEventWeeklyContestPlayerItem");
                item.init(i + 1);
        
                this.items.push(item);
            }

            this.items[i].refresh(data[i]);
        }
    }


    show() {
        super.show();

        this.eventController.updateMultiplayerData();
    }


    getRemainingTimeString(): string {
        return this.eventController.getRemainingTimeString();
    }
}


