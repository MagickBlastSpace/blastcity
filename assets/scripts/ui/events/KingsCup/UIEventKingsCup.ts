import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { UIEventSkyRace } from '../SkyRace/UIEventSkyRace';
const { ccclass, property } = _decorator;

@ccclass('UIEventKingsCup')
export class UIEventKingsCup extends UIEventSkyRace {
    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    playerItemsLayout: Node = null;

    @property(Node)
    rewardLayout: Node = null;


    start() {
        super.start();

        for(let i = 1; i <= this.eventController.getTotalPlayers(); i++) {
            const itemNode = instantiate(this.itemPrefab);
            this.playerItemsLayout.addChild(itemNode);

            let item = itemNode.getComponent("UIEventKingsCupPlayerItem");
            item.init(i);

            this.items.push(item);
        }
    }


    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();

        this.playersLayout.active = this.isEventStarted;
   
        this.startBtn.node.active = !this.isEventStarted;

        let data = this.eventController.sortPlayersByProgress();
        
        let isRewardAvailable = this.eventController.isRewardAvailable();

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = i < data.length;
            if(i < data.length) {
                this.items[i].refresh(data[i], isRewardAvailable);
            }
        }

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : "Required Level " + this.eventController.getLevelRequired();
    }

    updateWidgetAlignment(isPortrait) {}
}


