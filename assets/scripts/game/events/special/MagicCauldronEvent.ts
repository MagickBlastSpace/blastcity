import { _decorator, Component, Node } from 'cc';
import { SpecialEventBase } from './SpecialEventBase';
import { MagicCauldronEventData } from '../../../data/EventData';
import { SaveData } from '../../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('MagicCauldronEvent')
export class MagicCauldronEvent extends SpecialEventBase {

    @property([MagicCauldronEventData])
    eventData: MagicCauldronEventData[] = [];

    private poolToPredict: string[] = [];

    private predictions: string[] = [];


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.eventId = "magic_cauldron";

        this.totalLevels = this.eventData.length;
    }


    getCurrentPool(): string[] {
        if(this.currentStage >= this.eventData.length) {
            let pool = [];
            return pool;
        }
        return this.eventData[this.currentStage].pool;
    }

    getPredictions(): string[] {
        return this.predictions;
    }


    makeMove(prediction: string) {
        if(this.collectable <= 0) {
            this.collectable = 20;
            //return;
        }

        this.collectable--;

        this.predictions.push(prediction);

        this.node.emit("refresh");

        if(this.poolToPredict.length === 0) {
            this.poolToPredict = this.shufflePool(this.getCurrentPool());
        }

        if(this.predictions.length >= this.poolToPredict.length) {
            this.checkStageCompletion();
        }

        SaveData.instance.saveEvent(this.eventId);
    }


    private checkStageCompletion() {
        if(this.isPredicted()) {
            this.applyRewards(this.eventData[this.currentStage].rewards);
            
            this.currentStage = this.currentStage + 1;
        }
        
        this.startStage();
    }

    private isPredicted(): boolean {
        for(let i = 0; i < this.poolToPredict.length; i++) {
            if(this.poolToPredict[i] !== this.predictions[i]) {
                return false;
            }
        }

        return true;
    }



    getData(): MagicCauldronEventData[] {
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

        this.poolToPredict = this.shufflePool(this.eventData[this.currentStage].pool);

        this.predictions = [];

        this.node.emit("refresh");

        SaveData.instance.saveEvent(this.eventId);
    }



    private shufflePool(pool: string[]): string[] {
        let newPool = [];

        for(let i = 0; i < pool.length; i++) {
            newPool.push(pool[i]);
        }

        let currentIndex = pool.length;
        let randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [newPool[currentIndex], newPool[randomIndex]] = [newPool[randomIndex], newPool[currentIndex]];
        }

        return newPool;
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


