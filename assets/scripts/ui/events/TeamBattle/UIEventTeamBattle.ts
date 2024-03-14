import { _decorator, Component, Node, Button } from 'cc';
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


    start() {
        super.start();

        this.showBattleBtn.node.on(Button.EventType.CLICK, this.onShowBattleBtnClick, this);
        this.showTeamBtn.node.on(Button.EventType.CLICK, this.onShowTeamBtnClick, this);

        this.onShowBattleBtnClick();
    }


    refresh() {
        super.refresh();

        let teamsData = this.eventController.sortTeamsByProgress();

        for(let i = 0; i < teamsData.length && i < this.teams.length; i++) {
            this.teams[i].refresh(teamsData[i]);
        }
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


