import { _decorator, Component, Node, Button, Label, instantiate, Prefab } from 'cc';
import { UIFrameBase } from '../../UIFrameBase';
import { UIEventSkyRacePlayerItem } from '../SkyRace/UIEventSkyRacePlayerItem';
import { EventBase } from '../../../game/events/EventBase';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventLightning')
export class UIEventLightning extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    takeRewardBtn: Button = null;

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
        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);

        this.eventController.node.on("refresh", () => this.refresh());
    }

    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }

        if(!this.node.active) {
            return;
        }

        this.cooldownTimeLabel.string = this.eventController.getRemainingCooldownString();
        this.playTimeLabel.string = this.eventController.getRemainingPlaytimeString();
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        this.playersLayout.active = this.isEventStarted && !this.isEventComplete;
        this.rewardLayout.active = this.isEventComplete;
   
        this.startBtn.node.active = this.eventController.canParticipate() && !this.isEventStarted && !this.isEventComplete;

        let data = this.eventController.sortPlayersByProgress();

        for(let i = 0; i < data.length; i++) {
            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.playerItemsLayout.addChild(itemNode);
    
                let item = itemNode.getComponent("UIEventKingsCupPlayerItem");
                item.init(i + 1);
    
                this.items.push(item);
            }

            this.items[i].refresh(data[i]);
        }

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : "Required Level " + this.eventController.getLevelRequired();
    }


    show() {
        super.show();

        //this.refresh();
        this.eventController.updateMultiplayerData();
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
}


