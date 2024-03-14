import { _decorator, Component, Node } from 'cc';
import { KingsCupEvent } from '../competitive/KingsCupEvent';
import { PlayerEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('TeamBattleEvent')
export class TeamBattleEvent extends KingsCupEvent {

    @property([PlayerEventData])
    teams: PlayerEventData[] = [];


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.eventId = "team_battle";
    }


    sortTeamsByProgress(): PlayerEventData[] {
        let sortedTeams = [];

        let team = new PlayerEventData();
        team.playerName = "My Team";

        let totalTeamProgress = 0;
        let playerData = this.sortPlayersByProgress();
        for(let i = 0; i < playerData.length; i++) {
            totalTeamProgress += playerData[i].progressValue;
        }

        team.progressValue = totalTeamProgress;

        sortedTeams.push(team);
        sortedTeams = sortedTeams.concat(this.teams);

        sortedTeams.sort((a, b) => b.progressValue - a.progressValue);

        return sortedTeams;
    }
}


