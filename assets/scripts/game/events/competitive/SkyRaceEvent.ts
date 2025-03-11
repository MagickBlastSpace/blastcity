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

    private readonly UPDATE_INTERVAL: number = 50000;
    private readonly PROGRESS_CHANCE: number = 0.3;
    
    private progressInterval: any = null;

    
    onLoad() {
        this.players = [];
    }

    
    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
        this.startProgressUpdateLoop();
    }

    onDestroy() {
        this.stopProgressUpdateLoop();
    }

    private startProgressUpdateLoop() {
        if (this.progressInterval) return;

        this.progressInterval = setInterval(() => {
            let updated = false;

            for (let player of this.players) {
                if(player.playerId !== UserData.instance.getPlayerId()) {
                    if (Math.random() < this.PROGRESS_CHANCE) {
                        if(player.progressValue < this.TOTAL_LEVELS) {
                            player.progressValue += 1;

                            if(player.progressValue > this.TOTAL_LEVELS) {
                                player.progressValue = this.TOTAL_LEVELS;
                            }
                            updated = true;
                        }
                    }
                }
            }

            if (updated) {
                this.node.emit("refresh");

                SaveData.instance.saveEvent(this.eventId);
            }
        }, this.UPDATE_INTERVAL);
    }

    private stopProgressUpdateLoop() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;
        this.playerPlace = -1;

        this.isStarted = false;
        this.isComplete = false;

        this.isRewardPicked = false;

        this.eventId = "sky_race";
    }


    canParticipate(): boolean {
        const now = new Date();
        const timeDiffInMillis = this.endTime.getTime() - now.getTime();
        const hoursDiff = timeDiffInMillis / (1000 * 60 * 60);

        return  super.canParticipate() && hoursDiff > 1;
    }

    activateEvent() {
        if(!this.isEventAvailable() || this.isStarted || !this.canParticipate()) {
            return;
        }

        this.isStarted = true;
        this.isComplete = false;

        this.isRewardPicked = false;

        this.currentStep = 0;
        this.playerPlace = -1;

        this.lastAttemptTimestamp = Date.now();

        this.resetBots();

        SaveData.instance.saveEvent(this.eventId);

        this.updateMultiplayerData();
    }


    private resetBots() {
        this.players = [];

        let player = new PlayerEventData();
        player.playerName = UserData.instance.getPlayerName();
        player.playerId = UserData.instance.getPlayerId();
        player.clanName = UserData.instance.getClanName();
        player.progressValue = 0;

        this.players.push(player);

        let bots = UserData.instance.getRandomPlayers(4);

        for(let i = 0; i < bots.length; i++) {
            bots[i].progressValue = 0;
            this.players.push(bots[i]);
        }
    }


    private handleEventCompletion() {
        this.isComplete = true;

        this.sortPlayersByProgress();
        this.playerPlace = this.players.findIndex(player => player.playerId === UserData.instance.getPlayerId());

        if(this.playerPlace > 2) {
            this.isComplete = false;
            this.isStarted = false;
        }

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!isComplete || !this.isStarted || !this.isEventAvailable() || this.isComplete) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        let player = this.players.find(p => p.playerId === UserData.instance.getPlayerId());
        if (player) {
            player.progressValue = this.currentStep;
        }

        if(this.currentStep >= this.TOTAL_LEVELS) {
            this.handleEventCompletion();
        }
        else {
            SaveData.instance.saveEvent(this.eventId);
        }

        this.node.emit("progress", 1);
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        this.applyReward(this.rewards[this.playerPlace]);

        this.currentStep = 0;
        this.playerPlace = -1;

        this.isStarted = false;
        this.isComplete = false;
        this.isRewardPicked = true;

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("refresh");
    }

    isRewardAvailable(): boolean {
        if(this.isComplete && (this.playerPlace < 0 || this.playerPlace === undefined)) {
            this.playerPlace = this.players.findIndex(player => player.playerId === UserData.instance.getPlayerId());
        }

        //console.log(this.isComplete + " - " + this.playerPlace + " - " + this.isRewardPicked);
        
        return this.isComplete && this.playerPlace > -1 && this.playerPlace < 3 && !this.isRewardPicked;
    }


    getTotalSteps(): number {
        return this.TOTAL_LEVELS;
    }


    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];

        if(this.players.length === 0) {
            this.resetBots();
        }

        let player = this.players.find(p => p.playerId === UserData.instance.getPlayerId());
        if (player) {
            player.playerName = UserData.instance.getPlayerName();
        }

        sortedPlayers = this.players;

        //sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);
        if(this.isComplete && (this.playerPlace < 0 || this.playerPlace === undefined)) {
            this.playerPlace = sortedPlayers.findIndex(player => player.playerId === UserData.instance.getPlayerId());
        }

        sortedPlayers.sort((a, b) => b.progressValue - a.progressValue);

        if(this.playerPlace >= 0) {
            let playerIndex = sortedPlayers.findIndex(player => player.playerId === UserData.instance.getPlayerId());
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

    setPlayerPlace(place: number) {
        this.playerPlace = place;
    }


    setIsTotalRewardTaken(isTaken: boolean) {
        this.isRewardPicked = isTaken;
    }

    getIsTotalRewardTaken(): boolean {
        return this.isRewardPicked;
    }

    async updateMultiplayerData() {
        this.node.emit("refresh");
    }

    getBots(): PlayerEventData[] {
        return this.players;
    }

    setBots(bots: PlayerEventData[]) {
        this.players = bots;
    }
}


