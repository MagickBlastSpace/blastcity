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
            //console.log("Unable to start King's Cup");
            return;
        }

        this.currentStep = 0;
        this.isComplete = false;

        //console.log("King's Cup started for player at level: ", UserData.instance.getProgress());

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
}


