import { _decorator, Component, Node, Label, Prefab, instantiate, Button } from 'cc';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventWeeklyContestPlayerItem } from './UIEventWeeklyContestPlayerItem';
import { PlayerEventData } from '../../../data/EventData';
import { Net } from '../../../net/Net';
import { UIEventWeeklyContestAdaptivity } from './UIEventWeeklyContestAdaptivity';
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

    @property(UIEventWeeklyContestAdaptivity)
    adaptivity: UIEventWeeklyContestAdaptivity;


    start() {
        this.eventController.node.on("refresh", () => this.refresh());

        this.init(this.eventController);

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.on("profile", (data) => this.showProfile(data));
        }
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
                this.adaptivity.addItem(item.getComponent("UILeaderboardItemAdaptivity"));

                itemNode.on("profile", (data) => this.showProfile(data));
            }

            this.items[i].refresh(data[i]);
        }

        this.loadPlayersInfo(data);

        this.adaptivity.refresh();
    }


    show() {
        super.show();

        this.eventController.updateMultiplayerData();
    }


    async loadPlayersInfo(data: PlayerEventData[]) {
        try {
            let ids = [];
            for(let i = 0; i < data.length; i++) {
                ids.push(data[i].playerId);
            }
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            for(let i = 0; i < players.length && i < this.items.length; i++) {
                this.items[i].setPlayerInfo(players[i]);
            }
        }

        catch (error) {
            console.log('Error fetching players:', error);
        }
    }


    getRemainingTimeString(): string {
        return this.eventController.getRemainingTimeString();
    }


    showProfile(playerId: number) {
        this.node.emit("profile", playerId);
    }
}


