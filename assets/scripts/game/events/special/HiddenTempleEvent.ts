import { _decorator, Component, Node } from 'cc';
import { SpecialEventBase } from './SpecialEventBase';
import { EventRewardData, HiddenTempleEventData } from '../../../data/EventData';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('HiddenTempleEvent')
export class HiddenTempleEvent extends SpecialEventBase {

    @property([HiddenTempleEventData])
    eventData: HiddenTempleEventData[] = [];

    private predictions: string[] = [];


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.eventId = "hidden_temple";

        this.totalLevels = this.eventData.length;
        this.predictions = [];
    }


    makeMove(prediction: string) {
        if(this.collectable <= 0) {
            this.collectable = 20;
            //return;
        }

        this.collectable--;

        this.predictions.push(prediction);

        this.node.emit("refresh");

        this.checkStageCompletion();

        SaveData.instance.saveEvent(this.eventId);
    }


    private checkStageCompletion() {
        if(this.isPredicted()) {
            this.applyRewards(this.eventData[this.currentStage].rewards);

            this.currentStage = this.currentStage + 1;

            this.scheduleOnce(() => {
                this.startStage();
            }, 0.4);
        }
    }

    private isPredicted(): boolean {
        let allTiles = this.getAllTilesToPredict();

        for(let i = 0; i < allTiles.length; i++) {
            if(!this.predictions.includes(allTiles[i])) {
                return false;
            }
        }

        return true;
    }

    private getAllTilesToPredict(): number[] {
        let allNumbers = [];

        if(this.currentStage >= this.eventData.length) {
            return allNumbers;
        }

        for(let i = 0; i < this.eventData[this.currentStage].connectedTiles.length; i++) {
            allNumbers.push(this.eventData[this.currentStage].connectedTiles[i]);
        }

        return allNumbers;
    }



    getData(): HiddenTempleEventData[] {
        return this.eventData;
    }


    activateEvent() {
        super.activateEvent();

        this.startStage();
    }


    private startStage() {
        if(this.currentStage >= this.totalLevels) {
            this.handleEventCompletion();
            return;
        }

        this.predictions = [];

        this.node.emit("refresh");

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleEventCompletion() {
        super.handleEventCompletion();

        this.node.emit("refresh");
    }


    getSpecialPool(): stirng[] {
        return this.poolToPredict;
    }

    setSpecialPool(pool: string[]) {
        if(!pool) {
            return;
        }

        this.poolToPredict = pool;
    }

    getSpecialPredictions(): stirng[] {
        return this.predictions;
    }

    setSpecialPredictions(predictions: string[]) {
        if(!predictions) {
            return;
        }

        this.predictions = predictions;
    }
}


