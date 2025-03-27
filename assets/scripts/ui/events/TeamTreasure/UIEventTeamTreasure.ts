import { _decorator, Component, Node, Label, Button, Prefab, instantiate, ProgressBar } from 'cc';
import { UIEventTeamTreasureRewardItem } from './UIEventTeamTreasureRewardItem';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventKingsCupPlayerItem } from '../KingsCup/UIEventKingsCupPlayerItem';
import { Localization } from '../../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UIEventTeamTreasure')
export class UIEventTeamTreasure extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    
    @property(Label)
    total: Label = null;
    @property(Label)
    teamName: Label = null;

    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    levelRequired: Label = null;

    @property([UIEventTeamTreasureRewardItem])
    rewards: UIEventTeamTreasureRewardItem[] = [];

    @property(Node)
    playersLayout: Node = null;
    @property(Node)
    playerItemsLayout: Node = null;
    @property(Prefab)
    itemPrefab: Prefab = null;
    @property([UIEventKingsCupPlayerItem])
    items: UIEventKingsCupPlayerItem[] = [];

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    private isEventStarted = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        for(let i = 0; i < this.rewards.length; i++) {
            this.rewards[i].node.on("pick", () => this.pickReward(i));
        }
    }

    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }

        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();

        this.playersLayout.active = this.isEventStarted;
        this.startBtn.node.active = !this.isEventStarted && this.eventController.isRequiredLevelReached() && this.eventController.isJoinedClan();

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

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : Localization.instance.getLabelByKey("events.levelreq") + " " + this.eventController.getLevelRequired();
        this.levelRequired.string = this.eventController.isJoinedClan() ? this.levelRequired.string : "Join Clan";

        let rewardsData = this.eventController.getRewardsData();
        let isPicked = this.eventController.getIsRewardPicked();
        let totalProgress = this.eventController.getTotalTeamProgress();

        for(let i = 0; i < rewardsData.length && i < this.rewards.length && i < isPicked.length; i++) {
            this.rewards[i].refresh(rewardsData[i], isPicked[i], totalProgress);
        }

        this.total.string = totalProgress + "/" + rewardsData[rewardsData.length - 1].progress;
        this.teamName.string = this.eventController.getClanName();

        if(this.progressBar) {
            this.progressBar.progress = totalProgress / rewardsData[rewardsData.length - 1].progress;
        }
    }


    show() {
        super.show();

        this.eventController.updateMultiplayerData();
    }


    onStartBtnClick() {
        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }


    pickReward(index: number) {
        this.eventController.pickReward(index);

        this.refresh();
    }
}


