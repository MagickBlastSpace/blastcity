declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { PlayerEventData } from '../../../data/EventData';
import { LevelProgressStatisticsData } from '../../../data/Statistics';
import { SaveData } from '../../../data/SaveData';
import { TeamEventBase } from './TeamEventBase';
import { ClanData } from '../../../data/ClanData';
const { ccclass, property } = _decorator;

@ccclass('TeamBattleEvent')
export class TeamBattleEvent extends TeamEventBase {

    start() {
        this.level.on("complete_statistics", (stats) => this.handleLevelCompletion(stats));
    }


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "team_battle";
    }


    sortPlayersByProgress(): PlayerEventData[] {
        let membersData = this.clans.getPlayerClanMembers();
        let sortedPlayers = [];

        for(let i = 0; i < membersData.length; i++) {
            let data = new PlayerEventData();
            data.playerName = membersData[i].name;
            data.progressValue = membersData[i].score_team_battle;

            sortedPlayers.push(data);
        }

        sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);

        return sortedPlayers;
    }

    sortTeamsByProgress(): PlayerEventData[] {
        let clansData = this.clans.getAllClans();
        let sortedTeams = [];

        for(let i = 0; i < clansData.length; i++) {
            let data = new PlayerEventData();
            data.playerName = clansData[i].clanName;
            data.progressValue = this.countClanProgress(clansData[i]);

            sortedTeams.push(data);
        }

        sortedTeams.sort((a, b) => b.progressValue - a.progressValue);

        return sortedTeams;
    }


    handleLevelCompletion(statistics: LevelProgressStatisticsData) {
        if(this.isComplete || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        let earnedPoints = 1;
        if(statistics.levelDifficulty === "hard") {
            earnedPoints = 3;
        }
        else if(statistics.levelDifficulty === "superhard") {
            earnedPoints = 5;
        }

        this.currentStep = this.currentStep + earnedPoints;

        gamepush.player.set('score_team_battle', this.currentStep);
        gamepush.player.sync();

        this.clans.refresh();

        SaveData.instance.saveEvent(this.eventId);
    }


    countClanProgress(data: ClanData) {
        let progress = 0;

        for(let i = 0; i < data.members.length; i++) {
            progress += data.members[i].score_team_battle;
        }

        return progress;
    }
}


