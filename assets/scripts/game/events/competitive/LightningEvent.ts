declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { SaveData } from '../../../data/SaveData';
import { KingsCupEvent } from './KingsCupEvent';
import { UserData } from '../../../data/UserData';
import { LevelProgressStatisticsData } from '../../../data/Statistics';
import { PlayerEventData } from '../../../data/EventData';
import { Net } from '../../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('LightningEvent')
export class LightningEvent extends KingsCupEvent {

    private RETRY_COOLDOWN_MINUTES: number = 1440; //1440
    private PLAYTIME_MINUTES: number = 60; //60

    private collectables: number = 0;

    private lastAttemptTimestamp: number = 0;

    private progressInterval_Lightning: any = null;

    
    onLoad() {
        this.players = [];
    }
    
    start() {
        this.level.on("complete_statistics", (stats) => this.handleLevelCompletion(stats));
        this.startProgressUpdateLoop_Lightning();
    }

    onDestroy() {
        this.stopProgressUpdateLoop_Lightning();
    }

    private startProgressUpdateLoop_Lightning() {
        if (this.progressInterval_Lightning) return;

        this.progressInterval_Lightning = setInterval(() => {
            let updated = false;

            for (let player of this.players) {
                if(player.playerId !== UserData.instance.getPlayerId()) {
                    if (Math.random() < this.PROGRESS_CHANCE) { 
                        const randomIncrease = Math.floor(Math.random() * (21 - 7 + 1)) + 7;
                        player.progressValue += randomIncrease;

                        updated = true;
                    }
                }
            }

            if (updated) {
                this.node.emit("refresh");

                SaveData.instance.saveEvent(this.eventId);
            }
        }, this.UPDATE_INTERVAL);
    }

    private stopProgressUpdateLoop_Lightning() {
        if (this.progressInterval_Lightning) {
            clearInterval(this.progressInterval_Lightning);
            this.progressInterval_Lightning = null;
        }
    }


    update(deltaTime: number) {
        if(!this.isStarted || (this.isComplete && this.playerPlace >= 0) ) {
            return;
        }

        if(this.isPlaytimeOver()) {
            this.handleEventCompletion();
        }
    }
    

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        this.eventId = "lightning";
        
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        console.log("Lightning init: " + startDayOfWeek + " - " + startHourUTC + " - " + durationDays);

        this.collectables = 0;

        this.isStarted = false;
        this.isComplete = false;
    }



    canParticipate(): boolean {
        return (this.lastAttemptTimestamp === 0 || this.isCooldownOver()) && super.canParticipate();
    }

    isCooldownOver(): boolean {
        const cooldownEndTime = this.lastAttemptTimestamp + this.RETRY_COOLDOWN_MINUTES * 60 * 1000;
        return Date.now() >= cooldownEndTime;
    }

    isPlaytimeOver(): boolean {
        const playEndTime = this.lastAttemptTimestamp + this.PLAYTIME_MINUTES * 60 * 1000;
        return Date.now() >= playEndTime;
    }


    activateEvent() {
        if(!this.isEventAvailable() || this.isStarted || !this.canParticipate()) {
            return;
        }

        this.isStarted = true;
        this.isComplete = false;

        this.collectables = 0;

        this.lastAttemptTimestamp = Date.now();

        this.resetBots();

        SaveData.instance.saveEvent(this.eventId);

        this.applyReward(this.rewards[1]);
    }


    handleLevelCompletion(statistics: LevelProgressStatisticsData) {
        if(this.isComplete || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        if(isNaN(statistics.destroyedByDiscoball)) {
            return;
        }

        this.collectables = this.collectables + statistics.destroyedByDiscoball;

        let player = this.players.find(p => p.playerId === UserData.instance.getPlayerId());
        if (player) {
            player.progressValue = this.collectables;
        }

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("progress", 1);
    }


    handleEventCompletion() {
        //this.isStarted = false;

        this.isComplete = true;

        this.sortPlayersByProgress();
        this.playerPlace = this.players.findIndex(player => player.playerId === UserData.instance.getPlayerId());

        this.node.emit("refresh");

        SaveData.instance.saveEvent(this.eventId);
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            this.finish();

            return;
        }

        this.applyReward(this.rewards[0]);

        this.finish();
    }

    finish() {
        this.collectables = 0;

        this.isStarted = false;
        this.isComplete = false;
    }

    isRewardAvailable(): boolean {
        return this.isComplete && this.playerPlace === 0;
    }


    getCollectable(): number {
        return this.collectables;
    }

    setCollectable(value: number) {
        this.collectables = value;
    }


    getLastTimestamp(): number {
        return this.lastAttemptTimestamp;
    }

    setLastTimestamp(stamp: number) {
        this.lastAttemptTimestamp = stamp;
    }



    getRemainingCooldownString(): string {
        if (this.isCooldownOver() || !this.isPlaytimeOver()) {
            return "";
        }
    
        const now = Date.now();
        const cooldownEndTime = this.lastAttemptTimestamp + this.RETRY_COOLDOWN_MINUTES * 60 * 1000;
    
        if (now >= cooldownEndTime) {
            this.lastAttemptTimestamp = now;
            return "";
        }
    
        const timeDiff = cooldownEndTime - now;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
        return "Cooldown: " + `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getRemainingPlaytimeString(): string {
        if (this.isPlaytimeOver() || !this.isStarted) {
            return "Finished";
        }
    
        const now = Date.now();
        const playEndTime = this.lastAttemptTimestamp + this.PLAYTIME_MINUTES * 60 * 1000;
    
        if (now >= playEndTime) {
            return "Finished";
        }
    
        const timeDiff = playEndTime - now;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }


    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

        let player = this.players.find(p => p.playerId === UserData.instance.getPlayerId());
        if (player) {
            player.playerName = UserData.instance.getPlayerName();
        }

        sortedPlayers = this.players;

        sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);

        return sortedPlayers;
    }


    isInteractable(): boolean {
        if(!this.isEventAvailable()) {
            console.log("light not aval");
            return false;
        }

        if(!this.isCooldownOver() && !this.isStarted) {
            console.log("light not cooldown over");
            return false;
        }

        return true;
    }


    async updateMultiplayerData() {
        this.node.emit("refresh");
    }

    getBots(): PlayerEventData[] {
        return this.players;
    }

    setBots(bots: PlayerEventData[]) {
        this.players = bots;
    }


    restartEvent(): void {
        console.log("Restarting Multiplayer Event: " + this.eventId);

        this.lastAttemptTimestamp = 0;

        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);

        SaveData.instance.saveEvent(this.eventId);
    }
}


