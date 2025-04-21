import { _decorator, Component, Node } from 'cc';
import { TeamTreasureEvent } from './team/TeamTreasureEvent';
import { SaveData } from '../../data/SaveData';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('TroyanHorseEvent')
export class TroyanHorseEvent extends TeamTreasureEvent {
    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isRewardPicked = [];
        for(let i = 0; i < this.rewards.length; i++) {
            this.isRewardPicked.push(false);
        }
        
        this.eventId = "troyan_horse";
    }

    activateEvent() {
        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.isStarted = true;

            this.lastAttemptTimestamp = Date.now();
        }
    }

    getTotalTeamProgress(): number {
        return this.currentStep;
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!this.isEventAvailable() || !isComplete || !this.canParticipate()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        if(UserData.instance.isModifierX2()) {
            this.currentStep = this.currentStep + 1;
        }

        SaveData.instance.saveEvent(this.eventId);

        this.node.emit("progress", 1);
    }


    updateMultiplayerData() {
        this.node.emit("refresh");
    }
}


