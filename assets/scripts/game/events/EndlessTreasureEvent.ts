import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from './WeeklyEventBase';
import { Shop } from '../Shop';
import { EventRewardData } from '../../data/EventData';
import { SaveData } from '../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('EndlessTreasureEvent')
export class EndlessTreasureEvent extends WeeklyEventBase {

    @property(Shop)
    shop: Shop;

    @property([EventRewardData])
    rewards: EventRewardData[] = [];

    private currentStage: number = 0;

    private ONE_STAGE_STEPS: number = 3;

    private PAYABLE_STAGES: number[] = [3, 9, 15];


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.isStarted = true;
        this.isComplete = false;

        this.currentStage = 0;

        this.eventId = "endless_treasure";
    }

    
    async takeCurrentReward() {
        if (this.lastAttemptTimestamp === 0) {
            this.lastAttemptTimestamp = Date.now();
        }

        if(this.PAYABLE_STAGES.includes(this.currentStage)) {
            const isSuccess = await this.shop.buyByTag("endless_treasure_" + this.currentStage);
    
            if (!isSuccess) {
                console.warn("Покупка не прошла. Награда не выдана.");
                return;
            }

            this.applyReward(this.rewards[this.currentStage]);

            this.currentStage = this.currentStage + 1;

            SaveData.instance.saveEvent(this.eventId);

            this.node.emit("refresh");
        }
        else {
            this.applyReward(this.rewards[this.currentStage]);

            this.currentStage = this.currentStage + 1;

            SaveData.instance.saveEvent(this.eventId);

            this.node.emit("refresh");
        }
    }


    getCurrentPoolRewards(): EventRewardData[] {
        let pool = [];

        let mod = this.currentStage % this.ONE_STAGE_STEPS;

        if(mod === 0) {
            for(let i = this.currentStage; i < this.currentStage + this.ONE_STAGE_STEPS; i++) {
                pool.push(this.rewards[i]);
            }
        }
        else if(mod === 1) {
            for(let i = this.currentStage - 1; i < this.currentStage + this.ONE_STAGE_STEPS - 1; i++) {
                pool.push(this.rewards[i]);
            }
        }
        else if(mod === 2) {
            for(let i = this.currentStage - 2; i < this.currentStage + this.ONE_STAGE_STEPS - 2; i++) {
                pool.push(this.rewards[i]);
            }
        }

        return pool;
    }

    getCurrentStepInStage(): number {
        return this.currentStage % this.ONE_STAGE_STEPS;
    }


    restartEvent(): void {
        this.lastAttemptTimestamp = 0;

        this.currentStage = 0;

        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);

        SaveData.instance.saveEvent(this.eventId);
    }


    isPayableStage(stage: number): boolean {
        return this.PAYABLE_STAGES.includes(stage);
    }

    isPayableStep(step: number): boolean {
        let stageToObserve = this.convertStepInStage(step);

        return this.PAYABLE_STAGES.includes(stageToObserve);
    }

    convertStepInStage(step: number): number {
        let curStep = this.getCurrentStepInStage();

        return this.currentStage + (step - curStep);
    }


    getCurrentStage(): number {
        return this.currentStage;
    }


    setCurrentStage(stage: number) {
        this.currentStage = stage;

        this.node.emit("refresh");
    }
}


