import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from '../WeeklyEventBase';
import { SaveData } from '../../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('SpecialEventBase')
export class SpecialEventBase extends WeeklyEventBase {
    @property(Node)
    level: Node = null;

    private collectable: number = 0;
    private currentStage: number = 0;

    private isComplete: boolean = false;

    private totalLevels: number = 7;


    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
    }
    
    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStage = 0;
        this.collectable = 0;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "";

        this.totalLevels = 0;
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!isComplete || !this.isStarted || !this.isEventAvailable() || this.isComplete) {
            return;
        }

        this.collectable = this.collectable + 1;

        SaveData.instance.saveEvent(this.eventId);
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
        return this.collectable;
    }

    setCollectable(value: number) {
        this.collectable = value;
    }


    getTotalLevels(): number {
        return this.totalLevels;
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
        this.collectable = 0;

        SaveData.instance.saveEvent(this.eventId);
    }
}


