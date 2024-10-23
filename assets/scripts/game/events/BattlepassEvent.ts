import { _decorator, Component, Node } from 'cc';
import { RocketFeverEvent } from './RocketFeverEvent';
import { SaveData } from '../../data/SaveData';
import { UserData } from '../../data/UserData';
import { EventRewardData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('BattlepassEvent')
export class BattlepassEvent extends RocketFeverEvent {

    private takenRewards: number[] = [];
    private takenRewards_Premium: number[] = [];


    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
        this.level.on("fail", () => this.handleLevelFail());

        UserData.instance.node.on("premium_purchase", () => this.onPremiumPurchase());
    }


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        this.calculateStartEndTimeMonthly();

        this.node.emit("init");

        this.currentStage = 1;
        this.collectedRockets = 0;

        this.isStarted = true;
        this.isComplete = false;

        this.eventId = "battlepass";
    }


    private calculateStartEndTimeMonthly() {
        const now = new Date();
    
        this.startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 8, 0, 0, 0));
    
        const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 8, 0, 0, 0));
        this.endTime = lastDay;
    
        if (now > this.endTime) {
            const nextMonth = new Date(now);
            nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    
            this.startTime = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), 1, 8, 0, 0, 0));
            this.endTime = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 0, 8, 0, 0, 0));
        }
    
        console.log("Start time: " + this.startTime);
        console.log("End time: " + this.endTime);
    }


    handleLevelFail() {
        this.setCollectable(0);

        SaveData.instance.saveEvent(this.eventId);
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

        this.collectedRockets = this.collectedRockets + earnedPoints;

        this.checkStageCompletion();

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("progress", earnedPoints);
    }

    checkStageCompletion() {
        if(this.eventData.length <= this.currentStage) {
            this.handleEventCompletion();
            return;
        }

        if(this.collectedRockets >= this.eventData[this.currentStage].stageStep) {
            this.collectedRockets = this.collectedRockets - this.eventData[this.currentStage].stageStep;

            this.currentStage = this.currentStage + 1;

            this.checkStageCompletion();
        }
        else {
            SaveData.instance.saveEvent(this.eventId);
        }
    }


    applyRewards(rewards: EventRewardData[]) {
        if(UserData.instance.getIsPremium()) {
            for(let i = 0; i < rewards.length; i++) {
                this.applyReward(rewards[i]);
            }
        }
        else {
            if(rewards.length > 0) {
                this.applyReward(rewards[0]);
            }
        }
    }


    onPremiumPurchase() {
        /*for(let i = 0; i <= this.currentStage; i++) {
            if(i < this.eventData.length) {
                this.applyRewards(this.eventData[i].rewards);
            }
        }*/
    }


    isRewardTaken(index: number): boolean {
        return this.takenRewards.includes(index);
    }

    isRewardTaken_Premium(index: number): boolean {
        return this.takenRewards_Premium.includes(index);
    }


    takeReward(index: number) {
        if(!this.takenRewards.includes(index)) {
            this.takenRewards.push(index);
        }

        this.node.emit("refresh");
    }

    takeReward_Premium(index: number) {
        if(!this.takenRewards_Premium.includes(index)) {
            this.takenRewards_Premium.push(index);
        }

        this.node.emit("refresh");
    }
}


