import { _decorator, Component, Node } from 'cc';
import { KingsCupEvent } from '../competitive/KingsCupEvent';
import { EventRewardData } from '../../../data/EventData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('TeamTreasureEvent')
export class TeamTreasureEvent extends KingsCupEvent {

    @property([EventRewardData])
    rewards: EventRewardData[] = [];

    private isRewardPicked: boolean[] = [];


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isRewardPicked = [];
        for(let i = 0; i < this.rewards.length; i++) {
            this.isRewardPicked.push(false);
        }
        
        this.eventId = "team_treasure";
    }


    getTotalTeamProgress(): number {
        let totalTeamProgress = 0;
        let playerData = this.sortPlayersByProgress();
        for(let i = 0; i < playerData.length; i++) {
            totalTeamProgress += playerData[i].progressValue;
        }

        return totalTeamProgress;
    }


    getRewardsData(): EventRewardData[] {
        return this.rewards;
    }

    getIsRewardPicked(): boolean[] {
        return this.isRewardPicked;
    }

    pickReward(rewardIndex: number) {
        UserData.instance.addResource("gold", this.rewards[rewardIndex].gold);
        //all rewards TBD

        this.isRewardPicked[rewardIndex] = true;
    }
}


