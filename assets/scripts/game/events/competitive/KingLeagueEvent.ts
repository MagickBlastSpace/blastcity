declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { CompetitiveEventBase } from './CompetitiveEventBase';
import { EventRewardData, PlayerEventData } from '../../../data/EventData';
import { SaveData } from '../../../data/SaveData';
import { Net } from '../../../net/Net';
import { UserData } from '../../../data/UserData';
import { GameData } from '../../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('KingLeagueEvent')
export class KingLeagueEvent extends CompetitiveEventBase {
    @property([EventRewardData])
    rewards: EventRewardData[] = [];

    private isRewardPicked: boolean = false;

    private playerPlace: number = -1;


    onLoad() {
        this.players = [];
    }
    
    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
    }
    

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "king_league";
    }

    initByGamepush() {
        this.currentStep = 0;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "king_league";

        //gp init logic
    }


    isWeekly(): boolean {
        return true;
    }

    isGamePushBased(): boolean {
        return false; //change later
    }

    isKingLeagueMode(): boolean {
        return UserData.instance.getProgress() >= GameData.instance.getMaxProgress();
    }


    canParticipate(): boolean {
        const now = new Date();
        const timeDiffInMillis = this.endTime.getTime() - now.getTime();
        const hoursDiff = timeDiffInMillis / (1000 * 60 * 60);

        //return  super.canParticipate() && hoursDiff > 1 && this.isKingLeagueMode();
        return  super.canParticipate() && this.isKingLeagueMode();
    }

    isEventAvailable(): boolean {
        return super.isEventAvailable() && this.isKingLeagueMode();
    }


    activateEvent() {
        if(!this.isEventAvailable() || this.isStarted || !this.canParticipate()) {
            return;
        }

        this.isStarted = true;
        this.isComplete = false;

        this.currentStep = 0;
        UserData.instance.setKingLeagueProgress(0);

        gamepush.player.set('score_king_league', 0);
        gamepush.player.sync();

        this.lastAttemptTimestamp = Date.now();

        SaveData.instance.saveEvent(this.eventId);

        Net.instance.publishScore(this.eventId, "week_" + this.getWeekNumber(this.startTime), this.currentStep);

        this.updateMultiplayerData();
    }


    private handleEventCompletion() {
        this.updateMultiplayerData();

        this.isComplete = true;

        let playerPlace = this.players.findIndex(player => player.playerName === UserData.instance.getPlayerName());

        this.takeReward(playerPlace);

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!this.isEventAvailable() || !isComplete || !this.canParticipate()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        Net.instance.publishScore(this.eventId, "week_" + this.getWeekNumber(this.startTime), this.currentStep);

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("progress", 1);
    }

    restartEvent() {
        this.handleEventCompletion();

        //this.initByGamepush();
        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        this.applyReward(this.rewards[this.playerPlace]);

        this.currentStep = 0;

        this.isStarted = false;
        this.isComplete = false;
    }

    isRewardAvailable(): boolean {
        return this.isComplete && this.playerPlace > -1 && this.playerPlace < this.rewards.length && !this.isRewardPicked;
    }


    sortPlayersByProgress(): PlayerEventData[] {
        return this.players;
    }


    async updateMultiplayerData() {
        this.players = [];

        try {
            const result = await Net.instance.fetchScoreLeaderboardData(this.eventId, "week_" + this.getWeekNumber(this.startTime));
            const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;

            for(let i = 0; i < players.length; i++) {
                let player = new PlayerEventData();
                player.playerName = players[i].name;
                player.progressValue = players[i].score;
                player.playerId = players[i].id;

                this.players.push(player);
            }

            this.node.emit("refresh");

        } catch (error) {
            console.log('Error fetching leaderboard data:', error);
        }
    }



}


