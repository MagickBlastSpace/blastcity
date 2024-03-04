import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EventBase')
export class EventBase extends Component {

    private startTime: Date;
    private endTime: Date;

    private isStarted: boolean = false;

    private eventId: string = "base";


    init(startHourUTC: number, durationHours: number) {
        const now = new Date();
        this.startTime = new Date(now);
        this.startTime.setUTCHours(startHourUTC, 0, 0, 0);

        this.endTime = new Date(this.startTime.getTime() + durationHours * 60 * 60 * 1000);

        this.isStarted = false;
    }

    isEventAvailable(): boolean {
        const now = new Date();
        return now >= this.startTime && now <= this.endTime;
    }

    restartEvent(): void {
        this.init(this.startTime.getUTCHours(), this.getEventDuration());
    }

    getRemainingTimeString(): string {
        const now = new Date();
        const timeDiff = this.endTime.getTime() - now.getTime();

        if (timeDiff < 0) {
            this.restartEvent();
            return "Event ended. Restarting...";
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getEventDuration(): number {
        return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
    }

    activateEvent() {
        if(this.isEventAvailable() && !this.isStarted && this.canParticipate()) {
            this.isStarted = true;
        }
    }


    refresh() {
        const now = new Date();
        const timeDiff = this.endTime.getTime() - now.getTime();

        if (timeDiff < 0) {
            this.restartEvent();
        }
    }


    canParticipate(): boolean {
        return true;
    }



    getIsStarted(): boolean {
        return this.isStarted;
    }

    setIsStarted(isStarted: boolean) {
        this.isStarted = isStarted;
    }


    getCurrentStage(): number {
        return 0;
    }

    setCurrentStage(stage: number) {}


    getLastTimestamp(): number {
        return 0;
    }

    setLastTimestamp(stamp: number) {}


    getIsComplete(): boolean {
        return true;
    }

    setIsComplete(isComplete: boolean) {}


    getCollectable(): number {
        return 0;
    }

    setCollectable(value: number) {}


    getEventId(): string {
        return this.eventId;
    }


    isWeekly(): boolean {
        return false;
    }
}


