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

    private REWARD_COINS: number = 10000;
    private RETRY_COOLDOWN_MINUTES: number = 1440;
    private PLAYTIME_MINUTES: number = 60;

    private collectables: number = 0;

    private lastAttemptTimestamp: number = 0;

    
    start() {
        this.level.on("complete_statistics", (stats) => this.handleLevelCompletion(stats));
    }

    update(deltaTime: number) {
        if(!this.isStarted || this.isComplete) {
            return;
        }

        if(this.isPlaytimeOver()) {
            this.handleEventCompletion();
        }
    }
    

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.collectables = 0;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "lightning";
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
        if(this.multiplayerChannelId === 0) {
            console.log("Multiplayer is not ready");
            return;
        }

        if(!this.isEventAvailable() || this.isStarted || !this.canParticipate()) {
            return;
        }

        this.isStarted = true;
        this.isComplete = false;

        this.collectables = 0;

        this.lastAttemptTimestamp = Date.now();

        SaveData.instance.saveEvent(this.eventId);

        Net.instance.publishScore(this.eventId, "lightning_" + this.multiplayerChannelId, this.collectables);

        this.updateMultiplayerData();
    }


    handleLevelCompletion(statistics: LevelProgressStatisticsData) {
        if(this.isComplete || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        if(isNaN(statistics.destroyedByDiscoball)) {
            return;
        }

        this.collectables = this.collectables + statistics.destroyedByDiscoball;

        Net.instance.publishScore(this.eventId, "lightning_" + this.multiplayerChannelId, this.collectables);

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("progress", 1);
    }


    handleEventCompletion() {
        this.isComplete = true;
        this.isStarted = false;

        this.node.emit("refresh");

        SaveData.instance.saveEvent(this.eventId);
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        this.applyReward(this.rewards[0]);

        this.collectables = 0;

        this.isStarted = false;
        this.isComplete = false;
    }

    isRewardAvailable(): boolean {
        return this.isComplete;
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
            return "";
        }
    
        const now = Date.now();
        const playEndTime = this.lastAttemptTimestamp + this.PLAYTIME_MINUTES * 60 * 1000;
    
        if (now >= playEndTime) {
            return "";
        }
    
        const timeDiff = playEndTime - now;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }


    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

        sortedPlayers = this.players;

        sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);

        return sortedPlayers;
    }
}


