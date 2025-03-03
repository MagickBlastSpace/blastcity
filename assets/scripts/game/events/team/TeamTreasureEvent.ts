declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { EventRewardData, PlayerEventData } from '../../../data/EventData';
import { UserData } from '../../../data/UserData';
import { SaveData } from '../../../data/SaveData';
import { TeamEventBase } from './TeamEventBase';
import { Net } from '../../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('TeamTreasureEvent')
export class TeamTreasureEvent extends TeamEventBase {

    @property([EventRewardData])
    rewards: EventRewardData[] = [];

    @property([EventRewardData])
    playersPlaceRewards: EventRewardData[] = [];

    private isRewardPicked: boolean[] = [];


    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
    }

    
    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isStarted = false;

        this.isRewardPicked = [];
        for(let i = 0; i < this.rewards.length; i++) {
            this.isRewardPicked.push(false);
        }
        
        this.eventId = "team_treasure";
    }


    getTotalTeamProgress(): number {
        let totalTeamProgress = 0;
        let playerData = this.sortPlayersByProgress();
        for(let i = 0; i < playerData.length; i++) {
            totalTeamProgress += playerData[i].progressValue;
        }

        return totalTeamProgress;
    }


    getRewardsData(): EventRewardData[] {
        return this.rewards;
    }

    getIsRewardPicked(): boolean[] {
        return this.isRewardPicked;
    }

    pickReward(rewardIndex: number) {
        this.applyReward(this.rewards[rewardIndex]);

        this.isRewardPicked[rewardIndex] = true;
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!this.isEventAvailable() || !isComplete || !this.canParticipate()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        Net.instance.publishScore(this.eventId, this.eventId + "_" + this.clans.getClanId() + "_" + this.getWeekNumber(this.startTime), this.currentStep);

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("progress", 1);
    }


    restartEvent(): void {
        let playerPlace = this.players.findIndex(player => player.playerName === UserData.instance.getPlayerName()); //TBD correctly
        if(playerPlace) {
            if(playerPlace > -1 && playerPlace < 3) {
                this.applyReward(this.playersPlaceRewards[playerPlace]);
            }
        }

        super.restartEvent();
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

            this.isUpdating = false;

        } catch (error) {
            console.log('Error fetching leaderboard data:', error);

            this.isUpdating = false;
        }
    }


    isRewardAvailable(): boolean {
        let progress = this.getTotalTeamProgress();

        for(let i = 0; i < this.rewards.length; i++) {
            if(progress >= this.rewards[i].progress && !this.isRewardPicked[i]) {
                return true;
            }
        }

        return false;
    }


    isInteractable(): boolean {
        if(!this.isEventAvailable()) {
            return false;
        }

        for(let i = 0; i < this.rewards.length; i++) {
            if(!this.isRewardPicked[i]) {
                return true;
            }
        }

        return false;
    }
}


