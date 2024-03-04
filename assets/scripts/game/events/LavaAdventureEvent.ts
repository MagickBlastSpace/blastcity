import { _decorator, Component, Node } from 'cc';
import { EventBase } from './EventBase';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('LavaAdventureEvent')
export class LavaAdventureEvent extends EventBase {

    @property(Node)
    level: Node = null;
    
    private TOTAL_LEVELS: number = 7;
    private REWARD_COINS: number = 10000;
    private RETRY_COOLDOWN_MINUTES: number = 30;

    private lastAttemptTimestamp: number = 0;
    private currentStep: number = 0;


    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
        this.level.on("fail", () => this.handleLevelFail());
    }
    
    init(startHourUTC: number, durationHours: number) {
        super.init(startHourUTC, durationHours);

        this.currentStep = 0;

        this.eventId = "lava_adventure";
    }


    canParticipate(): boolean {
        return (this.lastAttemptTimestamp === 0 || this.isCooldownOver()) && super.canParticipate();
    }

    activateEvent() {
        super.activateEvent();

        if(!this.isEventAvailable()) {
            console.log("Unable to start Lava Adventure");
            return;
        }

        this.currentStep = 0;

        console.log("Lava Adventure started for player at level: ", UserData.instance.getProgress());
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
        this.currentStep = 0;

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!isComplete || !this.canParticipate() || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        if(this.currentStep >= this.TOTAL_LEVELS) {
            this.handleEventCompletion();

            UserData.instance.addResource("gold", this.REWARD_COINS);

            console.log("Lava Adventure completed! Player rewarded:", this.REWARD_COINS, "coins");
        }
        else {
            SaveData.instance.saveEvent(this.eventId);
        }
    }

    private handleLevelFail() {
        this.handleEventCompletion();

        console.log("Lava Adventure failed!");
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

    getLastTimestamp(): number {
        return this.lastAttemptTimestamp;
    }

    setLastTimestamp(stamp: number) {
        this.lastAttemptTimestamp = stamp;
    }
}   


