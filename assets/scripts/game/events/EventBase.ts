import { _decorator, Component, Node } from 'cc';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { EventRewardData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('EventBase')
export class EventBase extends Component {

    private startTime: Date;
    private endTime: Date;

    private isStarted: boolean = false;

    private eventId: string = "base";

    private lastAttemptTimestamp: number = 0;

    @property
    MIN_LEVEL_REQUIRED = 0;
    @property
    END_TIME_OFFSET = 0;


    init(startHourUTC: number, durationHours: number) {
        const now = new Date();
        this.startTime = new Date(now);
        this.startTime.setUTCHours(startHourUTC, 0, 0, 0);

        this.endTime = new Date(this.startTime.getTime() + durationHours * 60 * 60 * 1000);

        let timeDiff = this.startTime.getTime() - now.getTime();

        while(timeDiff > 0) {
            this.startTime.setUTCDate(this.startTime.getUTCDate() - 1);
            this.endTime = new Date(this.startTime.getTime() + durationHours * 60 * 60 * 1000);

            timeDiff = this.startTime.getTime() - now.getTime();
        }

        this.isStarted = false;

        /*console.log("Start time: " + this.startTime);
        console.log("End time: " + this.endTime);*/
    }

    isEventAvailable(): boolean {
        const now = new Date();
        return now >= this.startTime && now <= this.endTime;
    }

    restartEvent(): void {
        this.init(this.startTime.getUTCHours(), this.getEventDuration());

        SaveData.instance.saveEvent(this.eventId);
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

            this.lastAttemptTimestamp = Date.now();
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
        return this.isRequiredLevelReached();
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


    getLevelRequired(): number {
        return this.MIN_LEVEL_REQUIRED;
    }

    isRequiredLevelReached(): boolean {
        return (UserData.instance.getProgress() + 1) >= this.MIN_LEVEL_REQUIRED;
    }


    getCurrentLevel(): number {
        return 0;
    }

    setCurrentLevel(level: number) {}

    getHp(): number {
        return 0;
    }

    setHp(newHp: number) {}


    getSpecialPool(): stirng[] {
        let pool = [];
        return pool;
    }

    setSpecialPool(pool: string[]) {}

    getSpecialPredictions(): stirng[] {
        let predictions = [];
        return predictions;
    }

    setSpecialPredictions(predictions: string[]) {}


    getLastTimestamp(): number {
        return this.lastAttemptTimestamp;
    }

    setLastTimestamp(stamp: number) {
        this.lastAttemptTimestamp = stamp;

        if(this.startTime > this.lastAttemptTimestamp) {
            this.restartEvent();
        }
    }


    private applyRewards(rewards: EventRewardData[]) {
        for(let i = 0; i < rewards.length; i++) {
            UserData.instance.addResource("gold", rewards[i].gold);
            //remain rewards TBD
        }
    }
}


