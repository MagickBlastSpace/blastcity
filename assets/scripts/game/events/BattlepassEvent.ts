import { _decorator, Component, Node } from 'cc';
import { RocketFeverEvent } from './RocketFeverEvent';
import { SaveData } from '../../data/SaveData';
import { UserData } from '../../data/UserData';
import { EventRewardData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('BattlepassEvent')
export class BattlepassEvent extends RocketFeverEvent {

    //private takenRewards: number[] = [];
    private takenRewards_Premium: number[] = [];

    private bonusBank: number = 0;
    private bonusBank_Max: number = 5000;
    private bankMultiplier: number = 10;
    private isBankTaken: boolean = false;

    /*Debug*/
    private isDebugMode: boolean = false;


    start() {
        this.level.on("complete_statistics", (stats) => this.handleLevelCompletion(stats));
        this.level.on("fail", () => this.handleLevelFail());

        UserData.instance.node.on("premium_purchase", () => this.onPremiumPurchase());
    }


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        //this.calculateStartEndTimeMonthly();

        //test start
        const now = new Date();
        this.startTime = new Date(now);
        this.startTime.setUTCHours(startHourUTC, 0, 0, 0);

        this.endTime = new Date(this.startTime.getTime() + 24 * 60 * 60 * 1000);

        let timeDiff = this.startTime.getTime() - now.getTime();

        while(timeDiff > 0) {
            this.startTime.setUTCDate(this.startTime.getUTCDate() - 1);
            this.endTime = new Date(this.startTime.getTime() + 24 * 60 * 60 * 1000);

            timeDiff = this.startTime.getTime() - now.getTime();
        }
        //test end

        this.node.emit("init");

        this.currentStage = 1;
        this.collectedRockets = 0;

        this.isStarted = true;
        //this.isComplete = false;

        this.eventId = "battlepass";
    }


    private calculateStartEndTimeMonthly() {
        const now = new Date();
    
        // Начало - 1-е число текущего месяца в 08:00 UTC
        this.startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 8, 0, 0, 0));
    
        // Окончание - 1-е число следующего месяца в 08:00 UTC
        this.endTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 8, 0, 0, 0));
    
        // Если текущее время >= времени окончания, сдвигаем на следующий месяц
        if (now >= this.endTime) {
            this.startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 8, 0, 0, 0));
            this.endTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1, 8, 0, 0, 0));
        }
    
        console.log("bp Start time: " + this.startTime);
        console.log("bp End time: " + this.endTime);
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

        if(this.lastAttemptTimestamp === 0) {
            this.lastAttemptTimestamp = Date.now();
        }

        this.collectedRockets = this.collectedRockets + earnedPoints;

        this.bonusBank = this.bonusBank + earnedPoints * this.bankMultiplier;
        if(this.bonusBank > this.bonusBank_Max) {
            this.bonusBank = this.bonusBank_Max;
        }

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

            this.applyReward(this.eventData[index].rewards[0]);

            if(this.lastAttemptTimestamp === 0) {
                this.lastAttemptTimestamp = Date.now();
            }

            SaveData.instance.saveEvent(this.eventId);
        }

        this.node.emit("refresh");
    }

    takeReward_Premium(index: number) {
        if(!this.takenRewards_Premium.includes(index)) {
            this.takenRewards_Premium.push(index);

            this.applyReward(this.eventData[index].rewards[1]);

            if(this.lastAttemptTimestamp === 0) {
                this.lastAttemptTimestamp = Date.now();
            }

            SaveData.instance.saveEvent(this.eventId);
        }

        this.node.emit("refresh");
    }


    getBonusBank(): number {
        return this.bonusBank;
    }

    setBonusBank(value: number) {
        this.bonusBank = value;
    }

    getIsBankTaken(): boolean {
        return this.isBankTaken;
    }

    setIsBankTaken(isTaken: boolean) {
        this.isBankTaken = isTaken;
    }


    takeBonusBank() {
        if(!this.getIsBankTakeAvailable()) {
            return;
        }

        UserData.instance.addResource("gold", this.bonusBank);

        this.bonusBank = 0;
        this.isBankTaken = true;

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("refresh");
    }

    getIsBankTakeAvailable(): boolean {
        return !this.isBankTaken && this.isComplete;
    }


    isRewardAvailable(): boolean {
        if(this.isUnpickedRewardAvailable()) {
            return true;
        }

        if(this.getIsBankTakeAvailable()) {
            return true;
        }

        let isPrem = UserData.instance.getIsPremium();

        for(let i = 0; i < this.currentStage; i++) {
            if(!this.takenRewards.includes(i)) {
                return true;
            }

            if(isPrem) {
                if(!this.takenRewards_Premium.includes(i)) {
                    return true;
                }
            }
        }

        return false;
    }

    isUnpickedRewardAvailable(): boolean {
        return this.unpickedRewards.length > 0;
    }


    getTotalStages(): number {
        return this.eventData.length;
    }


    getTakenRewards_Premium(): number[] {
        return this.takenRewards_Premium;
    }

    setTakenRewards_Premium(rewards: number[]) {
        this.takenRewards_Premium = rewards;
    }


    restartEvent(): void {
        this.isComplete = true;

        this.saveUnpickedRewards();

        UserData.instance.removePremium();

        super.restartEvent();
    }


    saveUnpickedRewards() {
        if (this.isRewardAvailable()) {
            let totalReward = new EventRewardData();

            let isPrem = UserData.instance.getIsPremium();
    
            for (let i = 0; i < this.currentStage; i++) {
                if (!this.takenRewards.includes(i)) {
                    let reward = this.eventData[i]?.rewards[0];

                    totalReward.gold += reward.gold;
                    totalReward.progress += reward.progress;
                    totalReward.startBonus_Bomb += reward.startBonus_Bomb;
                    totalReward.startBonus_Rocket += reward.startBonus_Rocket;
                    totalReward.startBonus_Discoball += reward.startBonus_Discoball;
                    totalReward.booster_Hammer += reward.booster_Hammer;
                    totalReward.booster_Bow += reward.booster_Bow;
                    totalReward.booster_Cannon += reward.booster_Cannon;
                    totalReward.booster_Jester += reward.booster_Jester;
                    totalReward.endlessLives_Minutes += reward.endlessLives_Minutes;
                    totalReward.modifierX2_Minutes += reward.modifierX2_Minutes;
                    totalReward.bomb_Minutes += reward.bomb_Minutes;
                    totalReward.rocket_Minutes += reward.rocket_Minutes;
                    totalReward.discoball_Minutes += reward.discoball_Minutes;
                    totalReward.battlepass += reward.battlepass;
                    totalReward.cardsPack += reward.cardsPack;
                    totalReward.cards.push(...reward.cards);
                    totalReward.isChest ||= reward.isChest;
                }

                if(isPrem) {
                    if (!this.takenRewards_Premium.includes(i)) {
                        let reward = this.eventData[i]?.rewards[1];
    
                        totalReward.gold += reward.gold;
                        totalReward.progress += reward.progress;
                        totalReward.startBonus_Bomb += reward.startBonus_Bomb;
                        totalReward.startBonus_Rocket += reward.startBonus_Rocket;
                        totalReward.startBonus_Discoball += reward.startBonus_Discoball;
                        totalReward.booster_Hammer += reward.booster_Hammer;
                        totalReward.booster_Bow += reward.booster_Bow;
                        totalReward.booster_Cannon += reward.booster_Cannon;
                        totalReward.booster_Jester += reward.booster_Jester;
                        totalReward.endlessLives_Minutes += reward.endlessLives_Minutes;
                        totalReward.modifierX2_Minutes += reward.modifierX2_Minutes;
                        totalReward.bomb_Minutes += reward.bomb_Minutes;
                        totalReward.rocket_Minutes += reward.rocket_Minutes;
                        totalReward.discoball_Minutes += reward.discoball_Minutes;
                        totalReward.battlepass += reward.battlepass;
                        totalReward.cardsPack += reward.cardsPack;
                        totalReward.cards.push(...reward.cards);
                        totalReward.isChest ||= reward.isChest;
                    }
                }
            }

            if(this.getIsBankTakeAvailable()) {
                totalReward.gold += this.bonusBank;
            }

            this.unpickedRewards = [];
            this.unpickedRewards.push(totalReward);
    
            SaveData.instance.saveEvent(this.eventId);
        }
    }


    takeUnpickedRewards() {
        if(!this.isUnpickedRewardAvailable()) {
            return;
        }
    
        this.applyRewards(this.unpickedRewards);
    
        this.unpickedRewards = [];
        this.isComplete = false;

        if(this.lastAttemptTimestamp === 0) {
            this.lastAttemptTimestamp = Date.now();
        }
    
        SaveData.instance.saveEvent(this.eventId);
    
        this.node.emit("refresh");
    }


    /*Debug*/
    cheatKeys(count: number) {
        this.collectedRockets = this.collectedRockets + count;

        this.bonusBank = this.bonusBank + count * this.bankMultiplier;
        if(this.bonusBank > this.bonusBank_Max) {
            this.bonusBank = this.bonusBank_Max;
        }

        this.checkStageCompletion();

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("refresh");
    }

    setDebugMode(isDebug: boolean) {
        this.isDebugMode = isDebug;
    }

    getIsDebugMode(): boolean {
        return this.isDebugMode;
    }
}


