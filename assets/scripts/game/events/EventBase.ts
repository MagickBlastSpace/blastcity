declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { EventRewardData, PlayerEventData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('EventBase')
export class EventBase extends Component {

    private startTime: Date;
    private endTime: Date;

    private isStarted: boolean = false;

    private eventId: string = "base";

    private lastAttemptTimestamp: number = 0;

    private unpickedRewards: EventRewardData[] = [];

    private isPositionUpdated: boolean = false;

    @property
    MIN_LEVEL_REQUIRED = 0;
    @property
    END_TIME_OFFSET = 0;

    @property
    isTutorialComplete: boolean = false;


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

        this.node.emit("init");
    }

    isEventAvailable(): boolean {
        const now = new Date();
        return now > this.startTime && now < this.endTime;
    }

    restartEvent(): void {
        this.init(this.startTime.getUTCHours(), this.getEventDuration());

        SaveData.instance.saveEvent(this.eventId);
    }

    getRemainingTimeString(): string {
        if(!this.endTime) {
            return "";
        }
        
        const now = new Date();
        const timeDiff = this.endTime.getTime() - now.getTime();

        if (timeDiff < 0) {
            if(this.lastAttemptTimestamp !== 0) {
                this.lastAttemptTimestamp = Date.now();
            }

            this.restartEvent();

            return "Event ended. Restarting...";
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    getRemainingCooldownString(): string {
        return "";
    }

    getEventDuration(): number {
        return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
    }

    getTimeProgress(): number {
        let duration = this.getEventDuration();

        const now = new Date();
        let timePassed = (now.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);

        let timeProgress = timePassed / duration;

        return timeProgress;
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

    isGamePushBased(): boolean {
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

    getSpecialHints(): stirng[] {
        let pool = [];
        return pool;
    }

    setSpecialHints(pool: string[]) {}


    getLastTimestamp(): number {
        return this.lastAttemptTimestamp;
    }

    setLastTimestamp(stamp: number) {
        this.lastAttemptTimestamp = stamp;

        if(this.startTime > this.lastAttemptTimestamp) {
            this.restartEvent();
        }
    }

    getMultiplayerChannel(): number {
        return 0;
    }

    setMultiplayerChannel(id: number) {}

    getLastMultiplayerChannel(): number {
        return 0;
    }

    setLastMultiplayerChannel(id: number) {}

    getIsTutorialComplete(): boolean {
        return this.isTutorialComplete;
    }

    setIsTutorialComplete(isTutorialComplete: boolean) {
        this.isTutorialComplete = isTutorialComplete;
    }

    getPlayerPlace(): number {
        return 0;
    }

    setPlayerPlace(place: number) {}

    getCompletedCollections(): string[] {
        return [];
    }

    setCompletedCollections(collections: string[]) {}

    getIsTotalRewardTaken() {
        return false;
    }

    setIsTotalRewardTaken(isTaken: boolean) {}

    getTakenRewards(): number[] {
        return [];
    }

    setTakenRewards(rewards: number[]) {}

    getTakenRewards_Premium(): number[] {
        return [];
    }

    setTakenRewards_Premium(rewards: number[]) {}

    getIsRewardPicked(): boolean[] {
        return [];
    }

    setIsRewardPicked(isPicked: boolean[]) {}

    getUnpickedRewards(): EventRewardData[] {
        return this.unpickedRewards;
    }

    setUnpickedRewards(rewards: EventRewardData[]) {
        this.unpickedRewards = rewards;
    }


    applyRewards(rewards: EventRewardData[]) {
        for(let i = 0; i < rewards.length; i++) {
            this.applyReward(rewards[i]);
        }
    }

    applyReward(reward: EventRewardData) {
        UserData.instance.addResource("gold", reward.gold);

        UserData.instance.addResource("bomb", reward.startBonus_Bomb);
        UserData.instance.addResource("rocket", reward.startBonus_Rocket);
        UserData.instance.addResource("discoball", reward.startBonus_Discoball);

        UserData.instance.addResource("hammer", reward.booster_Hammer);
        UserData.instance.addResource("bow", reward.booster_Bow);
        UserData.instance.addResource("cannon", reward.booster_Cannon);
        UserData.instance.addResource("jester", reward.booster_Jester);

        UserData.instance.addResource("bomb_minutes", reward.bomb_Minutes);
        UserData.instance.addResource("rocket_minutes", reward.rocket_Minutes);
        UserData.instance.addResource("discoball_minutes", reward.discoball_Minutes);
        UserData.instance.addResource("endless_lives_minutes", reward.endlessLives_Minutes);
        UserData.instance.addResource("modifier_x2_minutes", reward.modifierX2_Minutes);

        let cards = UserData.instance.openCardsPack(reward.cardsPack);
        reward.cards = [];
        for(let i = 0; i < cards.length; i++) {
            reward.cards.push(cards[i]);
        }

        if(reward.isChest) {
            gamepush.player.add('stat_chests_open', 1);
        }

        this.node.emit("reward", reward);
    }


    completeTutorial() {
        this.isTutorialComplete = true;

        SaveData.instance.saveEvent(this.eventId);
    }


    isRewardAvailable(): boolean {
        return false;
    }


    isInteractable(): boolean {
        return this.isEventAvailable();
    }


    getBots(): PlayerEventData[] {
        return [];
    }

    setBots(bots: PlayerEventData[]) {}


    getIsPositionUpdated(): boolean {
        return false;
    }

    resetPositionUpdated() {
        this.isPositionUpdated = false;
    }
}


