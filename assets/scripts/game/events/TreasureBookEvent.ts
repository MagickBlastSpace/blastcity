import { _decorator, Component, Node } from 'cc';
import { RocketFeverEvent } from './RocketFeverEvent';
const { ccclass, property } = _decorator;

@ccclass('TreasureBookEvent')
export class TreasureBookEvent extends RocketFeverEvent {

    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.eventId = "treasure_book";
    }


    handleLevelCompletion(statistics: LevelProgressStatisticsData) {
        if(this.isComplete || !this.canParticipate() || !this.isStarted || !this.isEventAvailable()) {
            return;
        }

        this.collectedRockets = this.collectedRockets + statistics.redDestroyed;

        this.checkStageCompletion();

        this.node.emit("progress", statistics.redDestroyed);
    }
}


