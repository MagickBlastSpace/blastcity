import { _decorator, Component, Node } from 'cc';
import { EventBase } from './EventBase';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('WeeklyEventBase')
export class WeeklyEventBase extends EventBase {

    private startDayOfWeek: number; // 0 for Sunday, 1 for Monday, and so on


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        this.startDayOfWeek = startDayOfWeek;
        this.calculateStartEndTime(startHourUTC, durationDays);

        this.node.emit("init");
    }

    private calculateStartEndTime(startHourUTC: number, durationDays: number): void {
        const now = new Date();
        const currentDay = now.getUTCDay();

        this.startTime = new Date(now);
        this.startTime.setUTCHours(startHourUTC, 0, 0, 0);

        if (currentDay === this.startDayOfWeek && now.getUTCHours() >= startHourUTC) {
            this.startTime.setUTCDate(this.startTime.getUTCDate() - 7);
        }

        const daysUntilEventStart = (this.startDayOfWeek + 7 - this.startTime.getUTCDay()) % 7;
        this.startTime.setUTCDate(this.startTime.getUTCDate() + daysUntilEventStart);

        this.endTime = new Date(this.startTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

        if (currentDay + durationDays > this.endTime.getUTCDay()) {
            this.startTime.setUTCDate(this.startTime.getUTCDate() - 7);
            this.endTime = new Date(this.startTime.getTime() + durationDays * 24 * 60 * 60 * 1000);
        }

        let timeDiff = this.endTime.getTime() - now.getTime();

        while(timeDiff < 0) {
            this.startTime.setUTCDate(this.startTime.getUTCDate() + 7);
            this.endTime = new Date(this.startTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

            timeDiff = this.endTime.getTime() - now.getTime();
        }

        console.log("Start time: " + this.eventId + " " + this.startTime);
        console.log("End time: " + this.eventId + " " + this.endTime);
    }

    private formatTimeUnits(value: number): string {
        return value.toString().padStart(2, '0');
    }

    getRemainingTimeString(): string {
        if(!this.endTime) {
            return "";
        }

        const now = new Date();
        const timeDiff = this.endTime.getTime() - now.getTime();

        if (timeDiff < 0) {
            this.restartEvent();
            return "Event ended. Restarting...";
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${this.formatTimeUnits(days)} ${Localization.instance.getLabelByKey("misc.days")} ${this.formatTimeUnits(hours)} ${Localization.instance.getLabelByKey("misc.hours")}`;
    }

    restartEvent() {
        this.lastAttemptTimestamp = 0;

        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);


    }

    isWeekly(): boolean {
        return true;
    }


    private getWeekNumber(date: Date): number {
        const targetDate = new Date(date.valueOf());
        const dayNumber = (date.getUTCDay() + 6) % 7;
        targetDate.setUTCDate(targetDate.getUTCDate() - dayNumber + 3);
        const firstThursday = new Date(targetDate.getUTCFullYear(), 0, 4);
        firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
        const weekNumber = Math.ceil((targetDate.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

        return weekNumber;
    }
}


