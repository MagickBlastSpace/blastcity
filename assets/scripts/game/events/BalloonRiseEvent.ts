import { _decorator, Component, Node } from 'cc';
import { TeamTreasureEvent } from './team/TeamTreasureEvent';
import { SaveData } from '../../data/SaveData';
import { PlayerEventData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('BalloonRiseEvent')
export class BalloonRiseEvent extends TeamTreasureEvent {

    private hp: number = 0;


    start() {
        super.start();

        this.level.on("fail", () => this.handleLevelFail());
    }


    initWeekly(startDayOfWeek: number, startHourUTC: number, durationDays: number) {
        super.initWeekly(startDayOfWeek, startHourUTC, durationDays);

        this.currentStep = 0;
        this.hp = 3;

        this.eventId = "balloon_rise";
    }


    sortTeamsByProgress(): PlayerEventData[] {
        let sortedTeams = [];
        return sortedTeams;
    }
    
    sortPlayersByProgress(): PlayerEventData[] {
        let sortedPlayers = [];
        return sortedPlayers;
    }


    getHp(): number {
        return this.hp;
    }

    setHp(newHp: number) {
        if(!newHp || newHp === undefined) {
            this.hp = 3;
            return;
        }
        
        this.hp = newHp;
    }


    handleLevelFail() {
        this.hp--;

        if(this.hp <= 0) {
            this.currentStep = this.getCheckpoint();
            this.hp = 3;
        }

        SaveData.instance.saveEvent(this.eventId);
    }


    getCheckpoint(): number {
        let checkPoint = 0;

        for(let i = 0; i < this.rewards.length; i++) {
            if(this.currentStep >= this.rewards[i].progress) {
                checkPoint = this.rewards[i].progress;
            }
        }

        return checkPoint;
    }


    getTotalTeamProgress(): number {
        return this.currentStep;
    }
}


