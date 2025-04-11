import { _decorator, Component, Node } from 'cc';
import { WeeklyEventBase } from './WeeklyEventBase';
import { SaveData } from '../../data/SaveData';
import { Shop } from '../Shop';
import { ShopItemData } from '../../data/GameData';
import { Clans } from '../Clans';
import { EventRewardData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('ClanGiftEvent')
export class ClanGiftEvent extends WeeklyEventBase {

    @property(Shop)
    shop: Shop;

    @property(Clans)
    clans: Clans;

    private takenRewards: number[] = [];


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.isStarted = true;
        this.isComplete = false;

        this.eventId = "clan_gift";
    }


    isRewardTaken(index: number): boolean {
        return this.takenRewards.includes(index);
    }
    
    async takeReward(data: ShopItemData, index: number) {
        if (this.takenRewards.includes(index)) {
            return;
        }
    
        const isSuccess = await this.shop.buy(data);
    
        if (!isSuccess) {
            console.warn("Покупка не прошла. Награда не выдана.");
            return;
        }
    
        this.takenRewards.push(index);
    
        if (this.lastAttemptTimestamp === 0) {
            this.lastAttemptTimestamp = Date.now();
        }
    
        if (this.takenRewards.length >= 3) {
            this.isComplete = true;
        }
    
        SaveData.instance.saveEvent(this.eventId);

        let reward = new EventRewardData();
        reward.booster_Bow = data.booster_Bow;
        reward.booster_Hammer = data.booster_Hammer;
        reward.booster_Cannon = data.booster_Cannon;
        reward.booster_Jester = data.booster_Jester;
        reward.bomb_Minutes = data.bonuses_Minutes;
        reward.rocket_Minutes = data.bonuses_Minutes;
        reward.discoball_Minutes = data.bonuses_Minutes;
        reward.endlessLives_Minutes = data.endlessLives_Minutes;
        reward.gold = data.gold;

        this.node.emit("reward", reward);
    
        this.node.emit("refresh");
    }
    


    isInteractable(): boolean {
        if(!this.isEventAvailable()) {
            return false;
        }

        if(!this.clans.isJoined()) {
            return false;
        }

        if(this.isComplete) {
            return false;
        }

        return true;
    }


    getTakenRewards(): number[] {
        return this.takenRewards;
    }

    setTakenRewards(rewards: number[]) {
        this.takenRewards = rewards;
    }


    restartEvent(): void {
        this.lastAttemptTimestamp = 0;

        this.takenRewards = [];

        this.initWeekly(this.startDayOfWeek, this.startTime.getUTCHours(), this.getEventDuration() / 24);

        SaveData.instance.saveEvent(this.eventId);
    }
}


