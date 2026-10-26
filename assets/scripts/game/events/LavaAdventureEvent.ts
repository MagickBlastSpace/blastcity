import { _decorator, Node } from 'cc';
import { EventRewardData } from '../../data/EventData';
import { SaveData } from '../../data/SaveData';
import { Localization } from '../../utils/Localization';
import { EventBase } from './EventBase';
const { ccclass, property } = _decorator;

@ccclass('LavaAdventureEvent')
export class LavaAdventureEvent extends EventBase {

    @property(Node)
    level: Node = null;

    @property
    RETRY_COOLDOWN_MINUTES: number = 30;

    private TOTAL_LEVELS: number = 7;
    private REWARD_COINS: number = 10000;

    private readonly DAILY_RESET_HOUR_UTC: number = 4;
    private readonly DAILY_DURATION_HOURS: number = 24;

    private MAX_PLAYERS: number = 100;
    private PLAYERS_REMOVE_COUNT_MIN: number = 12;
    private PLAYERS_REMOVE_COUNT_MAX: number = 15;

    private currentStep: number = 0;
    private currentPlayers: number = 0;

    private isCompletedToday: boolean = false;
    private playersRemoveCount: number = 0;


    onLoad() {
        this.unpickedRewards = [];
    }

    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
        this.level.on("fail", () => this.handleLevelFail());
    }

    init(_startHourUTC: number, _durationHours: number) {
        this.eventId = "lava_adventure";

        this.currentStep = 0;
        this.currentPlayers = 0;

        this.isStarted = false;
        this.isCompletedToday = false;

        this.lastAttemptTimestamp = 0;
        this.unpickedRewards = [];

        super.init(
            this.DAILY_RESET_HOUR_UTC,
            this.DAILY_DURATION_HOURS
        );

        this.scheduleDailyReset();
    }

    private dailyResetCallback = () => {
        this.restartEvent();
    };


    private scheduleDailyReset() {
        this.unschedule(this.dailyResetCallback);

        const secondsUntilReset = Math.max(
            0,
            (this.endTime.getTime() - Date.now()) / 1000
        );

        this.scheduleOnce(
            this.dailyResetCallback,
            secondsUntilReset + 0.1
        );
    }


    restartEvent(): void {
        this.unschedule(this.cooldownFinishedCallback);

        this.init(
            this.DAILY_RESET_HOUR_UTC,
            this.DAILY_DURATION_HOURS
        );

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("refresh");
    }

    private cooldownFinishedCallback = () => {
        if(
            this.isCompletedToday ||
            this.isStarted ||
            !this.isEventAvailable()
        ) {
            return;
        }

        if(this.canParticipate()) {
            this.node.emit("refresh");
        }
    };


    private scheduleCooldownRefresh() {
        this.unschedule(this.cooldownFinishedCallback);

        const cooldownEndTime =
            this.lastAttemptTimestamp +
            this.RETRY_COOLDOWN_MINUTES * 60 * 1000;

        const secondsUntilCooldownEnd = Math.max(
            0,
            (cooldownEndTime - Date.now()) / 1000
        );

        this.scheduleOnce(
            this.cooldownFinishedCallback,
            secondsUntilCooldownEnd + 0.1
        );
    }

    canParticipate(): boolean {
        if(this.isStarted) {
            return super.canParticipate();
        }

        return (
            (this.lastAttemptTimestamp === 0 || this.isCooldownOver()) &&
            super.canParticipate()
        );
    }

    activateEvent() {
        if(
            !this.isEventAvailable() ||
            this.isCompletedToday ||
            this.isStarted ||
            !this.canParticipate()
        ) {
            return;
        }

        this.isStarted = true;

        this.lastAttemptTimestamp = Date.now();

        this.currentStep = 0;
        this.currentPlayers = this.MAX_PLAYERS;

        this.unpickedRewards = [];

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("refresh");

        console.log(
            "[LAVA] Attempt started:",
            new Date(this.lastAttemptTimestamp)
        );
    }


    private isCooldownOver(): boolean {
        const cooldownEndTime = this.lastAttemptTimestamp + this.RETRY_COOLDOWN_MINUTES * 60 * 1000;
        return Date.now() >= cooldownEndTime;
    }

    getRemainingCooldownString(): string {
        const cooldownEndTime =
            this.lastAttemptTimestamp +
            this.RETRY_COOLDOWN_MINUTES * 60 * 1000;

        const timeDiff = cooldownEndTime - Date.now();

        if(timeDiff <= 0) {
            return "";
        }

        const hours = Math.floor(
            timeDiff / (1000 * 60 * 60)
        );

        const minutes = Math.floor(
            (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
        );

        const seconds = Math.floor(
            (timeDiff % (1000 * 60)) / 1000
        );

        return (
            Localization.instance.getLabelByKey("events.lrcooldown") +
            ": " +
            `${this.padTime(hours)}:${this.padTime(minutes)}:${this.padTime(seconds)}`
        );
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

            console.log("Lava Adventure completed! Player rewarded:", rewardGold, "coins");
        }

        this.currentStep = 0;

        this.isCompletedToday = true;

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("refresh");
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!isComplete || !this.canParticipate() || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        this.isPositionUpdated = true;

        this.currentStep = this.currentStep + 1;
        this.playersRemoveCount = Math.floor(Math.random() * (this.PLAYERS_REMOVE_COUNT_MAX - this.PLAYERS_REMOVE_COUNT_MIN + 1)) + this.PLAYERS_REMOVE_COUNT_MIN;
        this.currentPlayers = this.currentPlayers - this.playersRemoveCount;
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
        if(
            !this.isStarted ||
            !this.isEventAvailable()
        ) {
            return;
        }

        this.isPositionUpdated = true;

        this.lastAttemptTimestamp = Date.now();

        this.isStarted = false;

        this.currentStep = 0;
        this.currentPlayers = 0;

        this.isCompletedToday = false;

        this.unpickedRewards = [];

        SaveData.instance.saveEvent(this.eventId);

        this.scheduleCooldownRefresh();

        this.node.emit("refresh");

        console.log(
            "[LAVA] Attempt failed. Cooldown started:",
            this.RETRY_COOLDOWN_MINUTES,
            "minutes"
        );
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
        super.setLastTimestamp(stamp);

        if(
            this.lastAttemptTimestamp > 0 &&
            !this.isStarted &&
            !this.isCompletedToday &&
            !this.isCooldownOver()
        ) {
            this.scheduleCooldownRefresh();
        }
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
            return false;
        }

        if(this.isCompletedToday) {
            return this.unpickedRewards.length > 0;
        }

        if(!this.isStarted && !this.canParticipate()) {
            return false;
        }

        return true;
    }

    getIsPositionUpdated(): boolean {
        return this.isPositionUpdated;
    }

    getPlayersRemoveCount(): number {
        return this.playersRemoveCount;
    }
}


