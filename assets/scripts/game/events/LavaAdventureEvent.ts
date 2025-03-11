import { _decorator, Component, Node } from 'cc';
import { EventBase } from './EventBase';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { EventRewardData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('LavaAdventureEvent')
export class LavaAdventureEvent extends EventBase {

    @property(Node)
    level: Node = null;
    
    private TOTAL_LEVELS: number = 7;
    private REWARD_COINS: number = 10000;
    private RETRY_COOLDOWN_MINUTES: number = 30;

    private MAX_PLAYERS: number = 100;
    private PLAYERS_REMOVE_COUNT_MIN: number = 12;
    private PLAYERS_REMOVE_COUNT_MAX: number = 15;

    private currentStep: number = 0;
    private currentPlayers: number = 0;

    private isCompletedToday: boolean = false;


    onLoad() {
        this.unpickedRewards = [];
    }
    
    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
        this.level.on("fail", () => this.handleLevelFail());
    }
    
    init(startHourUTC: number, durationHours: number) {
        super.init(startHourUTC, durationHours);

        this.currentStep = 0;
        this.isCompletedToday = false;

        this.unpickedRewards = [];

        this.eventId = "lava_adventure";
    }


    canParticipate(): boolean {
        return (this.lastAttemptTimestamp === 0 || this.isCooldownOver()) && super.canParticipate();
    }

    activateEvent() {
        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.isStarted = true;
        }

        if(!this.isEventAvailable()) {
            //console.log("Unable to start Lava Adventure");
            return;
        }

        this.currentStep = 0;
        this.currentPlayers = this.MAX_PLAYERS;

        this.unpickedRewards = [];

        SaveData.instance.saveEvent(this.eventId);

        //console.log("Lava Adventure started for player at level: ", UserData.instance.getProgress());
    }


    private isCooldownOver(): boolean {
        const cooldownEndTime = this.lastAttemptTimestamp + this.RETRY_COOLDOWN_MINUTES * 60 * 1000;
        return Date.now() >= cooldownEndTime;
    }

    getRemainingCooldownString(): string {
        if (this.isCooldownOver()) {
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


    private handleEventCompletion() {
        this.lastAttemptTimestamp = Date.now();

        this.isStarted = false;

        this.unpickedRewards = [];

        if(this.currentStep >= this.TOTAL_LEVELS) {
            let rewardGold = Math.floor(this.REWARD_COINS / this.currentPlayers);
            let newReward = new EventRewardData();
            newReward.gold = rewardGold;

            this.unpickedRewards.push(newReward);
        }

        this.currentStep = 0;

        console.log("Lava Adventure completed! Player rewarded:", rewardGold, "coins");

        this.isCompletedToday = true;

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!isComplete || !this.canParticipate() || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        this.currentStep = this.currentStep + 1;
        this.currentPlayers = this.currentPlayers - (Math.floor(Math.random() * (this.PLAYERS_REMOVE_COUNT_MAX - this.PLAYERS_REMOVE_COUNT_MIN + 1)) + this.PLAYERS_REMOVE_COUNT_MIN);
        this.currentPlayers = this.currentPlayers < 1 ? 1 : this.currentPlayers;

        if(this.currentStep >= this.TOTAL_LEVELS) {
            this.handleEventCompletion();
        }
        else {
            SaveData.instance.saveEvent(this.eventId);
        }

        this.node.emit("progress", 1);
    }

    private handleLevelFail() {
        if(!this.canParticipate() || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        this.handleEventCompletion();

        //console.log("Lava Adventure failed!");
    }



    getCurrentStage(): number {
        return this.currentStep;
    }

    setCurrentStage(stage: number) {
        this.currentStep = stage;
    }

    getTotalSteps(): number {
        return this.TOTAL_LEVELS;
    }


    setLastTimestamp(stamp: number) {
        this.lastAttemptTimestamp = stamp;
    }


    getCollectable(): number {
        return this.currentPlayers;
    }

    setCollectable(value: number) {
        this.currentPlayers = value;
    }


    getIsComplete(): boolean {
        return this.isCompletedToday;
    }

    setIsComplete(isComplete: boolean) {
        this.isCompletedToday = isComplete;
    }


    isRewardAvailable(): boolean {
        return this.unpickedRewards.length > 0;
    }

    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        this.applyRewards(this.unpickedRewards);

        this.unpickedRewards = [];

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("refresh");
    }


    isInteractable(): boolean {
        if(!this.isEventAvailable()) {
            console.log("lava unavailable");
            return false;
        }

        if(this.isCompletedToday && this.unpickedRewards.length === 0) {
            console.log(this.isCompletedToday + " - " + this.unpickedRewards.length);
            return false;
        }

        return true;
    }
}   


