import { _decorator, Component, Node, Button, instantiate } from 'cc';
import { UIEventKingsCup } from '../KingsCup/UIEventKingsCup';
import { UIEventSkyRacePlayerItem } from '../SkyRace/UIEventSkyRacePlayerItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventTeamBattle')
export class UIEventTeamBattle extends UIEventKingsCup {

    @property(Button)
    showBattleBtn: Button = null;
    @property(Button)
    showTeamBtn: Button = null;

    @property(Node)
    battleContainer: Node = null;
    @property(Node)
    teamContainer: Node = null;

    @property([UIEventSkyRacePlayerItem])
    teams: UIEventSkyRacePlayerItem[] = [];
    @property(Node)
    teamItemsLayout: Node = null;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.showBattleBtn.node.on(Button.EventType.CLICK, this.onShowBattleBtnClick, this);
        this.showTeamBtn.node.on(Button.EventType.CLICK, this.onShowTeamBtnClick, this);

        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);

        this.onShowBattleBtnClick();
    }


    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();

        this.playersLayout.active = this.isEventStarted;
        this.startBtn.node.active = !this.isEventStarted && this.eventController.isRequiredLevelReached() && this.eventController.isJoinedClan();

        let data = this.eventController.sortPlayersByProgress();

        let isRewardAvailable = this.eventController.isRewardAvailable();

        for(let i = 0; i < data.length; i++) {
            if(i >= this.items.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.playerItemsLayout.addChild(itemNode);
    
                let item = itemNode.getComponent("UIEventKingsCupPlayerItem");
                item.init(i + 1);
    
                this.items.push(item);
            }

            this.items[i].refresh(data[i], isRewardAvailable);
        }

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : "Required Level " + this.eventController.getLevelRequired();
        this.levelRequired.string = this.eventController.isJoinedClan() ? this.levelRequired.string : "Join Clan";

        let teamsData = this.eventController.sortTeamsByProgress();

        for(let i = 0; i < teamsData.length; i++) {
            if(i >= this.teams.length) {
                const itemNode = instantiate(this.itemPrefab);
                this.teamItemsLayout.addChild(itemNode);
    
                let item = itemNode.getComponent("UIEventKingsCupPlayerItem");
                item.init(i + 1);
    
                this.teams.push(item);
            }

            this.teams[i].refresh(teamsData[i], isRewardAvailable);
        }

        this.rewardLayout.active = isRewardAvailable;

        this.onShowBattleBtnClick();
    }


    onShowBattleBtnClick() {
        this.battleContainer.active = true;
        this.teamContainer.active = false;
    }

    onShowTeamBtnClick() {
        this.battleContainer.active = false;
        this.teamContainer.active = true;
    }
}


