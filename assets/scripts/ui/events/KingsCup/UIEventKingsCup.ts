import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { UIEventSkyRace } from '../SkyRace/UIEventSkyRace';
import { Localization } from '../../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UIEventKingsCup')
export class UIEventKingsCup extends UIEventSkyRace {
    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    playerItemsLayout: Node = null;

    @property(Node)
    rewardLayout: Node = null;

    @property(Button)
    takeRewardBtn: Button = null;


    start() {
        super.start();

        for(let i = 1; i <= this.eventController.getTotalPlayers(); i++) {
            const itemNode = instantiate(this.itemPrefab);
            this.playerItemsLayout.addChild(itemNode);

            let item = itemNode.getComponent("UIEventKingsCupPlayerItem");
            item.init(i);

            this.items.push(item);
        }

        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);
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

        this.rewardLayout.active = isRewardAvailable;

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : Localization.instance.getLabelByKey("events.levelreq") + " " + this.eventController.getLevelRequired();
    }

    updateWidgetAlignment(isPortrait) {}


    onTakeRewardBtnClick() {
        this.eventController.takeReward();

        this.refresh();
    }
}


