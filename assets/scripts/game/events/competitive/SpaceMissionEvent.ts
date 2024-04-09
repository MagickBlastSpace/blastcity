import { _decorator, Component, Node } from 'cc';
import { PlayerEventData, SpaceMissionEventData } from '../../../data/EventData';
import { CompetitiveEventBase } from './CompetitiveEventBase';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('SpaceMissionEvent')
export class SpaceMissionEvent extends CompetitiveEventBase {

    @property([SpaceMissionEventData])
    eventData: SpaceMissionEventData[] = [];

    private TOTAL_LEVELS: number = 3;
    private currentLevel: number = 0;


    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
        this.level.on("fail", () => this.handleLevelFail());
    }
    

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;
        this.currentLevel = 0;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "space_mission";
    }



    canParticipate(): boolean {
        return  super.canParticipate();
    }

    activateEvent() {
        super.activateEvent();

        if(!this.isEventAvailable()) {
            //console.log("Unable to start Space Mission");
            return;
        }

        this.currentStep = 0;
        this.currentLevel = 0;

        //console.log("Space Mission started for player at level: ", UserData.instance.getProgress());

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleEventCompletion() {
        this.isComplete = true;
        
        this.takeReward();

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!isComplete || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        if(this.currentStep >= this.eventData[this.currentLevel].levelsCount) {
            this.handleEventCompletion();

            //console.log("Sky Race level completed!");
        }
        else {
            SaveData.instance.saveEvent(this.eventId);
        }
    }

    private handleLevelFail() {
        this.currentStep = 0;

        SaveData.instance.saveEvent(this.eventId);

        //console.log("Sky Race level failed!");
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        UserData.instance.addResource("gold", this.eventData[this.currentLevel].rewardGold);

        this.currentStep = 0;

        this.currentLevel = this.currentLevel < this.TOTAL_LEVELS - 1 ? this.currentLevel + 1 : this.currentLevel;

        this.isComplete = false;
    }

    isRewardAvailable(): boolean {
        return this.isComplete;
    }


    getTotalSteps(): number {
        return this.TOTAL_LEVELS;
    }

    getPlayersCount(): number {
        return this.eventData[this.currentLevel].playersCount;
    }

    getCurrentLevel(): number {
        return this.currentLevel;
    }

    setCurrentLevel(level: number) {
        this.currentLevel = level;
    }

    getTotalStepsOnCurrentLevel(): number {
        return this.eventData[this.currentLevel].levelsCount;
    }



    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

        let player = new PlayerEventData();
        player.playerName = "Player";
        player.progressValue = this.currentStep;

        sortedPlayers.push(player);

        for(let i = 0; i < this.getPlayersCount() - 1; i++) {
            sortedPlayers.push(this.players[i]);
        }

        sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);

        return sortedPlayers;
    }
}


