import { _decorator, Component, Node } from 'cc';
import { SpecialEventBase } from './SpecialEventBase';
import { EventRewardData, MagicCauldronEventData } from '../../../data/EventData';
import { SaveData } from '../../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('MagicCauldronEvent')
export class MagicCauldronEvent extends SpecialEventBase {

    @property([MagicCauldronEventData])
    eventData: MagicCauldronEventData[] = [];

    @property([EventRewardData])
    grandRewardData: EventRewardData[] = [];

    private poolToPredict: string[] = [];

    private predictions: string[] = [];

    private hints: string[] = [];

    private history: string[][] = [];


    onLoad() {
        this.hints = [];
        this.poolToPredict = [];
        this.predictions = [];
    }
    
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

        console.log("Winemaking Before Move State: " + this.predictions);

        this.collectable--;

        const index = this.predictions.indexOf("undefined");
        if (index !== -1) {
            this.predictions[index] = prediction;
        }
        else {
            this.predictions.push(prediction);
        }

        this.fillPredictionsHints();

        this.node.emit("refresh");

        let curPool = this.getCurrentPool();
        
        if(!this.isPoolsAreEqual(this.poolToPredict, curPool)) {
            this.poolToPredict = this.shufflePool(curPool);
            
            if(this.hints.length !== this.poolToPredict.length) {
                this.hints = [];
                for(let i = 0; i < this.poolToPredict.length; i++) {
                    this.hints.push("undefined");
                }
            }
        }

        console.log("Winemaking After Move State: " + this.predictions);
        console.log("Winemaking Pool To Predict: " + this.poolToPredict);

        if(this.predictions.length >= this.poolToPredict.length && !this.predictions.includes("undefined")) {
            this.checkStageCompletion();
        }

        SaveData.instance.saveEvent(this.eventId);
    }

    isPoolsAreEqual(pool1: string[], pool2: string[]): boolean {
        if(pool1.length !== pool2.length) {
            return false;
        }

        if(pool1.length === 0 || pool2.length === 0) {
            return false;
        }

        for(let i = 0; i < pool1.length; i++) {
            if(!pool2.includes(pool1[i])) {
                return false;
            }
        }

        return true;
    }

    removeColor(color: string) {
        if(color === "" || color === "none" || color === "undefined") {
            return;
        }

        if(this.hints.includes(color)) {
            return;
        }

        console.log("Winemaking Before Unpick State: " + this.predictions);

        const index = this.predictions.indexOf(color);
        if (index !== -1) {
            this.predictions[index] = "undefined";
        }
        else {
            return;
        }

        this.collectable++;

        this.node.emit("refresh");

        console.log("Winemaking After Unpick State: " + this.predictions);

        SaveData.instance.saveEvent(this.eventId);
    }


    private checkStageCompletion() {
        if(this.isPredicted()) {
            //this.applyRewards(this.eventData[this.currentStage].rewards);
            this.unpickedRewards = [];
            this.unpickedRewards.push(this.eventData[this.currentStage].rewards[0]);

            this.hints = [];
            this.poolToPredict = [];
            this.history = [];
            
            this.currentStage = this.currentStage + 1;
        }
        else {
            let historyPack = [];

            for(let i = 0; i < this.predictions.length; i++) {
                historyPack.push(this.predictions[i]);
            }

            this.history.push(historyPack);
        }

        this.startStage();
    }

    private isPredicted(): boolean {
        let isPredicted = true;

        for(let i = 0; i < this.poolToPredict.length; i++) {
            if(this.poolToPredict[i] !== this.predictions[i]) {
                isPredicted = false;
            }
            else {
                this.hints[i] = this.predictions[i];
            }
        }

        this.node.emit("stage_end");

        return isPredicted;
    }


    takeUnpickedRewards() {
        this.applyRewards(this.unpickedRewards);

        this.unpickedRewards = [];

        SaveData.instance.saveEvent(this.eventId);
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

        if(this.poolToPredict.length === 0) {
            this.poolToPredict = this.shufflePool(this.getCurrentPool());
        }

        if(this.hints.length !== this.poolToPredict.length) {
            this.hints = [];
            for(let i = 0; i < this.poolToPredict.length; i++) {
                this.hints.push("undefined");
            }
        }

        this.predictions = [];

        this.fillPredictionsHints();

        SaveData.instance.saveEvent(this.eventId);
    }

    private fillPredictionsHints() {
        if(this.predictions.length < this.hints.length) {
            let nextColor = this.hints[this.predictions.length];

            if(nextColor !== "undefined") {
                this.predictions.push(nextColor);

                this.fillPredictionsHints();
            }
        }
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

        this.applyRewards(this.grandRewardData);

        this.node.emit("refresh");
    }


    getSpecialPool(): string[] {
        return this.poolToPredict;
    }

    setSpecialPool(pool: string[]) {
        if(!pool) {
            return;
        }

        this.poolToPredict = pool;
    }

    getSpecialPredictions(): string[] {
        return this.predictions;
    }

    setSpecialPredictions(predictions: string[]) {
        if(!predictions) {
            return;
        }

        this.predictions = predictions;
    }

    getSpecialHints(): string[] {
        return this.hints;
    }

    setSpecialHints(hints: string[]) {
        if(!hints) {
            return;
        }

        this.hints = hints;
    }

    getHistory(): string[][] {
        return this.history;
    }

    setHistory(history: string[][]) {
        this.history = history;
    }


    getReward(): EventRewardData {
        if(this.currentStage >= this.eventData.length) {
            return this.eventData[this.eventData.length - 1].rewards[0];
        }
        return this.eventData[this.currentStage].rewards[0];
    }

    getGrandRewardData(): EventRewardData {
        return this.grandRewardData[0];
    }


    isInteractable(): boolean {
        if(!this.isEventAvailable()) {
            return false;
        }

        if(this.isComplete) {
            return false;
        }

        return true;
    }
}


