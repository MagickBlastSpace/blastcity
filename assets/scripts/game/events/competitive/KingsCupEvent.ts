declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { WeeklyContestEvent } from './WeeklyContestEvent';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('KingsCupEvent')
export class KingsCupEvent extends WeeklyContestEvent {

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isStarted = false;

        this.eventId = "kings_cup";
    }


    activateEvent() {
        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.isStarted = true;
        }

        if(!this.isEventAvailable()) {
            return;
        }

        this.isComplete = false;

        SaveData.instance.saveEvent(this.eventId);
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        UserData.instance.addResource("gold", this.REWARD_COINS);

        this.isComplete = false;
        this.isStarted = false;

        SaveData.instance.saveEvent(this.eventId);
    }

    private handleLevelCompletion(isComplete: boolean) {
        if(!this.isEventAvailable() || !isComplete || !this.canParticipate()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        gamepush.player.set('score_kings_cup', this.currentStep);
        gamepush.player.sync();

        SaveData.instance.saveEvent(this.eventId);
    }
}


