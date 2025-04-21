declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { EventRewardData, PlayerEventData } from '../../../data/EventData';
import { LevelProgressStatisticsData } from '../../../data/Statistics';
import { SaveData } from '../../../data/SaveData';
import { TeamEventBase } from './TeamEventBase';
import { ClanData } from '../../../data/ClanData';
import { Net } from '../../../net/Net';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('TeamBattleEvent')
export class TeamBattleEvent extends TeamEventBase {

    @property([PlayerEventData])
    teams: PlayerEventData[] = [];

    @property([EventRewardData])
    rewards: EventRewardData[] = [];

    private playerPlace: number = -1;


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
        this.teams.sort((a, b) => b.progressValue - a.progressValue);

        return this.teams;
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

        if(UserData.instance.isModifierX2()) {
            earnedPoints = earnedPoints * 2;
        }

        this.currentStep = this.currentStep + earnedPoints;

        Net.instance.publishScore(this.eventId, this.eventId + "_" + this.clans.getClanId() + "_" + this.getWeekNumber(this.startTime), this.currentStep);

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("progress", earnedPoints);
    }


    async updateMultiplayerData() {
        if(this.isUpdating) {
            return;
        }

        this.players = [];
        let ids = [];

        this.isUpdating = true;

        try {
            const result = await Net.instance.fetchScoreLeaderboardData(this.eventId, this.eventId + "_" + this.clans.getClanId() + "_" + this.getWeekNumber(this.startTime));
            const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;

            for(let i = 0; i < players.length; i++) {
                let player = new PlayerEventData();
                player.playerName = players[i].name;
                player.progressValue = players[i].score;

                let id = players[i].id;

                if(!ids.includes(id)) {
                    ids.push(id);

                    this.players.push(player);
                }
            }

            this.node.emit("refresh");

        } catch (error) {
            console.log('Error fetching leaderboard data:', error);

            this.isUpdating = false;
        }


        this.teams = [];

        let clansData = this.clans.getAllClans();

        for(let i = 0; i < clansData.length; i++) {
            let data = new PlayerEventData();
            data.playerName = clansData[i].clanName;
            data.playerId = 0;
            data.progressValue = 0;

            try {
                const result = await Net.instance.fetchScoreLeaderboardData(this.eventId, this.eventId + "_" + clansData[i].clanId + "_" + this.getWeekNumber(this.startTime));
                const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;
    
                for(let i = 0; i < players.length; i++) {
                    data.progressValue += players[i].score;
                }

                this.teams.push(data);

                this.node.emit("refresh");

                this.isUpdating = false;
    
            } catch (error) {
                console.log('Error fetching leaderboard data:', error);

                this.isUpdating = false;
            }
        }
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        this.applyRewards(this.unpickedRewards);

        this.unpickedRewards = [];

        this.isComplete = false;
        this.isStarted = false;

        SaveData.instance.saveEvent(this.eventId);
    }


    isRewardAvailable(): boolean {
        return this.unpickedRewards.length > 0;
    }

    restartEvent(): void {
        this.unpickedRewards = [];

        this.handleEventCompletion();

        if(this.playerPlace > -1 && this.playerPlace < this.rewards.length) {
            this.unpickedRewards.push(this.rewards[this.playerPlace]);
        }

        super.restartEvent();
    }

    private handleEventCompletion() {
        this.isComplete = true;

        this.sortTeamsByProgress();
        this.playerPlace = this.teams.findIndex(t => t.clanName === UserData.instance.getClanName());

        SaveData.instance.saveEvent(this.eventId);
    }
}


