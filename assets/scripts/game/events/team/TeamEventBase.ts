declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from '../WeeklyEventBase';
import { PlayerEventData } from '../../../data/EventData';
import { Clans } from '../../Clans';
import { Net } from '../../../net/Net';
import { SaveData } from '../../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('TeamEventBase')
export class TeamEventBase extends WeeklyEventBase {

    @property(Node)
    level: Node = null;

    @property(Clans)
    clans: Clans = null;

    @property([PlayerEventData])
    players: PlayerEventData[] = [];

    private currentStep: number = 0;

    private isComplete: boolean = false;

    private isUpdating: boolean = false;

    
    onLoad() {
        this.players = [];
    }


    activateEvent() {
        if(!this.clans.isJoined()) { //TBD 10 players in clan minimum
            return;
        }

        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.currentStep = 0;

            this.isStarted = true;
            this.isComplete = false;

            this.lastAttemptTimestamp = Date.now();

            Net.instance.publishScore(this.eventId, this.eventId + "_" + this.clans.getClanId() + "_" + this.getWeekNumber(this.startTime), this.currentStep);

            this.updateMultiplayerData();

            SaveData.instance.saveEvent(this.eventId);
        }
    }


    refresh() {
        this.node.emit("refresh");
    }

    
    sortPlayersByProgress(): PlayerEventData[] {
        return this.players;
    }
    


    getIsComplete(): boolean {
        return this.isComplete;
    }

    setIsComplete(isComplete: boolean) {
        this.isComplete = isComplete;
    }


    getCurrentStage(): number {
        return this.currentStep;
    }

    setCurrentStage(stage: number) {
        this.currentStep = stage;
    }


    public updateMultiplayerData() {
        this.refresh();
    }


    restartEvent(): void {
        console.log("Restarting Multiplayer Event: " + this.eventId);
        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);
    }


    getTotalPlayers(): number {
        return this.players.length;
    }

    isJoinedClan(): boolean {
        return this.clans.isJoined();
    }

    getClanName(): string {
        return this.clans.getClanName();
    }
}


