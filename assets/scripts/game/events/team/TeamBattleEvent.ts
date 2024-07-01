declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { PlayerEventData } from '../../../data/EventData';
import { LevelProgressStatisticsData } from '../../../data/Statistics';
import { SaveData } from '../../../data/SaveData';
import { TeamEventBase } from './TeamEventBase';
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


    sortTeamsByProgress(): PlayerEventData[] {
        let clansData = this.clans.getAllClans();
        let sortedTeams = [];

        for(let i = 0; i < clansData.length; i++) {
            let data = new PlayerEventData();
            data.playerName = clansData[i].clanName;
            data.progressValue = 0; //TBD correctly

            sortedTeams.push(data);
        }

        sortedTeams.sort((a, b) => b.progressValue - a.progressValue);

        return sortedTeams;
    }


    handleLevelCompletion(statistics: LevelProgressStatisticsData) {
        if(this.isComplete || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        if(statistics.levelDifficulty !== "hard" && statistics.levelDifficulty !== "superhard") {
            return;
        }

        this.currentStep = this.currentStep + 1;

        gamepush.player.set('score_team_battle', this.currentStep);
        gamepush.player.sync();

        SaveData.instance.saveEvent(this.eventId);
    }
}


