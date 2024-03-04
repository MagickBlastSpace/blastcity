import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from './WeeklyEventBase';
import { EventRewardData, RocketFeverEventData } from '../../data/EventData';
import { LevelProgressStatisticsData } from '../../data/Statistics';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('RocketFeverEvent')
export class RocketFeverEvent extends WeeklyEventBase {

    @property(Node)
    level: Node = null;

    @property([RocketFeverEventData])
    eventData: RocketFeverEventData[] = [];
    
    private MIN_LEVEL_REQUIRED: number = 27;

    private collectedRockets: number = 0;
    private currentStage: number = 0;

    private isComplete: boolean = false;


    start() {
        this.level.on("complete_statistics", (stats) => this.handleLevelCompletion(stats));
    }
    
    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStage = 0;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "rocket_fever";
    }


    handleLevelCompletion(statistics: LevelProgressStatisticsData) {
        if(!this.isStarted || this.isComplete) {
            return;
        }

        this.collectedRockets = this.collectedRockets + statistics.rocketsDestroyed;

        this.checkStageCompletion();
    }

    checkStageCompletion() {
        if(this.eventData.length <= this.currentStage) {
            this.handleEventCompletion();
            return;
        }

        if(this.collectedRockets >= this.eventData[this.currentStage].stageStep) {
            this.collectedRockets = this.collectedRockets - this.eventData[this.currentStage].stageStep;

            UserData.instance.addResource("gold", this.eventData[this.currentStage].rewardGold);

            this.currentStage = this.currentStage + 1;

            this.checkStageCompletion();
        }
        else {
            SaveData.instance.saveEvent(this.eventId);
        }
    }


    handleEventCompletion() {
        this.isComplete = true;

        SaveData.instance.saveEvent(this.eventId);
    }


    getCurrentStage(): number {
        return this.currentStage;
    }


    setCurrentStage(stage: number) {
        this.currentStage = stage;
    }


    getCollectable(): number {
        return this.collectedRockets;
    }

    setCollectable(value: number) {
        this.collectedRockets = value;
    }


    getCurrentStageStep(): number {
        if(!this.isStarted || this.isComplete || this.currentStage >= this.eventData.length) {
            return 0;
        }

        return this.eventData[this.currentStage].stageStep;
    }


    getData(): RocketFeverEventData[] {
        return this.eventData;
    }


    getIsComplete(): boolean {
        return this.isComplete;
    }

    setIsComplete(isComplete: boolean) {
        this.isComplete = isComplete;
    }



    activateEvent() {
        super.activateEvent();

        if(!this.isEventAvailable()) {
            console.log("Unable to start Rocket Fever");
            return;
        }

        this.currentStage = 0;

        console.log("Rocket Fever started");
    }
}


