import { _decorator, Component, Node } from 'cc';
import { SkyRaceEvent } from './SkyRaceEvent';
import { SaveData } from '../../../data/SaveData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('WeeklyContestEvent')
export class WeeklyContestEvent extends SkyRaceEvent {

    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
    }

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isComplete = false;
        this.isStarted = true;

        this.eventId = "weekly_contest";
    }


    canParticipate(): boolean {
        return  super.canParticipate();
    }

    activateEvent() {}


    private handleEventCompletion() {
        //let sortedPlayers = this.sortPlayersByProgress(); find place etc.
        this.isComplete = true;

        SaveData.instance.saveEvent(this.eventId);
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!this.isEventAvailable() || !isComplete || !this.canParticipate()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        SaveData.instance.saveEvent(this.eventId);
    }


    takeReward() {
        if(!this.isRewardAvailable()) {
            return;
        }

        UserData.instance.addResource("gold", this.REWARD_COINS);

        this.isComplete = false;
    }

    isRewardAvailable(): boolean {
        return this.isComplete;
    }


    restartEvent() {
        this.handleEventCompletion();

        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);
    }
}


