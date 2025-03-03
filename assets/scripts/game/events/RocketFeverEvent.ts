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

    private collectedRockets: number = 0;
    private currentStage: number = 0;

    private takenRewards: number[] = [];

    private isComplete: boolean = false;


    start() {
        this.level.on("complete_statistics", (stats) => this.handleLevelCompletion(stats));
    }
    
    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStage = 0;
        this.collectedRockets = 0;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "rocket_fever";
    }


    handleLevelCompletion(statistics: LevelProgressStatisticsData) {
        if(this.isComplete || !this.canParticipate() || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        this.collectedRockets = this.collectedRockets + statistics.rocketsDestroyed;

        this.checkStageCompletion();

        this.node.emit("refresh");
        this.node.emit("progress", statistics.rocketsDestroyed);
    }

    checkStageCompletion() {
        if(this.eventData.length <= this.currentStage) {
            this.handleEventCompletion();
            return;
        }

        if(this.collectedRockets >= this.eventData[this.currentStage].stageStep) {
            this.collectedRockets = this.collectedRockets - this.eventData[this.currentStage].stageStep;

            //this.applyRewards(this.eventData[this.currentStage].rewards);

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

        this.node.emit("refresh");
    }


    getCollectable(): number {
        return this.collectedRockets;
    }

    setCollectable(value: number) {
        this.collectedRockets = value;

        this.node.emit("refresh");
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
            return;
        }

        this.currentStage = 0;

        SaveData.instance.saveEvent(this.eventId);
    }


    getTimeProgress(): number {
        return this.getCollectable() / this.getCurrentStageStep();
    }


    isRewardTaken(index: number): boolean {
        return this.takenRewards.includes(index);
    }

    takeReward(index: number) {
        if(!this.takenRewards.includes(index)) {
            this.takenRewards.push(index);

            this.applyRewards(this.eventData[index].rewards);
        }

        this.node.emit("refresh");
    }

    isRewardAvailable(): boolean {
        for(let i = 0; i < this.currentStage; i++) {
            if(!this.takenRewards.includes(i)) {
                return true;
            }
        }

        return false;
    }

    getTotalStages(): number {
        return this.eventData.length;
    }


    isInteractable(): boolean {
        if(!this.isEventAvailable()) {
            return false;
        }

        if(this.isComplete && !this.isRewardAvailable()) {
            return false;
        }

        return true;
    }
}


