import { _decorator, Component, Node } from 'cc';
import { TeamTreasureEvent } from './team/TeamTreasureEvent';
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

    getTotalTeamProgress(): number {
        return this.currentStep;
    }
}


