declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { CompetitiveEventBase } from './CompetitiveEventBase';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
import { EventRewardData, PlayerEventData } from '../../../data/EventData';
import { Net } from '../../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('SkyRaceEvent')
export class SkyRaceEvent extends CompetitiveEventBase {

    @property([EventRewardData])
    rewards: EventRewardData[] = [];

    private TOTAL_LEVELS: number = 15;

    private playerPlace: number = -1;
    private isRewardPicked: boolean = false;

    
    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
    }
    

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;
        this.playerPlace = -1;

        this.isStarted = false;
        this.isComplete = false;

        this.eventId = "sky_race";
    }



    canParticipate(): boolean {
        const now = new Date();
        const timeDiffInMillis = this.endTime.getTime() - now.getTime();
        const hoursDiff = timeDiffInMillis / (1000 * 60 * 60);

        return  super.canParticipate() && hoursDiff > 1;
    }

    activateEvent() {
        if(this.multiplayerChannelId === 0) {
            console.log("Multiplayer is not ready");
            return;
        }

        if(!this.isEventAvailable() || this.isStarted || !this.canParticipate()) {
            return;
        }

        this.isStarted = true;
        this.isComplete = false;

        this.currentStep = 0;

        this.lastAttemptTimestamp = Date.now();

        SaveData.instance.saveEvent(this.eventId);

        Net.instance.publishScore(this.eventId, "sky_race_" + this.multiplayerChannelId, this.currentStep);

        this.updateMultiplayerData();
    }


    private handleEventCompletion() {
        this.isComplete = true;

        this.sortPlayersByProgress();
        this.playerPlace = this.players.findIndex(player => player.playerName === UserData.instance.getPlayerName());

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!isComplete || !this.isStarted || !this.isEventAvailable() || this.isComplete) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        Net.instance.publishScore(this.eventId, "sky_race_" + this.multiplayerChannelId, this.currentStep);

        if(this.currentStep >= this.TOTAL_LEVELS) {
            this.handleEventCompletion();
        }
        else {
            SaveData.instance.saveEvent(this.eventId);
        }
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        this.applyReward(rewards[this.playerPlace]);

        this.currentStep = 0;

        this.isStarted = false;
        this.isComplete = false;
    }

    isRewardAvailable(): boolean {
        return this.isComplete && this.playerPlace > -1 && this.playerPlace < 3;
    }


    getTotalSteps(): number {
        return this.TOTAL_LEVELS;
    }


    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

        sortedPlayers = this.players;

        //sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);

        if(this.playerPlace >= 0) {
            let playerIndex = sortedPlayers.findIndex(player => player.playerName === UserData.instance.getPlayerName());
            if(playerIndex !== this.playerPlace) {
                let bufferPlayer = new PlayerEventData();
                bufferPlayer.playerName = sortedPlayers[this.playerPlace].playerName;
                bufferPlayer.progressValue = sortedPlayers[this.playerPlace].progressValue;

                let player = new PlayerEventData();
                player.playerName = sortedPlayers[playerIndex].playerName;
                player.progressValue = sortedPlayers[playerIndex].progressValue;
                
                sortedPlayers[this.playerPlace] = player;
                sortedPlayers[playerIndex] = bufferPlayer;
            }
        }

        return sortedPlayers;
    }


    getPlayerPlace(): number {
        return this.playerPlace;
    }
}


