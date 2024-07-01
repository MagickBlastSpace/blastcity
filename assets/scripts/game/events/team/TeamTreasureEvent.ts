declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { EventRewardData } from '../../../data/EventData';
import { UserData } from '../../../data/UserData';
import { SaveData } from '../../../data/SaveData';
import { TeamEventBase } from './TeamEventBase';
const { ccclass, property } = _decorator;

@ccclass('TeamTreasureEvent')
export class TeamTreasureEvent extends TeamEventBase {

    @property([EventRewardData])
    rewards: EventRewardData[] = [];

    @property([EventRewardData])
    playersPlaceRewards: EventRewardData[] = [];

    private isRewardPicked: boolean[] = [];


    start() {
        this.level.on("complete", (isComplete) => this.handleLevelCompletion(isComplete));
    }

    
    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;

        this.isStarted = false;

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
        this.applyReward(this.rewards[rewardIndex]);

        this.isRewardPicked[rewardIndex] = true;
    }


    private handleLevelCompletion(isComplete: boolean) {
        if(!this.isEventAvailable() || !isComplete || !this.canParticipate()) {
            return;
        }

        this.currentStep = this.currentStep + 1;

        gamepush.player.set('score_team_treasure', this.currentStep);
        gamepush.player.sync();

        SaveData.instance.saveEvent(this.eventId);
    }


    restartEvent(): void {
        let playerPlace = this.players.findIndex(player => player.playerName === UserData.instance.getPlayerName()); //TBD correctly
        if(playerPlace) {
            if(playerPlace > -1 && playerPlace < 3) {
                this.applyReward(this.playersPlaceRewards[playerPlace]);
            }
        }

        super.restartEvent();
    }
}


