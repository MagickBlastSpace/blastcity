import { _decorator, Component, Node, Button, Label, instantiate, Prefab } from 'cc';
import { UIFrameBase } from '../../UIFrameBase';
import { UIEventSkyRacePlayerItem } from '../SkyRace/UIEventSkyRacePlayerItem';
import { EventBase } from '../../../game/events/EventBase';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { Localization } from '../../../utils/Localization';
import { PlayerEventData } from '../../../data/EventData';
import { Net } from '../../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('UIEventLightning')
export class UIEventLightning extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    closeBtn_Duplicate: Button = null;
    @property(Button)
    takeRewardBtn: Button = null;
    @property(Button)
    playBtn: Button = null;
    @property(Button)
    restartBtn: Button = null;

    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    cooldownTimeLabel: Label = null;
    @property(Label)
    playTimeLabel: Label = null;
    @property(Label)
    levelRequired: Label = null;

    @property(Node)
    playersLayout: Node = null;
    @property(Node)
    rewardLayout: Node = null;
    @property(Node)
    playLayout: Node = null;
    @property(Node)
    finishLayout: Node = null;

    @property([UIEventSkyRacePlayerItem])
    items: UIEventSkyRacePlayerItem[] = [];

    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    playerItemsLayout: Node = null;

    private isEventStarted = false;
    private isEventComplete = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.closeBtn_Duplicate.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
        this.restartBtn.node.on(Button.EventType.CLICK, this.onRestartBtnClick, this);

        this.eventController.node.on("refresh", () => this.refresh());
    }

    update(deltaTime: number) {
        if(this.isInited) {
            this.cooldownTimeLabel.string = this.eventController.getRemainingCooldownString();
            this.playTimeLabel.string = this.eventController.getRemainingPlaytimeString();
            this.timeLabel.string = this.eventController.getRemainingTimeString();
        }

        /*if(!this.node.active) {
            return;
        }*/
    }


    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        this.playersLayout.active = this.isEventStarted || this.isEventComplete;
        this.rewardLayout.active = this.isEventComplete && this.eventController.isRewardAvailable();
        this.playLayout.active = this.isEventStarted && !this.isEventComplete;
        this.finishLayout.active = this.isEventComplete && !this.eventController.isRewardAvailable();
   
        this.startBtn.node.active = this.eventController.canParticipate() && this.eventController.isEventAvailable() && !this.isEventStarted && !this.isEventComplete;

        let data = this.eventController.sortPlayersByProgress().reverse();

        console.log("Lightning refresh: " + data.length + " - " + this.items.length);

        for(let i = 0; i < data.length; i++) {
            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.playerItemsLayout.addChild(itemNode);
    
                let item = itemNode.getComponent("UIEventKingsCupPlayerItem");
                //item.init(i + 1);
                item.init(data.length - i);
    
                this.items.push(item);
            }

            this.items[i].refresh(data[i]);
        }

        this.loadPlayersInfo(data);

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : Localization.instance.getLabelByKey("events.levelreq") + " " + this.eventController.getLevelRequired();
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


    onStartBtnClick() {
        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }

    onTakeRewardBtnClick() {
        this.eventController.takeReward();

        this.refresh();
    }

    onPlayBtnClick() {
        this.hide();

        this.node.emit("play");
    }

    onRestartBtnClick() {
        this.eventController.finish();

        this.refresh();
    }
}


